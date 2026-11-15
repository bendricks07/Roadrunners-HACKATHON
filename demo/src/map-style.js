// Original CampusCurb styling over OpenMapTiles / OpenStreetMap vector data.
// Imagery is historical aerial photography, never a live vacancy feed.
export const NAIP_SERVICE = 'https://gis.wildlife.ca.gov/images/rest/services/Base_Remote_Sensing/NAIP_2022/ImageServer';
export const NAIP_TILE = NAIP_SERVICE + '/exportImage?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857&size=512%2C512&format=jpg&f=image&interpolation=RSP_BilinearInterpolation&compressionQuality=90';
export const NEIGHBORHOOD_VIEW = [[-120.6742, 35.2864], [-120.6461, 35.3102]];
export const PHONE_VIEW = [[-120.6676, 35.2885], [-120.6481, 35.3067]];
export const PARKING_CREDIT = 'Parking geometry: <a href="https://maps.calpoly.edu/">Cal Poly</a> / <a href="https://maps.slocity.org/">City of SLO GIS</a>';
const zoom = (...stops) => ['interpolate', ['linear'], ['zoom'], ...stops];

export function mapStyle(view = 'satellite') {
  const dark = view === 'dark', aerial = view === 'satellite', topo = view === 'terrain';
  const colors = dark
    ? { ground: '#192533', residential: '#1e2a39', park: '#203e33', wood: '#20382f', water: '#122e46', building: '#303f50', road: '#45566a', major: '#5a6a7d', edge: '#17212d', text: '#d5dde7', halo: '#1c2938', path: '#3f504a' }
    : { ground: '#eef0e9', residential: '#eceee8', park: '#cee1c8', wood: '#c2d6bd', water: '#b7d9ed', building: '#d9ddd5', road: '#fffefa', major: '#fffefa', edge: '#d9ddd5', text: '#56616b', halo: '#f2f3ec', path: '#c1cdbd' };
  const sources = {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: '<a href="https://openfreemap.org/">OpenFreeMap</a> · © <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
    campus: { type: 'geojson', data: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [-120.6598, 35.3027] }, properties: {} }] } },
  };
  const layers = [{ id: 'background', type: 'background', paint: { 'background-color': colors.ground } }];
  if (aerial) {
    sources.aerial = { type: 'raster', tiles: [NAIP_TILE], tileSize: 512, minzoom: 10, maxzoom: 17, bounds: [-124.44, 32.49, -114.12, 42.08], attribution: 'Imagery: USDA NAIP (2022) · <a href="https://wildlife.ca.gov/Data/GIS/Map-Services">CDFW</a> · historical aerial' };
    layers.push({ id: 'aerial', type: 'raster', source: 'aerial', paint: { 'raster-saturation': -.12, 'raster-contrast': .06, 'raster-fade-duration': 250 } });
  } else if (topo) {
    sources.topo = { type: 'raster', tiles: ['https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 16, attribution: 'USGS The National Map' };
    layers.push({ id: 'topo', type: 'raster', source: 'topo' });
  } else {
    const fill = (id, sourceLayer, color, filter) => ({ id, type: 'fill', source: 'openmaptiles', 'source-layer': sourceLayer, ...(filter ? { filter } : {}), paint: { 'fill-color': color } });
    layers.push(
      fill('residential', 'landuse', colors.residential, ['==', ['get', 'class'], 'residential']),
      fill('wood', 'landcover', colors.wood, ['in', ['get', 'class'], ['literal', ['wood', 'grass']]]),
      fill('parks', 'park', colors.park), fill('water', 'water', colors.water),
      { ...fill('buildings', 'building', colors.building), minzoom: 14, paint: { 'fill-color': colors.building, 'fill-opacity': zoom(14, .4, 16, .9) } },
      { id: 'waterways', type: 'line', source: 'openmaptiles', 'source-layer': 'waterway', paint: { 'line-color': colors.water, 'line-width': zoom(12, 1, 17, 3) } },
      { id: 'paths', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['path', 'track']]], paint: { 'line-color': colors.path, 'line-width': zoom(13, .5, 17, 1.5) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'road-casing', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['!', ['in', ['get', 'class'], ['literal', ['path', 'track', 'rail', 'transit']]]], paint: { 'line-color': colors.edge, 'line-width': zoom(12, 2, 15, 5, 18, 19) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['!', ['in', ['get', 'class'], ['literal', ['path', 'track', 'rail', 'transit']]]], paint: { 'line-color': colors.road, 'line-width': zoom(12, 1, 15, 3, 18, 15) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'main-roads', type: 'line', source: 'openmaptiles', 'source-layer': 'transportation', filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'trunk', 'motorway']]], paint: { 'line-color': colors.major, 'line-width': zoom(12, 2, 15, 5, 18, 19) }, layout: { 'line-cap': 'round', 'line-join': 'round' } },
    );
  }
  if (!topo) layers.push({
    id: 'street-labels', type: 'symbol', source: 'openmaptiles', 'source-layer': 'transportation_name', minzoom: 13.8,
    filter: ['!', ['in', ['get', 'class'], ['literal', ['path', 'track', 'rail', 'transit']]]],
    layout: { 'symbol-placement': 'line', 'symbol-spacing': 260, 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': zoom(14, 11, 17, 13), 'text-letter-spacing': .015, 'text-max-angle': 30, 'text-padding': 12 },
    paint: { 'text-color': aerial ? '#fff' : colors.text, 'text-halo-color': aerial ? '#273327' : colors.halo, 'text-halo-width': aerial ? 1.6 : 1.2, 'text-halo-blur': .3 },
  }, {
    id: 'campus-places', type: 'symbol', source: 'openmaptiles', 'source-layer': 'poi', minzoom: 15,
    filter: ['in', ['get', 'class'], ['literal', ['college', 'university', 'library']]],
    layout: { 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 12, 'text-max-width': 9, 'text-padding': 20 },
    paint: { 'text-color': aerial ? '#fff' : colors.text, 'text-halo-color': aerial ? '#273327' : colors.halo, 'text-halo-width': 1.5 },
  });
  if (!topo) layers.push({ id: 'campus-label', type: 'symbol', source: 'campus', minzoom: 13, maxzoom: 16,
    layout: { 'text-field': 'Cal Poly\nSan Luis Obispo', 'text-font': ['Noto Sans Regular'], 'text-size': zoom(13, 17, 15, 21), 'text-line-height': 1.25, 'text-letter-spacing': .02, 'text-padding': 20 },
    paint: { 'text-color': aerial || dark ? '#ffffff' : '#52675c', 'text-halo-color': aerial ? '#263a2d' : colors.halo, 'text-halo-width': 1.8, 'text-halo-blur': .4 },
  });
  return { version: 8, name: `CampusCurb ${view}`, glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf', sources, layers };
}

export function parkingLayers() {
  const layers = [];
    layers.push({ id: 'parking-fill', type: 'fill', source: 'parking', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['case', ['get', 'selected'], .4, ['get', 'recommended'], .34, .22] } });
    layers.push({ id: 'parking-outline', type: 'line', source: 'parking', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'line-color': ['case', ['get', 'locked'], ['get', 'color'], ['get', 'selected'], '#6eafff', ['get', 'recommended'], '#6eafff', ['get', 'color']], 'line-width': ['case', ['get', 'selected'], 3, ['get', 'recommended'], 2.7, 1.4], 'line-opacity': .9 } });
    layers.push({ id: 'street-selection', type: 'line', source: 'parking', filter: ['all', ['==', ['geometry-type'], 'LineString'], ['==', ['get', 'selected'], true]], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['case', ['get', 'locked'], ['get', 'color'], '#429aff'], 'line-width': zoom(13, 8, 16, 16, 19, 25), 'line-opacity': .6 } });
    for (const side of [-1, 1]) layers.push({ id: `curb-${side}`, type: 'line', source: 'parking', filter: ['==', ['geometry-type'], 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': zoom(13, 2, 15, 3, 18, 4.5), 'line-offset': zoom(13, 2 * side, 15, 3.8 * side, 18, 9 * side), 'line-opacity': .95 } });
    layers.push({ id: 'street-hit', type: 'line', source: 'parking', filter: ['==', ['geometry-type'], 'LineString'], paint: { 'line-color': '#000000', 'line-width': 28, 'line-opacity': 0 } });
  return layers;
}
