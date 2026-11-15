#!/usr/bin/env python3
"""Free-source parking evidence audit. Python 3.10+, standard library only.

Pillow is optional for assembling the County's cached JPEG tiles.
No detector or vacancy forecast is implemented. Catalog datetimes are never
treated as verified flight times. Source failures remain distinct from no data.
"""
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import io
import json
import math
from pathlib import Path
import re
import ssl
import struct
import urllib.error
import urllib.parse
import urllib.request

STAC = 'https://planetarycomputer.microsoft.com/api/stac/v1'
CDFW = 'https://gis.wildlife.ca.gov/images/rest/services/Base_Remote_Sensing/NAIP_2022/ImageServer'
COUNTY = 'https://gis.slocounty.ca.gov/arcgis/rest/services/AERIALS/2014_Combined_WGSWMAS/MapServer'
OAM = 'https://api.openaerialmap.org/meta'
DEFAULT_BBOX = [-120.70, 35.25, -120.62, 35.34]
AREAS_FILE = Path(__file__).with_name('areas.json')


def url(base, **params):
    return base + '?' + urllib.parse.urlencode(params)


def fetch_bytes(address):
    req = urllib.request.Request(address, headers={'User-Agent': 'CampusCurb-research/0.1'})
    with urllib.request.urlopen(req, timeout=35) as response:
        data = response.read(20_000_001)
    if len(data) > 20_000_000:
        raise ValueError('Response exceeded the bounded research download limit')
    return data


def fetch_json(address):
    data = json.loads(fetch_bytes(address))
    if not isinstance(data, dict) or data.get('error'):
        raise ValueError('Source returned an error or unexpected JSON object')
    return data


def save_json(path, data):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


def validate_bbox(values):
    if (len(values) != 4 or not all(math.isfinite(x) for x in values)
            or not -180 <= values[0] < values[2] <= 180
            or not -85 <= values[1] < values[3] <= 85):
        raise ValueError('bbox must be west south east north in WGS84')
    return values


def inside_ring(point, ring):
    x, y = point
    inside = False
    if len(ring) < 4:
        return False
    for a, b in zip(ring, ring[1:] + ring[:1]):
        if (a[1] > y) != (b[1] > y):
            cross = (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]
            if x < cross:
                inside = not inside
    return inside


def covers_point(feature, point):
    geometry = feature.get('geometry') or {}
    kind, coordinates = geometry.get('type'), geometry.get('coordinates', [])
    polygons = [coordinates] if kind == 'Polygon' else coordinates if kind == 'MultiPolygon' else []
    return any(rings and inside_ring(point, rings[0])
               and not any(inside_ring(point, hole) for hole in rings[1:])
               for rings in polygons)


def capture_date(identifier):
    # NAIP filenames contain acquisition date followed, sometimes, by processing date.
    dates = re.findall(r'(?:^|_)((?:19|20)\d{6})(?=_|\.|$)', identifier)
    if not dates:
        raise ValueError('No acquisition date in NAIP identifier')
    return dt.datetime.strptime(dates[0], '%Y%m%d').date().isoformat()


def search_naip(bbox, getter=fetch_json):
    address = url(STAC + '/search', collections='naip', bbox=','.join(map(str, bbox)), limit=1000)
    items, seen = {}, set()
    for _ in range(25):
        if address in seen:
            raise ValueError('Catalog pagination loop')
        seen.add(address)
        data = getter(address)
        if data.get('type') != 'FeatureCollection' or not isinstance(data.get('features'), list):
            raise ValueError('Catalog response was not a FeatureCollection')
        for feature in data['features']:
            if feature.get('collection') not in (None, 'naip') or not feature.get('id'):
                raise ValueError('Unexpected collection or missing item identity')
            items[feature['id']] = feature
        next_links = [link for link in data.get('links', []) if link.get('rel') == 'next']
        if not next_links:
            return list(items.values())
        link = next_links[0]
        if link.get('method', 'GET') != 'GET' or not link.get('href', '').startswith(STAC + '/'):
            raise ValueError('Unsupported catalog continuation')
        address = link['href']
    raise ValueError('Catalog result exceeded the bounded page limit')


def summarize(items, areas):
    records = []
    for item in items:
        props = item.get('properties', {})
        records.append({
            'id': item['id'], 'acquisition_date': capture_date(item['id']),
            'catalog_datetime': props.get('datetime'),
            'capture_time_verified': False,
            'time_precision': 'acquisition date only; clock time unverified',
            'native_gsd_m': props.get('gsd'),
            'item_url': STAC + '/collections/naip/items/' + item['id'],
            'areas_covered_at_center': [a['id'] for a in areas if covers_point(item, a['center'])],
        })
    by_date = {}
    for record in records:
        day = record['acquisition_date']
        by_date.setdefault(day, {'date': day, 'tile_count': 0, 'native_gsd_m': []})
        by_date[day]['tile_count'] += 1
        gsd = record['native_gsd_m']
        if gsd not in by_date[day]['native_gsd_m']:
            by_date[day]['native_gsd_m'].append(gsd)
    coverage = []
    for area in areas:
        matching = [r for r in records if area['id'] in r['areas_covered_at_center']]
        coverage.append({**area, 'tile_count': len(matching),
                         'distinct_dates': sorted({r['acquisition_date'] for r in matching}),
                         'verified_capture_times': 0})
    return {'tile_count': len(records), 'distinct_dates': sorted(by_date.values(), key=lambda r:r['date']),
            'area_coverage': coverage, 'items': records,
            'forecast': {'status':'not_available', 'probability':None,
                         'reason':'No validated demand model, verified flight times, or local occupancy labels.'}}


def failure_message(error):
    # Do not serialize arbitrary error text, request headers, or access tokens.
    if isinstance(error, urllib.error.HTTPError):
        return f'HTTP {error.code}'
    if isinstance(error, urllib.error.URLError) and isinstance(error.reason, ssl.SSLCertVerificationError):
        return 'TLS certificate verification failed'
    return type(error).__name__


def audit(output, bbox, areas, as_of):
    output.mkdir(parents=True, exist_ok=True)
    tasks = {
        'naip': lambda: search_naip(bbox),
        'naip_collection': lambda: fetch_json(STAC + '/collections/naip'),
        'openaerialmap': lambda: fetch_json(url(OAM, bbox=','.join(map(str,bbox)), limit=100)),
    }
    results, failures = {}, {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        pending = {pool.submit(fn): name for name, fn in tasks.items()}
        for future in concurrent.futures.as_completed(pending):
            name = pending[future]
            try:
                results[name] = future.result()
            except Exception as error:
                failures[name] = failure_message(error)
    for name, result in results.items():
        save_json(output / 'raw' / (name + '.json'), result)
    report = {'checked_on':as_of, 'bbox_wgs84':bbox, 'source_errors':failures,
              'naip_status':'source_error' if 'naip' in failures else 'ok',
              'naip':summarize(results['naip'], areas) if 'naip' in results else None}
    collection = results.get('naip_collection', {})
    report['licensing'] = {
        'catalog_license_label':collection.get('license'),
        'pc_imagery_downloaded':False,
        'note':'Catalog access is anonymous. Free access is not a substitute for asset-specific rights review. Sample imagery uses separately documented CDFW/County services.',
        'usda_policy':'https://www.fpacbc.usda.gov/geospatial-services/customer-services',
    }
    oam = results.get('openaerialmap')
    if oam is not None:
        if not isinstance(oam.get('results'), list) or not isinstance(oam.get('meta'), dict):
            raise ValueError('Unexpected OpenAerialMap response')
        report['openaerialmap'] = {'found':oam['meta'].get('found'),
                                 'scope':'This bbox and catalog at this check only', 'endpoint':OAM}
    save_json(output / 'audit.json', report)
    return report


def projected_bbox(area):
    lon, lat = area['center']
    x = 6378137 * math.radians(lon)
    y = 6378137 * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
    half = area['span_m'] / math.cos(math.radians(lat)) / 2
    return [x-half,y-half,x+half,y+half]


def validate_png(data):
    if not data.startswith(b'\x89PNG\r\n\x1a\n') or len(data) < 33 or data[12:16] != b'IHDR':
        raise ValueError('Source returned a non-PNG response')
    width, height = struct.unpack('>II', data[16:24])
    if not (1 <= width <= 4096 and 1 <= height <= 4096):
        raise ValueError('Unexpected image dimensions')
    return width, height


def county_cached_crop(area):
    """Read a bounded portion of the County's advertised tile cache.

    County dynamic exports can fail while the cache still works. Do not describe
    cache resampling or the service's mixed 6-inch/1-foot sources as extra detail.
    """
    from PIL import Image
    metadata = fetch_json(COUNTY + '?f=json')
    info = metadata.get('tileInfo') or {}
    lod = next((r for r in info.get('lods', []) if r.get('level') == 19), None)
    if not lod:
        raise ValueError('County cache level unavailable')
    resolution, tile_width, tile_height = lod['resolution'], info['cols'], info['rows']
    origin, bbox = info['origin'], projected_bbox(area)
    left = (bbox[0] - origin['x']) / resolution
    right = (bbox[2] - origin['x']) / resolution
    top = (origin['y'] - bbox[3]) / resolution
    bottom = (origin['y'] - bbox[1]) / resolution
    col0, col1 = math.floor(left/tile_width), math.ceil(right/tile_width)-1
    row0, row1 = math.floor(top/tile_height), math.ceil(bottom/tile_height)-1
    count = (col1-col0+1)*(row1-row0+1)
    if count > 64 or right-left > 2048 or bottom-top > 2048:
        raise ValueError('County sample exceeded the bounded tile request limit')
    canvas = Image.new('RGB',((col1-col0+1)*tile_width,(row1-row0+1)*tile_height))
    for row in range(row0,row1+1):
        for col in range(col0,col1+1):
            data = fetch_bytes(f'{COUNTY}/tile/19/{row}/{col}')
            with Image.open(io.BytesIO(data)) as tile:
                if tile.size != (tile_width,tile_height):
                    raise ValueError('Unexpected County tile dimensions')
                canvas.paste(tile.convert('RGB'),((col-col0)*tile_width,(row-row0)*tile_height))
    crop = canvas.crop((round(left-col0*tile_width),round(top-row0*tile_height),
                        round(right-col0*tile_width),round(bottom-row0*tile_height)))
    buffer = io.BytesIO()
    crop.save(buffer,format='PNG')
    return buffer.getvalue(), {'method':'County published tile cache; no sharpening or upscaling',
                              'cache_level':19,'cache_tile_count':count,
                              'cache_bounds':{'row_min':row0,'row_max':row1,'col_min':col0,'col_max':col1},
                              'web_mercator_m_per_pixel':resolution,
                              'native_resolution_note':'Service contains 6-inch and 1-foot sources; cache pixel size is not verified native image resolution.'}


def get_sample(area, provider, destination):
    bbox = projected_bbox(area)
    common = dict(bbox=','.join(map(str,bbox)), bboxSR=3857, imageSR=3857,
                  size='1024,1024' if provider=='county2014' else '512,512', f='image')
    if provider == 'cdfw2022':
        geometry = {'xmin':bbox[0],'ymin':bbox[1],'xmax':bbox[2],'ymax':bbox[3],
                    'spatialReference':{'wkid':3857}}
        query = url(CDFW + '/query', geometry=json.dumps(geometry),
                    geometryType='esriGeometryEnvelope', spatialRel='esriSpatialRelIntersects',
                    where='Category = 1', outFields='OBJECTID,Name,LowPS,Category',
                    returnGeometry='false', f='json')
        catalog = fetch_json(query)
        features = catalog.get('features')
        if not isinstance(features, list) or not features:
            raise ValueError('No catalog-backed raster for this sample')
        attributes = [f['attributes'] for f in features]
        ids = [a['OBJECTID'] for a in attributes]
        address = url(CDFW + '/exportImage', **common, format='png', adjustAspectRatio='false',
                      mosaicRule=json.dumps({'mosaicMethod':'esriMosaicLockRaster','lockRasterIds':ids,'ascending':True}))
        provenance = {'raster_names':[a['Name'] for a in attributes],
                      'acquisition_dates':sorted({capture_date(a['Name']) for a in attributes}),
                      'native_gsd_m':sorted({a['LowPS'] for a in attributes}),
                      'rights':'CC BY / no restrictions on public use in California catalog',
                      'rights_url':'https://publish.data.ca.gov/dataset/naip-2022-60cm-california',
                      'credit':'USDA NAIP 2022 / California Department of Fish and Wildlife'}
    else:
        address = COUNTY
        provenance = {'collection_year':2014, 'acquisition_month':'2014-06',
                      'acquisition_date':None,
                      'rights':'County explicitly places its 2014 aerial imagery in the public domain',
                      'rights_url':'https://www.slocounty.ca.gov/departments/information-technology/services/gis-services/gis-aerial-imagery',
                      'credit':'San Luis Obispo County / SLOCOG / Sanborn, 2014'}
    if provider == 'county2014':
        data, cache_provenance = county_cached_crop(area)
        provenance.update(cache_provenance)
    else:
        data = fetch_bytes(address)
    width, height = validate_png(data)
    filename = area['id'] + '-' + provider + '.png'
    (destination / filename).write_bytes(data)
    return {'id':area['id']+'-'+provider, 'area_id':area['id'], 'file':filename,
            'area_role':area['role'], 'bbox_epsg3857':bbox,
            'dimensions':[width,height], 'approx_ground_m_per_output_pixel':area['span_m']/width,
            'capture_time_verified':False, 'source_url':address, 'provenance':provenance,
            'sha256':hashlib.sha256(data).hexdigest(),
            'visible_vehicle_count':None, 'verified_legal_capacity':None,
            'note':'Rendered source crop for visibility/labeling research. Output pixel size does not improve native resolution. No vehicle detector has run.'}


def samples(output, areas):
    output.mkdir(parents=True, exist_ok=True)
    manifest = {'samples':[], 'source_errors':[]}
    previous = output/'manifest.json'
    cached = {}
    if previous.exists():
        for sample in json.loads(previous.read_text()).get('samples',[]):
            filename = sample.get('file','')
            if filename and Path(filename).name == filename and (output/filename).is_file():
                if hashlib.sha256((output/filename).read_bytes()).hexdigest() == sample.get('sha256'):
                    cached[sample.get('id')] = sample
    requested = []
    requested_ids = {a['id']+'-'+p for a in areas for p in ['county2014','cdfw2022']}
    manifest['samples'].extend(s for key,s in cached.items() if key not in requested_ids)
    for area in areas:
        for provider in ['county2014','cdfw2022']:
            key = area['id']+'-'+provider
            sample = cached.get(key)
            if sample and sample.get('bbox_epsg3857') == projected_bbox(area):
                manifest['samples'].append({**sample,'reused_cached_sample':True})
            else:
                requested.append((area,provider))
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        pending = {pool.submit(get_sample, area, provider, output):(area['id'],provider)
                   for area,provider in requested}
        for future in concurrent.futures.as_completed(pending):
            area, provider = pending[future]
            try:
                manifest['samples'].append(future.result())
            except Exception as error:
                manifest['source_errors'].append({'area_id':area,'provider':provider,'error':failure_message(error)})
    manifest['samples'].sort(key=lambda s:s['id'])
    save_json(output/'manifest.json',manifest)
    return manifest


def assess(observations):
    if not isinstance(observations, list):
        raise ValueError('Observations must be a JSON list')
    independent = {}
    for observation in observations:
        for key in ['area_id','sample_id','source_url']:
            if not isinstance(observation.get(key),str) or not observation[key]:
                raise ValueError('Observation missing area, sample identity, or source')
        count = observation.get('visible_vehicle_count')
        if isinstance(count,bool) or not isinstance(count,int) or count < 0:
            raise ValueError('Visible vehicle count must be a non-negative integer')
        if observation.get('method') not in ['human','model']:
            raise ValueError('Observation method must identify human or model')
        if observation.get('capture_time_verified') is True:
            value = dt.datetime.fromisoformat(observation.get('captured_at','').replace('Z','+00:00'))
            if value.tzinfo is None or not observation.get('capture_time_evidence_url'):
                raise ValueError('Verified times require a timezone and evidence URL')
        key = (observation['area_id'],observation['sample_id'])
        if key in independent:
            raise ValueError('Duplicate sample is not an independent observation')
        independent[key] = observation
    return {'labeled_samples':len(independent),
            'verified_capture_times':sum(o.get('capture_time_verified') is True for o in observations),
            'human_labels':sum(o['method']=='human' for o in observations),
            'model_labels':sum(o['method']=='model' for o in observations),
            'forecast':{'status':'not_available','probability':None,
                        'reason':'Counts are observations, not a validated forecast. Need representative repeated surveys, matched capacity, and held-out validation.'},
            'permission':{'status':'unknown','reason':'Vehicle detections do not establish parking permission.'}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subs = parser.add_subparsers(dest='command',required=True)
    a = subs.add_parser('audit',help='Query free NAIP/OAM metadata and distinguish tiles from capture dates')
    a.add_argument('--out',type=Path,required=True)
    a.add_argument('--bbox',type=float,nargs=4,default=DEFAULT_BBOX)
    a.add_argument('--as-of',default=dt.date.today().isoformat())
    s = subs.add_parser('samples',help='Download bounded, credited County/CDFW crops; County assembly requires Pillow')
    s.add_argument('--out',type=Path,required=True)
    s.add_argument('--area',action='append',help='Optional area ID; repeat to select multiple')
    v = subs.add_parser('assess',help='Validate sourced counts without inventing availability')
    v.add_argument('--observations',type=Path,required=True)
    args = parser.parse_args()
    try:
        areas = json.loads(AREAS_FILE.read_text())
        if args.command == 'audit':
            dt.date.fromisoformat(args.as_of)
            result = audit(args.out,validate_bbox(args.bbox),areas,args.as_of)
            summary = result.get('naip') or {}
            print(json.dumps({'status':result['naip_status'],'tiles':summary.get('tile_count'),
                              'distinct_capture_dates':len(summary.get('distinct_dates',[])),
                              'openaerialmap':result.get('openaerialmap'),'source_errors':result['source_errors'],
                              'saved':str(args.out/'audit.json')},indent=2))
            return 1 if result['source_errors'] else 0
        if args.command == 'samples':
            selected = [a for a in areas if not args.area or a['id'] in args.area]
            if not selected or args.area and set(args.area)-{a['id'] for a in areas}:
                raise ValueError('Unknown area ID')
            result = samples(args.out,selected)
            print(json.dumps({'available_samples':len(result['samples']),'source_errors':result['source_errors'],
                              'saved':str(args.out/'manifest.json')},indent=2))
            return 1 if result['source_errors'] else 0
        print(json.dumps(assess(json.loads(args.observations.read_text())),indent=2))
        return 0
    except (ValueError,OSError,KeyError,TypeError) as error:
        parser.exit(2,'Research command failed: '+failure_message(error)+'\n')


if __name__ == '__main__':
    raise SystemExit(main())
