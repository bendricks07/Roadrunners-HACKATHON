---
tags:
- geospatial
- geobase
- car-detection
- vehicle-detection
license: mit
---
| <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" width="28" height="28"> | [GeoAi](https://www.npmjs.com/package/geoai) |
|---|---|



> `task = car-detection`

### 🛠 Model Purpose
This model is part of the **[GeoAi](https://github.com/decision-labs/geoai.js)** javascript library.

**GeoAi** enables geospatial AI inference **directly in the browser or Node.js** without requiring a heavy backend.

**GeoAi** pipeline accepts **geospatial polygons** as input (in GeoJSON format) and outputs results as a **GeoJSON FeatureCollection**, ready for use with libraries like **Leaflet** and **Mapbox GL**.

<video controls autoplay loop width="1024" height="720" src="https://geobase-docs.s3.amazonaws.com/geobase-ai-assets/car-detection-model.mp4"></video>

---
### 🚀 Demo

Explore the model in action with the interactive [Demo](https://docs.geobase.app/geoai-live/tasks/car-detection).

### 📦 Model Information
- **Architecture**: MaskRCNN
- **Source Model**: https://opengeoai.org/examples/car_detection/
- **Quantization**: Yes
---

### 💡 Example Usage

```javascript
import { geoai } from "geoai";

// Example polygon (GeoJSON)
const polygon = {
  type: "Feature",
  properties: {},
  geometry: {
    coordinates: [
      [
        [-95.42148774154262, 29.67906487977089],
        [-95.42148774154262, 29.678781807220446],
        [-95.4210323139897, 29.678781807220446],
        [-95.4210323139897, 29.67906487977089],
        [-95.42148774154262, 29.67906487977089]
      ],
    ],
    type: "Polygon",
  },
} as GeoJSON.Feature;

// Initialize pipeline
const pipeline = await geoai.pipeline(
  [{ task: "car-detection" }],
  providerParams
);
 
// Run detection
const result = await pipeline.inference({
  inputs: { polygon }
});
 
// Sample output format
// {
//     "detections": {
//         "type": "FeatureCollection",
//         "features": [
//             {
//                 "type": "Feature",
//                 "properties": {
//                 },
//                 "geometry": {
//                     "type": "Polygon",
//                     "coordinates": [
//                         [
//                             [54.69479163045772, 24.766579711184693],
//                             [54.69521093930892, 24.766579711184693],
//                             [54.69521093930892, 24.766203991224682],
//                             [54.69479163045772, 24.766203991224682],
//                             [54.69479163045772, 24.766579711184693],
//                         ]
//                     ]
//                 }
//             },
//             {"type": 'Feature', "properties": {…}, "geometry": {…}}, 
//             {"type": 'Feature', "properties": {…}, "geometry": {…}},
//         ]
//     },
//     "geoRawImage": GeoRawImage {data: Uint8ClampedArray(1048576), width: 512, height: 512, channels: 4, bounds: {…}, …}
// }

```
### 📖 Documentation & Demo

- GeoBase Docs: https://docs.geobase.app/geoai
- NPM Package: https://www.npmjs.com/package/geoai
- Demo Playground: https://docs.geobase.app/geoai-live/tasks/car-detection
- GitHub Repo: https://github.com/decision-labs/geoai.js