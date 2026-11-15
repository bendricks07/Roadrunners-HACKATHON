#!/usr/bin/env python3
"""Local Mask R-CNN pilot with a provisional assistant reference, not human truth."""
import argparse
import datetime as dt
import hashlib
import json
import math
from pathlib import Path
import time
import urllib.request

MODEL_REPO = 'geobase/car-detection'
MODEL_REVISION = 'a3706aca0bce126fce8fa86061c09582a6562f62'
MODEL_SHA256 = 'fc850ef4fbc16dfbe6272b69699ef91945aa0855e36d0f705cf475429d3eca04'
MODEL_URL = f'https://huggingface.co/{MODEL_REPO}/resolve/{MODEL_REVISION}/onnx/model_quantized.onnx'


def file_hash(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda:stream.read(1024*1024),b''): h.update(block)
    return h.hexdigest()


def download_model(destination):
    destination=Path(destination)
    if destination.exists():
        if file_hash(destination)!=MODEL_SHA256: raise ValueError('Existing model checksum mismatch')
        return
    destination.parent.mkdir(parents=True,exist_ok=True)
    temporary=destination.with_suffix('.onnx.part')
    size=0
    try:
        with urllib.request.urlopen(MODEL_URL,timeout=60) as response, temporary.open('wb') as stream:
            while True:
                block=response.read(1024*1024)
                if not block: break
                size+=len(block)
                if size>80_000_000: raise ValueError('Model download exceeded bounded size')
                stream.write(block)
        if file_hash(temporary)!=MODEL_SHA256: raise ValueError('Downloaded model checksum mismatch')
        temporary.replace(destination)
    finally:
        if temporary.exists(): temporary.unlink()


def inside(point,rectangle):
    x,y=point;left,top,right,bottom=rectangle
    return left<=x<right and top<=y<bottom


def eligible_center(point,width,height,margin,uncertain):
    return inside(point,[margin,margin,width-margin,height-margin]) and not any(inside(point,r) for r in uncertain)


def maximum_matches(predicted,reference,radius):
    """One-to-one maximum-cardinality matching within a predeclared center radius."""
    adjacency={i:sorted([j for j,r in enumerate(reference) if math.dist(p,r)<=radius],
                        key=lambda j:math.dist(p,reference[j])) for i,p in enumerate(predicted)}
    owner={}
    def augment(i,seen):
        for j in adjacency[i]:
            if j in seen: continue
            seen.add(j)
            if j not in owner or augment(owner[j],seen):
                owner[j]=i
                return True
        return False
    for i in range(len(predicted)): augment(i,set())
    return sorted([{'prediction_index':i,'reference_index':j,
                    'distance_px':math.dist(predicted[i],reference[j])} for j,i in owner.items()],
                  key=lambda pair:pair['prediction_index'])


def agreement(predicted,reference,radius):
    matches=maximum_matches(predicted,reference,radius)
    tp=len(matches);fp=len(predicted)-tp;fn=len(reference)-tp
    return {'matched':tp,'unmatched_predictions':fp,'unmatched_reference':fn,
            'precision_vs_provisional_reference':tp/(tp+fp) if tp+fp else None,
            'recall_vs_provisional_reference':tp/(tp+fn) if tp+fn else None,
            'matches':matches}


def context_origin(window,image_width,image_height,size=512):
    x0,y0,x1,y1=window
    return [max(0,min(round((x0+x1-size)/2),max(0,image_width-size))),
            max(0,min(round((y0+y1-size)/2),max(0,image_height-size)))]


def tile_origins(window,image_width,image_height,size):
    """Half-overlap contexts, including the final origin so the ROI has no gaps."""
    if size < 16 or size > min(image_width,image_height):
        raise ValueError('Tile size must fit the source image and be at least 16 pixels')
    def axis(left,right,length):
        start=max(0,math.floor(left-size/2))
        stop=min(length-size,math.ceil(right))
        start=min(start,stop)
        points=list(range(start,stop+1,max(1,size//2)))
        if points[-1]!=stop: points.append(stop)
        return points
    return [(x,y) for y in axis(window[1],window[3],image_height)
                  for x in axis(window[0],window[2],image_width)]


def box_iou(a,b):
    intersection=max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
    union=(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-intersection
    return intersection/union if union>0 else 0.0


def suppress_duplicates(detections,threshold=0.3):
    kept=[]
    for detection in sorted(detections,key=lambda item:item['score'],reverse=True):
        if not any(box_iou(detection['box_xyxy'],other['box_xyxy'])>threshold for other in kept):
            kept.append(detection)
    return kept


def infer_tile(session,image,origin,size=512):
    import numpy as np
    from PIL import Image
    x,y=origin
    # Preserve source pixels: crop context, pad at the edge, no external resizing.
    tile=Image.new('RGB',(size,size))
    crop=image.crop((x,y,min(x+size,image.width),min(y+size,image.height)))
    tile.paste(crop,(0,0))
    pixels=np.asarray(tile,dtype=np.float32).transpose(2,0,1)[None]/255.0
    started=time.perf_counter()
    boxes,labels,scores=session.run(['boxes','labels','scores'],{'image':pixels})
    elapsed=time.perf_counter()-started
    detections=[]
    for box,label,score in zip(boxes,labels,scores):
        values=[float(v) for v in box]
        if not all(math.isfinite(v) for v in values+[float(score)]):
            raise ValueError('Detector returned non-finite values')
        if values[2]<=values[0] or values[3]<=values[1]: continue
        detections.append({'box_xyxy':[values[0]+x,values[1]+y,values[2]+x,values[3]+y],
                           'class_id':int(label),'score':float(score)})
    return detections,elapsed


def draw_overlay(image,window,row,destination):
    from PIL import ImageDraw,ImageFont
    x0,y0,x1,y1=window['window_xyxy']
    crop=image.crop((x0,y0,x1,y1))
    scale=max(2,min(5,round(700/crop.width)))
    from PIL import Image
    canvas=Image.new('RGB',(max(760,crop.width*scale),crop.height*scale+150),'#16202c')
    canvas.paste(crop.resize((crop.width*scale,crop.height*scale),Image.Resampling.NEAREST),(0,70))
    draw=ImageDraw.Draw(canvas)
    try: font=ImageFont.truetype('DejaVuSans.ttf',16)
    except OSError: font=ImageFont.load_default(size=16)
    draw.text((12,10),window['id'],font=font,fill='white')
    draw.text((12,36),'Cyan: model  |  Green: provisional reference  |  Amber: uncertain',font=font,fill='#d3dce6')
    for rect in window['uncertain_regions_xyxy']:
        draw.rectangle((rect[0]*scale,rect[1]*scale+70,rect[2]*scale,rect[3]*scale+70),outline='#edb342',width=2)
    for detection in row['scored_detections']:
        box=detection['box_xyxy'];local=[box[0]-x0,box[1]-y0,box[2]-x0,box[3]-y0]
        draw.rectangle((max(0,local[0])*scale,max(0,local[1])*scale+70,
                        min(crop.width,local[2])*scale,min(crop.height,local[3])*scale+70),outline='#39d6f5',width=2)
    for i,point in enumerate(row.get('scored_reference_points') or [],1):
        x,y=point[0]*scale,point[1]*scale+70
        draw.ellipse((x-5,y-5,x+5,y+5),outline='#6ae58d',width=2)
        draw.text((x+6,y-12),str(i),font=font,fill='white',stroke_width=1,stroke_fill='black')
    footer='Provisional assistant labels; human review pending.' if row['scoreable'] else 'Unscored: no defensible reference count at this resolution.'
    count=row['candidate_count_in_evaluation_region']
    count_text=f'Model candidates in evaluation region: {count}'
    if row['scoreable']: count_text+=f"  |  Provisional reference: {row['provisional_reference_count']}"
    draw.text((12,canvas.height-62),count_text,font=font,fill='white')
    draw.text((12,canvas.height-32),footer,font=font,fill='#d3dce6')
    canvas.save(destination)


def open_reference_sample(image_root,sample,expected):
    from PIL import Image
    filename=sample['file']
    if Path(filename).name!=filename: raise ValueError('Unexpected sample path')
    image_path=Path(image_root)/filename
    if file_hash(image_path)!=expected['sha256'] or sample['sha256']!=expected['sha256']:
        raise ValueError('Reference image identity mismatch')
    image=Image.open(image_path).convert('RGB')
    if list(image.size)!=expected['dimensions']: raise ValueError('Image size mismatch')
    return image


def run_pilot(model_path,manifest_path,reference_path,output,ground_tile_m=None):
    import numpy as np
    import onnxruntime as ort
    from PIL import Image
    if ground_tile_m is not None and (not math.isfinite(ground_tile_m) or not 1<=ground_tile_m<=200):
        raise ValueError('Ground tile size must be between 1 and 200 metres')
    if file_hash(model_path)!=MODEL_SHA256: raise ValueError('Model checksum mismatch')
    manifest_path=Path(manifest_path);output=Path(output);output.mkdir(parents=True,exist_ok=True)
    reference=json.loads(Path(reference_path).read_text())
    samples={s['id']:s for s in json.loads(manifest_path.read_text())['samples']}
    image_root=manifest_path.parent
    options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    session=ort.InferenceSession(str(model_path),sess_options=options,providers=['CPUExecutionProvider'])
    report={'created_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
            'model':{'repository':MODEL_REPO,'revision':MODEL_REVISION,'sha256':MODEL_SHA256,
                     'model_card':'https://huggingface.co/geobase/car-detection',
                     'declared_license':'MIT','upstream_model_card':'https://huggingface.co/giswqs/geoai',
                     'onnxruntime_version':ort.__version__,'numpy_version':np.__version__},
            'reference_sha256':file_hash(reference_path),'reference_status':reference['reference_status'],
            'reference_frozen_at_utc':reference['frozen_at_utc'],
            'human_verified':False,'confidence_threshold':reference['threshold'],
            'run_kind':'exploratory_scale_adaptation' if ground_tile_m else 'initial_512px_baseline',
            'approx_ground_tile_m':ground_tile_m,
            'duplicate_suppression_iou':0.3 if ground_tile_m else None,
            'tile_edge_exclusion_fraction':0.08 if ground_tile_m else None,
            'selection_note':'Scale adaptation followed inspection of baseline output; this is not a held-out validation.' if ground_tile_m else 'Fixed 512px context baseline.',
            'match_radius_ground_m':reference['match_radius_ground_m'],
            'scope':'Small fixed windows at one lot. Not a validation of occupancy, parking legality or a forecast.',
            'windows':[],'inference_seconds':0.0}
    cache={};images={}
    for window in reference['windows']:
        sample=samples[window['sample_id']]
        expected=reference['source_samples'][window['sample_id']]
        if window['sample_id'] not in images:
            images[window['sample_id']]=open_reference_sample(image_root,sample,expected)
        image=images[window['sample_id']]
        x0,y0,x1,y1=window['window_xyxy']
        if not 0<=x0<x1<=image.width or not 0<=y0<y1<=image.height:
            raise ValueError('Evaluation window outside image')
        size=512 if ground_tile_m is None else round(ground_tile_m/sample['approx_ground_m_per_output_pixel'])
        origins=[context_origin(window['window_xyxy'],image.width,image.height)] if ground_tile_m is None else tile_origins(window['window_xyxy'],image.width,image.height,size)
        all_detections=[]
        for origin in origins:
            key=(window['sample_id'],*origin,size)
            if key not in cache:
                cache[key],elapsed=infer_tile(session,image,origin,size)
                report['inference_seconds']+=elapsed
            for detection in cache[key]:
                box=detection['box_xyxy'];center=[(box[0]+box[2])/2,(box[1]+box[3])/2]
                if detection['class_id']!=1 or detection['score']<reference['threshold']: continue
                if ground_tile_m is not None and not eligible_center([center[0]-origin[0],center[1]-origin[1]],size,size,size*0.08,[]): continue
                if inside(center,window['window_xyxy']): all_detections.append(detection)
        if ground_tile_m is not None: all_detections=suppress_duplicates(all_detections)
        row={'id':window['id'],'sample_id':window['sample_id'],
             'scoreable':window['scoreable'],'window_xyxy':window['window_xyxy'],
             'context_origins':origins,'tile_size_px':size,'scored_detections':[], 'ignored_detections':[],
             'scored_reference_points':None}
        for detection in all_detections:
            box=detection['box_xyxy'];center=[(box[0]+box[2])/2,(box[1]+box[3])/2]
            local=[center[0]-x0,center[1]-y0]
            item={**detection,'center_local':local}
            good=eligible_center(local,x1-x0,y1-y0,reference['evaluation_margin_px'],window['uncertain_regions_xyxy'])
            row['scored_detections' if good else 'ignored_detections'].append(item)
        row['candidate_count_in_evaluation_region']=len(row['scored_detections'])
        if window['scoreable']:
            refs=[p for p in window['reference_points'] if eligible_center(p,x1-x0,y1-y0,reference['evaluation_margin_px'],window['uncertain_regions_xyxy'])]
            row['scored_reference_points']=refs;row['provisional_reference_count']=len(refs)
            predicted=[d['center_local'] for d in row['scored_detections']]
            row['agreement']=agreement(predicted,refs,reference['match_radius_ground_m']/sample['approx_ground_m_per_output_pixel'])
        else:
            row['provisional_reference_count']=None;row['agreement']=None
            row['unscored_reason']=window['unscored_reason']
        draw_overlay(image,window,row,output/(window['id']+'-overlay.png'))
        image.crop(window['window_xyxy']).save(output/(window['id']+'-source.png'))
        report['windows'].append(row)
    totals={key:sum(r['agreement'][key] for r in report['windows'] if r['agreement'])
            for key in ['matched','unmatched_predictions','unmatched_reference']}
    tp,fp,fn=totals['matched'],totals['unmatched_predictions'],totals['unmatched_reference']
    report['pooled_provisional_agreement']={**totals,
        'precision':tp/(tp+fp) if tp+fp else None,'recall':tp/(tp+fn) if tp+fn else None,
        'scored_windows':sum(r['scoreable'] for r in report['windows']),
        'scored_lots':1,'scored_source_vintages':1,
        'not_human_ground_truth':True}
    report['forecast']={'status':'not_available','probability':None}
    report['permission']={'status':'unknown'}
    report['preprocessing']='RGB float32 NCHW /255; original source pixels in each crop; model performs internal resize/normalization; no external sharpening or super-resolution.'
    report['inference_tile_count']=len(cache)
    (output/'detections.json').write_text(json.dumps(report,indent=2)+'\n')
    (output/'context-detections.json').write_text(json.dumps([{'sample_id':k[0],'origin':k[1:3],'size_px':k[3],'detections':v} for k,v in cache.items()],indent=2)+'\n')
    return report


def run_control(model_path,image_path,output):
    """Runtime smoke test on a known example; not an independent accuracy test."""
    import onnxruntime as ort
    from PIL import Image,ImageDraw
    if file_hash(model_path)!=MODEL_SHA256: raise ValueError('Model checksum mismatch')
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    image=Image.open(image_path).convert('RGB')
    if image.size!=(512,512): raise ValueError('Control must be the documented 512px crop')
    options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
    session=ort.InferenceSession(str(model_path),sess_options=options,providers=['CPUExecutionProvider'])
    detections,elapsed=infer_tile(session,image,[0,0])
    candidates=[d for d in detections if d['class_id']==1 and d['score']>=0.3]
    overlay=image.copy();draw=ImageDraw.Draw(overlay)
    for item in candidates: draw.rectangle(item['box_xyxy'],outline='#39d6f5',width=2)
    overlay.save(output/'positive-control-overlay.png')
    report={'purpose':'Runtime smoke test only; example may overlap training data; no accuracy score.',
            'image_sha256':file_hash(image_path),'model_sha256':MODEL_SHA256,
            'onnxruntime_version':ort.__version__,'threshold':0.3,
            'candidate_count':len(candidates),'inference_seconds':elapsed,
            'detections':detections,'human_verified':False}
    (output/'positive-control.json').write_text(json.dumps(report,indent=2)+'\n')
    return report


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--model',type=Path,required=True)
    parser.add_argument('--download-model',action='store_true')
    parser.add_argument('--manifest',type=Path)
    parser.add_argument('--control-image',type=Path,help='Run only the documented 512px positive-control crop')
    parser.add_argument('--reference',type=Path,default=Path(__file__).with_name('g2-reference.json'))
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--ground-tile-m',type=float,help='Exploratory overlapping tiles by approximate ground extent, e.g. 36; default is the initial 512px baseline')
    args=parser.parse_args()
    if args.download_model: download_model(args.model)
    if args.control_image:
        report=run_control(args.model,args.control_image,args.out)
        print(json.dumps({k:v for k,v in report.items() if k!='detections'},indent=2))
        return
    if not args.manifest: parser.error('--manifest is required unless --control-image is supplied')
    report=run_pilot(args.model,args.manifest,args.reference,args.out,args.ground_tile_m)
    print(json.dumps({'windows':[{k:r[k] for k in ['id','candidate_count_in_evaluation_region','provisional_reference_count','agreement']} for r in report['windows']],
                      'pooled_provisional_agreement':report['pooled_provisional_agreement'],
                      'inference_seconds':report['inference_seconds'],'saved':str(args.out/'detections.json')},indent=2))


if __name__=='__main__': main()
