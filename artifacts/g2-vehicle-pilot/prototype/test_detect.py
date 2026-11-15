import importlib.util
import math
from pathlib import Path
import tempfile
import unittest

import detect


class MatchingTests(unittest.TestCase):
    def test_augmenting_path_avoids_a_greedy_undercount(self):
        pairs = detect.maximum_matches([[1, 0], [0, 0]], [[0, 0], [2, 0]], 1.1)
        self.assertEqual(len(pairs), 2)
        self.assertEqual(len({p['reference_index'] for p in pairs}), 2)

    def test_one_reference_cannot_match_two_predictions(self):
        result = detect.agreement([[0, 0], [0.1, 0]], [[0, 0]], 1)
        self.assertEqual(result['matched'], 1)
        self.assertEqual(result['unmatched_predictions'], 1)

    def test_radius_is_inclusive(self):
        self.assertEqual(len(detect.maximum_matches([[0, 0]], [[3, 4]], 5)), 1)
        self.assertEqual(len(detect.maximum_matches([[0, 0]], [[3, 4]], 4.99)), 0)

    def test_no_predictions_is_not_zero_precision(self):
        result = detect.agreement([], [[0, 0]], 1)
        self.assertIsNone(result['precision_vs_provisional_reference'])
        self.assertEqual(result['recall_vs_provisional_reference'], 0)

    def test_unlabeled_empty_reference_is_not_perfect_recall(self):
        self.assertIsNone(detect.agreement([[0, 0]], [], 1)['recall_vs_provisional_reference'])


class GeometryTests(unittest.TestCase):
    def test_margin_and_uncertainty_use_half_open_rectangles(self):
        self.assertFalse(detect.eligible_center([7, 20], 100, 100, 8, []))
        self.assertTrue(detect.eligible_center([8, 20], 100, 100, 8, []))
        self.assertFalse(detect.eligible_center([92, 20], 100, 100, 8, []))
        self.assertFalse(detect.eligible_center([20, 20], 100, 100, 8, [[20, 20, 30, 30]]))
        self.assertTrue(detect.eligible_center([30, 20], 100, 100, 8, [[20, 20, 30, 30]]))

    def test_non_maximum_suppression_retains_best_duplicate_and_neighbor(self):
        rows = [{'box_xyxy': b, 'score': s} for b, s in [
            ([0, 0, 10, 10], .6), ([1, 1, 11, 11], .9), ([20, 0, 30, 10], .8)]]
        kept = detect.suppress_duplicates(rows)
        self.assertEqual([r['score'] for r in kept], [.9, .8])
        self.assertEqual(detect.box_iou([0, 0, 10, 10], [10, 0, 20, 10]), 0)

    def test_overlapping_tile_interiors_cover_roi_and_fit_image(self):
        window = [384, 246, 601, 492]
        origins = detect.tile_origins(window, 985, 985, 148)
        self.assertEqual(len(origins), len(set(origins)))
        for x, y in origins:
            self.assertTrue(0 <= x <= 985-148 and 0 <= y <= 985-148)
        for y in range(window[1], window[3], 7):
            for x in range(window[0], window[2], 7):
                self.assertTrue(any(detect.eligible_center([x-a, y-b], 148, 148, 148*.08, [])
                                    for a, b in origins), (x, y))

    def test_last_tile_reaches_image_edge(self):
        self.assertIn((52, 52), detect.tile_origins([170, 170, 199, 199], 200, 200, 148))
        with self.assertRaises(ValueError):
            detect.tile_origins([0, 0, 10, 10], 100, 100, 512)

    def test_existing_wrong_model_is_rejected_without_downloading(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'weights.onnx'
            path.write_bytes(b'wrong weights')
            with self.assertRaisesRegex(ValueError, 'checksum'):
                detect.download_model(path)


@unittest.skipUnless(importlib.util.find_spec('numpy') and importlib.util.find_spec('PIL'),
                     'Detector preprocessing tests require requirements-detect.txt')
class ImageTests(unittest.TestCase):
    def test_rgb_scaling_layout_padding_and_global_box_coordinates(self):
        import numpy as np
        from PIL import Image
        class Session:
            def run(self, outputs, inputs):
                self.pixels = inputs['image']
                return np.array([[1, 2, 5, 6]], dtype=np.float32), np.array([1]), np.array([.8])
        session = Session()
        image = Image.new('RGB', (6, 6), (255, 128, 0))
        rows, elapsed = detect.infer_tile(session, image, [2, 3], 8)
        self.assertEqual(session.pixels.shape, (1, 3, 8, 8))
        self.assertEqual(session.pixels.dtype, np.float32)
        np.testing.assert_allclose(session.pixels[0, :, 0, 0], [1, 128/255, 0])
        np.testing.assert_array_equal(session.pixels[0, :, 7, 7], [0, 0, 0])
        self.assertEqual(rows[0]['box_xyxy'], [3, 5, 7, 9])
        self.assertGreaterEqual(elapsed, 0)

    def test_non_finite_model_output_is_rejected(self):
        import numpy as np
        from PIL import Image
        class Session:
            def run(self, outputs, inputs):
                return np.array([[0, 0, math.nan, 4]]), np.array([1]), np.array([.9])
        with self.assertRaisesRegex(ValueError, 'non-finite'):
            detect.infer_tile(Session(), Image.new('RGB', (16, 16)), [0, 0], 16)

    def test_source_binding_rejects_modified_bytes_dimensions_and_paths(self):
        from PIL import Image
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)/'sample.png'
            Image.new('RGB', (16, 20)).save(path)
            digest = detect.file_hash(path)
            sample = {'file': 'sample.png', 'sha256': digest}
            expected = {'sha256': digest, 'dimensions': [16, 20]}
            self.assertEqual(detect.open_reference_sample(directory, sample, expected).size, (16, 20))
            with self.assertRaisesRegex(ValueError, 'size'):
                detect.open_reference_sample(directory, sample, {**expected, 'dimensions': [17, 20]})
            with self.assertRaisesRegex(ValueError, 'path'):
                detect.open_reference_sample(directory, {**sample, 'file': '../sample.png'}, expected)
            Image.new('RGB', (16, 20), 'red').save(path)
            with self.assertRaisesRegex(ValueError, 'identity'):
                detect.open_reference_sample(directory, sample, expected)


if __name__ == '__main__':
    unittest.main()
