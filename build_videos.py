'''Get the static files needed for the website.


Outputs:
 - public/*.mp4
 - public/annotations.json
    - filename, boxes, audio, 

'''


import os
import glob
import shutil
import json
import tqdm


here = os.path.dirname(__file__)
public = os.path.join(here, 'public')
public_out = os.path.join(public, 'output')
src = os.path.join(here, 'src')

os.makedirs(public_out, exist_ok=True)

# URBANSAS_ROOT = '/Users/beasteers/Data/tau'
DURATION = 10
ANN_FPS = 2

annotations = {}

file_groups = {
    'backgrounds': [
        'milan1011_40336',
        # 'helsinki165_5047',
    ],
    'misc': [
        'helsinki164_5044',
        'lisbon1008_40464',
        'lisbon1067_41198',
        'lisbon1067_41432',
        'lisbon1076_42301',
        'london167_5118',
        'lyon1045_40062',
        'milan1097_42556',
        'milan1166_44225',
        'milan1166_44341',
        'milan1202_44201',
        'paris272_8271',
        'paris272_8285',
        'stockholm174_5341',
        'vienna176_5411',
    ]
}


def main(urbansas_root, fps=None):
    import pandas as pd

    # get all annotations
    video_df = pd.read_csv(os.path.join(urbansas_root, 'annotations/video_annotations.csv'))
    audio_df = pd.read_csv(os.path.join(urbansas_root, 'annotations/audio_annotations.csv'))
    video_df_sample = video_df.head(50)
    audio_df_sample = audio_df.head(50)

    # get clip level annotations
    video_clip_df = video_df.groupby('filename').apply(lambda d: pd.Series({
        'night': bool(d.night.any()),
        'dataset': d.subset.iloc[0],
        'location': d.location_id.iloc[0],
        'city': d.city.iloc[0],
    }))
    audio_clip_df = audio_df.groupby('filename').apply(lambda d: pd.Series({
        'offscreen': bool((d.label == 'offscreen').any()),
        'non_identifiable_vehicle_sound': bool(d.non_identifiable_vehicle_sound.any()),
    }))
    # filter out clip level annotations from annotation dfs
    video_df = video_df[~(video_df.time == -1)]
    audio_df = audio_df[~( (audio_df.start == -1) & (audio_df.end == -1) )]
    audio_df.loc[audio_df.label == -1, 'label'] = 'non_identifiable'

    # get location 
    locations = video_clip_df.reset_index(drop=False).groupby('location').first()
    print(len(locations), 'locations')
    file_groups['locations'] = locations.filename.tolist()

    # anns = {}
    meta = {}
    for group, files in file_groups.items():
        # anns[group] = {}
        pbar = tqdm.tqdm(files)
        for fid in pbar:
            vdf = video_df[video_df.filename == fid]
            adf = audio_df[audio_df.filename == fid]
            if fid not in video_clip_df.index:
                pbar.write(f"WARNING: No annotation for {fid}")
                continue

            dataset = video_clip_df.loc[fid].dataset
            location = video_clip_df.loc[fid].location
            night = bool(video_clip_df.loc[fid].night)
            offscreen = bool(audio_clip_df.loc[fid].offscreen)
            non_identifiable_vehicle_sound = bool(audio_clip_df.loc[fid].non_identifiable_vehicle_sound)

            pbar.write(f'{group} {dataset}:{fid} v={len(vdf)} a={len(adf)} night={night} offscreen={offscreen} nivs={non_identifiable_vehicle_sound}')

            try:
                paths, duration, shape = pull_file(
                    urbansas_root, fid, fps=fps,
                    video_sizes={'sm': 150, 'md': 400, None: 720 if group == 'backgrounds' else None})
            except IndexError:
                print(f"couldn't find matching file for {fid}")
                continue
            w, h = shape
            
            vdf['x'] = vdf.x / w
            vdf['y'] = vdf.y / h
            vdf['w'] = vdf.w / w
            vdf['h'] = vdf.h / h
            adf.loc[adf.start < 0, 'start'] = 0
            adf.loc[adf.end < 0, 'end'] = duration

            # anns[group]
            meta[fid] = {
                **(meta.get(fid) or {}),
                'file_id': fid, 
                'location': location,
                'dataset': dataset, 
                'night': night, 
                'offscreen': offscreen, 
                'non_identifiable_vehicle_sound': non_identifiable_vehicle_sound,
                'visual_objects': {int(i): d.to_dict('records') for i, d in vdf.groupby('frame_id')},
                'audio_objects': adf.to_dict('records'),
                **paths, 
            }

    anns = {}
    anns.update(file_groups)
    anns['meta'] = meta

    fs_all = glob.glob(os.path.join(urbansas_root, 'video_24fps', '*'))
    frames_total = len(fs_all) * DURATION * ANN_FPS

    video_frames_count = len(video_df[['filename', 'frame_id']].value_counts().index)

    polyphony_all = video_df.groupby(['filename', 'frame_id']).w.count().value_counts()
    polyphony = polyphony_all[polyphony_all.index < 8]
    polyphony['8+'] = polyphony_all[polyphony_all.index >= 8].sum()
    print(polyphony)

    anns['stats'] = {
        # count track instances per label
        'video_label_object_counts': video_df.groupby(['filename', 'track_id']).first().label.value_counts().to_dict(),
        'audio_label_object_counts': audio_df.label.value_counts().to_dict(),
        # count total frame-level detections per label
        'video_label_box_counts': video_df.label.value_counts().to_dict(),
        # 
        'has_vehicle_counts': {'vehicle': video_frames_count, 'no vehicle': frames_total - video_frames_count},
        # 
        'vehicle_polyphony_counts': polyphony.to_dict(),
        # meta counts
        'night_counts': video_clip_df.night.value_counts().rename(index={False: 'day', True: 'night'}).to_dict(),
        'dataset_counts': video_clip_df.dataset.value_counts().to_dict(),
        'unlabeled_dataset_counts': video_clip_df.dataset.value_counts().to_dict(),
        'city_counts': video_clip_df.city.value_counts().to_dict(),
        'location_counts': video_clip_df.location.value_counts().to_dict(),
        'offscreen_counts': audio_clip_df.offscreen.value_counts().rename(index={False: 'no offscreen', True: 'offscreen'}).to_dict(),
        'non_identifiable_vehicle_sound_counts': audio_clip_df.non_identifiable_vehicle_sound.value_counts().rename(index={False: 'no nivs', True: 'nivs'}).to_dict(),
    }

    anns['colors'] = {
        'car': '#00FF00',
        'truck': '#ff0043',
        'bus': '#003aff',
        'motorbike': '#ffc800',
    }

    anns['table_samples'] = {
        "Video": video_df_sample.to_dict('records'),
        "Audio": audio_df_sample.to_dict('records'),
        # "Video Clip-Level": video_clip_df.head(20).to_dict('records'),
        # "Audio Clip-Level": audio_clip_df.head(20).to_dict('records'),
    }

    
    
    with open(os.path.join(src, 'annotations.json'), 'w') as f:
        json.dump(round_floats(anns, 4), f, indent=2)

        

def round_floats(x, n):
    return json.loads(json.dumps(x), parse_float=lambda x: round(float(x), n))


def sjoin(sep, *xs):
    return sep.join(x for x in xs if x)

def write_video(vc, filename_base, key=None, ext='mp4', size=None, overwrite=False):
    path = os.path.join(public_out, f"{sjoin('_', filename_base, key)}.{ext}")

    # optionally write video
    if overwrite or not os.path.isfile(path):
        clipi = vc.resize(width=size) if size else vc
        clipi.write_gif(path) if path.endswith('.gif') else clipi.write_videofile(path)
    # return url for file
    return os.path.relpath(path, public)


def pull_file(urbansas_root, fileid, video_df=None, video_sizes=None, fps=None, overwrite=False):
    from moviepy.editor import VideoFileClip, AudioFileClip
    # select the first video file matching that file id
    video_path = glob.glob(os.path.join(urbansas_root, 'video_24fps', fileid + '.*'))[0]
    # get the full name of that file ID (if you did partial matching)
    fileid = os.path.splitext(os.path.basename(video_path))[0]

    # load video
    vc = VideoFileClip(video_path)
    duration = vc.duration
    shape = vc.size
    if fps:
        vc = vc.set_fps(fps)
    # add audio
    audio_path = glob.glob(os.path.join(urbansas_root, 'audio', fileid + '.*'))[0]
    vc.audio = AudioFileClip(audio_path)

    paths = {}

    # # write gif
    # paths[f'gif_path'] = write_video(vc, fileid, None, 'gif', size=None, overwrite=overwrite)
    # # write gifs
    # for key, size in (gif_sizes or {}).items():
    #     paths[f'gif_path_{key}'] = write_video(vc, fileid, key, 'gif', size, overwrite=overwrite)

    # write video
    # paths[f'video_path'] = write_video(vc, fileid, None, 'mp4', size=None, overwrite=overwrite)
    # write video at smaller sizes
    for key, size in (video_sizes or {}).items():
        # lets you disable sizes
        if not size: continue
        # lets you do full size
        if size is True: size = None
        paths[sjoin('_', 'video_path', key)] = write_video(vc, fileid, key, 'mp4', size, overwrite=overwrite)


    if video_df is not None:
        vcann = vc.copy()
        vcann.set_fps(2)
        vcann = vcann.fl()

    return paths, duration, shape

# def draw_anns(clip):
#     def _draw(get_frame. t):
#         im = get_frame(t)

#         return draw_boxes(im, boxes, labels)
#     return clip.fl(_draw)



def draw_boxes(im, boxes, labels=None, color=(0,255,0), size=1, text_color=(0, 0, 255), spacing=3):
    boxes = np.asarray(boxes).astype(int)
    color = np.asarray(color).astype(int)
    color = color[None] if color.ndim == 1 else color
    labels = itertools.chain([] if labels is None else labels, itertools.cycle(['']))
    for xy, label, c in zip(boxes, labels, itertools.cycle(color)):
        im = cv2.rectangle(im, xy[:2], xy[2:4], tuple(c.tolist()), 2)
        if label:
            if isinstance(label, list):
                im, _ = draw_text_list(im, label, 0, tl=xy[:2] + spacing, space=40, color=text_color)
            else:
                im = cv2.putText(im, label, xy[:2] - spacing, cv2.FONT_HERSHEY_SIMPLEX, im.shape[1]/1400*size, text_color, 1)
    return im


if __name__ == '__main__':
    import fire
    fire.Fire(main)