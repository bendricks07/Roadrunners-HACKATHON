"""Offline checks use synthetic fixtures, never observations about SLO parking."""
import unittest
import hashlib
import json
from pathlib import Path
import tempfile
from unittest.mock import patch
from research import (assess, capture_date, covers_point, search_naip, summarize,
                      validate_bbox, validate_png, projected_bbox, samples)


def feature(name='ca_m_3512043_se_10_060_20220519_20220908'):
    return {'id':name,'type':'Feature','collection':'naip',
            'properties':{'datetime':'2022-05-19T16:00:00Z','gsd':0.6},
            'geometry':{'type':'Polygon','coordinates':[[[0,0],[2,0],[2,2],[0,2],[0,0]]]}}


class EvidenceTests(unittest.TestCase):
    def test_processing_date_is_not_acquisition_date(self):
        self.assertEqual(capture_date(feature()['id']),'2022-05-19')

    def test_tiles_are_not_independent_capture_dates(self):
        items=[feature(),feature('ca_m_3512043_sw_10_060_20220519')]
        result=summarize(items,[{'id':'synthetic-area','center':[1,1]}])
        self.assertEqual(result['tile_count'],2)
        self.assertEqual(len(result['distinct_dates']),1)
        self.assertEqual(len(result['area_coverage'][0]['distinct_dates']),1)

    def test_catalog_clock_does_not_become_verified_flight_time(self):
        result=summarize([feature()],[])
        self.assertFalse(result['items'][0]['capture_time_verified'])
        self.assertIsNone(result['forecast']['probability'])

    def test_tile_polygon_hole_is_not_coverage(self):
        f=feature()
        f['geometry']['coordinates'].append([[.5,.5],[1.5,.5],[1.5,1.5],[.5,1.5],[.5,.5]])
        self.assertFalse(covers_point(f,[1,1]))
        self.assertTrue(covers_point(f,[.2,.2]))

    def test_paginated_duplicate_tile_is_counted_once(self):
        calls=[]
        def getter(address):
            calls.append(address)
            return {'type':'FeatureCollection','features':[feature()],
                    'links':[{'rel':'next','href':'https://planetarycomputer.microsoft.com/api/stac/v1/search?page=2'}] if len(calls)==1 else []}
        self.assertEqual(len(search_naip([0,0,2,2],getter)),1)
        self.assertEqual(len(calls),2)

    def test_catalog_error_is_not_empty_coverage(self):
        with self.assertRaises(ValueError):
            search_naip([0,0,2,2],lambda _: {'error':{'message':'unavailable'}})

    def test_bbox_rejects_inverted_and_non_finite_coordinates(self):
        for bbox in ([2,0,1,2],[0,0,float('nan'),2],[0,-90,1,1]):
            with self.assertRaises(ValueError): validate_bbox(bbox)

    def test_json_error_cannot_be_saved_as_imagery(self):
        with self.assertRaises(ValueError): validate_png(b'{"error":"unavailable"}')

    def test_zero_cars_is_not_a_forecast_or_permission(self):
        result=assess([{'area_id':'synthetic','sample_id':'synthetic-image',
                       'source_url':'https://example.com/synthetic','visible_vehicle_count':0,'method':'human'}])
        self.assertEqual(result['labeled_samples'],1)
        self.assertIsNone(result['forecast']['probability'])
        self.assertEqual(result['permission']['status'],'unknown')

    def test_duplicate_count_does_not_inflate_evidence(self):
        record={'area_id':'synthetic','sample_id':'synthetic-image','source_url':'https://example.com/synthetic',
                'visible_vehicle_count':5,'method':'human'}
        with self.assertRaises(ValueError): assess([record,record])

    def test_verified_clock_requires_timezone_and_evidence(self):
        record={'area_id':'synthetic','sample_id':'synthetic-image','source_url':'https://example.com/synthetic',
                'visible_vehicle_count':5,'method':'human','capture_time_verified':True,
                'captured_at':'2022-05-19T09:00:00'}
        with self.assertRaises(ValueError): assess([record])

    def test_boolean_is_not_a_vehicle_count(self):
        with self.assertRaises(ValueError):
            assess([{'area_id':'synthetic','sample_id':'synthetic-image','source_url':'https://example.com/synthetic',
                     'visible_vehicle_count':True,'method':'model'}])

    def test_valid_cached_sample_is_reused_without_network(self):
        area={'id':'synthetic','center':[1,1],'span_m':50}
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            image=b'synthetic previously verified sample'
            (root/'synthetic-county2014.png').write_bytes(image)
            record={'id':'synthetic-county2014','file':'synthetic-county2014.png',
                    'bbox_epsg3857':projected_bbox(area),'sha256':hashlib.sha256(image).hexdigest()}
            (root/'manifest.json').write_text(json.dumps({'samples':[record]}))
            with patch('research.get_sample',side_effect=OSError('synthetic network failure')) as fetch:
                result=samples(root,[area])
            self.assertEqual(fetch.call_count,1)
            self.assertTrue(result['samples'][0]['reused_cached_sample'])
            self.assertEqual(len(result['source_errors']),1)

    def test_changed_cached_sample_is_not_trusted(self):
        area={'id':'synthetic','center':[1,1],'span_m':50}
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/'synthetic-county2014.png').write_bytes(b'changed')
            record={'id':'synthetic-county2014','file':'synthetic-county2014.png',
                    'bbox_epsg3857':projected_bbox(area),'sha256':hashlib.sha256(b'original').hexdigest()}
            (root/'manifest.json').write_text(json.dumps({'samples':[record]}))
            with patch('research.get_sample',side_effect=OSError('synthetic network failure')) as fetch:
                result=samples(root,[area])
            self.assertEqual(fetch.call_count,2)
            self.assertEqual(result['samples'],[])

    def test_subset_refresh_preserves_other_valid_provenance(self):
        area={'id':'selected','center':[1,1],'span_m':50}
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            data=b'synthetic other source'
            (root/'other.png').write_bytes(data)
            record={'id':'other-county2014','file':'other.png','bbox_epsg3857':[0,0,1,1],
                    'sha256':hashlib.sha256(data).hexdigest()}
            (root/'manifest.json').write_text(json.dumps({'samples':[record]}))
            with patch('research.get_sample',side_effect=OSError('synthetic network failure')):
                result=samples(root,[area])
            self.assertEqual(result['samples'],[record])


if __name__=='__main__': unittest.main()
