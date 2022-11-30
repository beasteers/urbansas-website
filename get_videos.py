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

URBANSAS_ROOT = '/Users/beasteers/Data/tau'
DURATION = 10

annotations = {}

file_groups = {
    'backgrounds': [
        'street_traffic-helsinki-165-5047',
    ],
    'misc': [
        'street_traffic-helsinki-164-5044',
        'street_traffic-lisbon-1008-40464',
        'street_traffic-lisbon-1067-41198',
        'street_traffic-lisbon-1067-41432',
        'street_traffic-lisbon-1076-42301',
        'street_traffic-london-167-5118',
        'street_traffic-lyon-1045-40062',
        'street_traffic-milan-1097-42556',
        'street_traffic-milan-1166-44225',
        'street_traffic-milan-1166-44341',
        'street_traffic-milan-1202-44201',
        'street_traffic-paris-272-8271',
        'street_traffic-paris-272-8285',
        'street_traffic-stockholm-174-5341',
        'street_traffic-vienna-176-5411',
    ]
}

# def read_video(path):
#     import cv2
#     cap = cv2.VideoCapture(path)
#     ims = []
#     ret = True
#     while ret:
#         ret, image = cap.read()
#         if not ret:
#             break
#         ims.append(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
#     fps = cap.get(cv2.CAP_PROP_FPS)
#     return fps, ims

# def video2gif(video_path, suffix=None, size=None):
#     size_text = f"_{'x'.join(map(str, size))}" if size else ''
#     fname = f"{os.path.splitext(video_path)[0]}{size_text}{suffix or ''}.gif"
#     basename = os.path.basename(fname)
#     if os.path.isfile(fname):
#         return basename

#     from PIL import Image
#     fps, frames = read_video(video_path)
#     if not frames:
#         raise ValueError(f'{video_path} {fps} {frames}')
#     frames = [Image.fromarray(x) for x in frames]
#     if size:
#         frames = [im.copy() for im in frames]
#         for im in frames:
#             im.thumbnail(size)

#     frames[0].save(
#         fname, 
#         format="GIF", append_images=frames,
#         save_all=True, duration=1000. / fps, loop=0)
#     return basename

# def pull_file(urbansas_root, fileid, overwrite=False):
#     # pull video
#     fs = glob.glob(os.path.join(urbansas_root, 'video', fileid + '.*'))
#     vf = fs[0]
#     video_file = os.path.basename(vf)
#     video_path = os.path.join(public, video_file)
#     if not os.path.isfile(video_path):
#         shutil.copy(vf, os.path.join(public, video_file))

#     gif_path = video2gif(video_path)
#     gif_path_sm = video2gif(video_path, size=(200, 200))
#     gif_path_md = video2gif(video_path, size=(400, 400))

#     # pull audio
#     fs = glob.glob(os.path.join(urbansas_root, 'audio', fileid + '.*'))
#     af = fs[0]
#     audio_file = os.path.basename(af)
#     audio_path = os.path.join(public, audio_file)
#     if not os.path.isfile(audio_path):
#         shutil.copy(af, audio_path)

#     return {
#         'video_path': video_file,
#         'audio_path': audio_file,
#         'gif_path': gif_path,
#         'gif_path_sm': gif_path_sm,
#         'gif_path_md': gif_path_md,
#     }

def pull_file(urbansas_root, fileid, gif_sizes=None, video_sizes=None, overwrite=False):
    from moviepy.editor import VideoFileClip, AudioFileClip
    video_path = glob.glob(os.path.join(urbansas_root, 'video', fileid + '.*'))[0]
    filename_base = os.path.splitext(os.path.basename(video_path))[0]

    vc = VideoFileClip(video_path)
    duration = vc.duration
    shape = vc.size

    paths = {}

    # write gif
    gif_path = os.path.join(public_out, f"{filename_base}.gif")
    paths[f'gif_path'] = os.path.relpath(gif_path, public)
    if overwrite or not os.path.isfile(gif_path):
        vc.write_gif(gif_path)

    # write gifs
    for key, size in (gif_sizes or {}).items():
        gif_path = os.path.join(public_out, f"{filename_base}_{key}.gif")
        paths[f'gif_path_{key}'] = os.path.relpath(gif_path, public)
        if not overwrite and os.path.isfile(gif_path):
            continue

        clipi = vc.resize(width=size) if size else vc
        clipi.write_gif(gif_path)

    # add audio
    audio_path = glob.glob(os.path.join(urbansas_root, 'audio', fileid + '.*'))[0]
    vc.audio = AudioFileClip(audio_path)

    # write video
    vid_path = os.path.join(public_out, f'{filename_base}.mp4')
    paths[f'video_path'] = os.path.relpath(vid_path, public)
    if overwrite or not os.path.isfile(vid_path):
        vc.write_videofile(vid_path)

    # write video at smaller sizes
    for key, size in (video_sizes or {}).items():
        vid_path = os.path.join(public_out, f"{filename_base}_{key}.mp4")
        paths[f'video_path_{key}'] = os.path.relpath(vid_path, public)
        if not overwrite and os.path.isfile(vid_path):
            continue

        clipi = vc.resize(width=size) if size else vc
        clipi.write_videofile(vid_path)

    return paths, duration, shape


def main(urbansas_root=URBANSAS_ROOT):
    import pandas as pd

    # get all annotations
    video_df = pd.read_csv(os.path.join(urbansas_root, 'video_annotations.csv'))
    audio_df = pd.read_csv(os.path.join(urbansas_root, 'audio_annotations.csv'))

    # get clip level annotations
    video_clip_df = video_df.groupby('filename').apply(lambda d: pd.Series({
        'night': bool(d.night.any()),
        'dataset': d.subset.iloc[0],
        'location': d.location_id.iloc[0],
    }))
    audio_clip_df = audio_df.groupby('filename').apply(lambda d: pd.Series({
        'offscreen': bool(d.non_identifiable_vehicle_sound.any()),
    }))
    # filter out clip level annotations from annotation dfs
    video_df = video_df[~(video_df.time == -1)]
    audio_df = audio_df[~( (audio_df.start == -1) & (audio_df.end == -1) )]
    audio_df.loc[audio_df.label == -1, 'label'] = 'non_identifiable'

    # get location 
    locations = video_clip_df.reset_index(drop=False).groupby('location').first()
    print(len(locations), 'locations')
    file_groups['locations'] = [change_old_fid(f) for f in locations.filename.tolist()]

    anns = {}
    for group, files in file_groups.items():
        anns[group] = {}
        pbar = tqdm.tqdm(files)
        for fid in pbar:
            # fid2 is for the dataframe, fid is for filename
            fid2 = change_new_fid(fid)

            vdf = video_df[video_df.filename == fid2]
            adf = audio_df[audio_df.filename == fid2]
            if fid2 not in video_clip_df.index:
                pbar.write(f"WARNING: No annotation for {fid}")
                continue

            dataset = video_clip_df.loc[fid2].dataset
            location = video_clip_df.loc[fid2].location
            night = bool(video_clip_df.loc[fid2].night)
            offscreen = bool(audio_clip_df.loc[fid2].offscreen)

            pbar.write(f'{dataset}:{fid2} v={len(vdf)} a={len(adf)} night={night} offscreen={offscreen}')

            try:
                paths, duration, shape = pull_file(
                    urbansas_root, fid, 
                    gif_sizes={'sm': 200, 'md': 400},
                    video_sizes={'sm': 200, 'md': 400})
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

            anns[group][fid2] = {
                'file_id': fid, 
                'dataset': dataset, 
                'night': night, 
                'offscreen': offscreen,
                'visual_objects': {int(i): d.to_dict('records') for i, d in vdf.groupby('frame_id')},
                'audio_objects': adf.to_dict('records'),
                **({k: f'/{path}' if path else None for k, path in paths.items()}), 
            }


    anns['stats'] = {
        # count objects per label
        'video_label_object_counts': video_df.groupby('track_id').first().label.value_counts().to_dict(),
        'audio_label_object_counts': audio_df.label.value_counts().to_dict(),
        # count boxes per label
        'video_label_box_counts': video_df.label.value_counts().to_dict(),
        # meta counts
        'night_counts': video_clip_df.night.value_counts().to_dict(),
        'dataset_counts': video_clip_df.dataset.value_counts().to_dict(),
        'location_counts': video_clip_df.location.value_counts().to_dict(),
        'offscreen_counts': audio_clip_df.offscreen.value_counts().to_dict(),
    }

    anns['table_samples'] = {
        "Video Frame-Level": video_df.head(20).to_dict('records'),
        "Audio Frame-Level": audio_df.head(20).to_dict('records'),
        "Video Clip-Level": video_clip_df.head(20).to_dict('records'),
        "Audio Clip-Level": audio_clip_df.head(20).to_dict('records'),
    }
    
    with open(os.path.join(src, 'annotations.json'), 'w') as f:
        json.dump(anns, f, indent=2)


def change_new_fid(fid):
    fid2 = remove_prefix(fid, 'street_traffic-')
    fid2_parts = fid2.split('-')
    fid2 = '_'.join(fid2_parts[:-2]) + '_'.join(fid2_parts[-2:])
    return fid2

def change_old_fid(fid):
    import re
    m = re.search(r'([A-z]+)([\d-]+)', fid.replace('_', '-'))
    if m is None: 
        return fid
    name, rest = m.groups()
    fid2 = f'street_traffic-{name}-{rest}'
    print(fid, fid2)
    return fid2

def remove_prefix(text, prefix):
    if text.startswith(prefix):
        return text[len(prefix):]
    return text

if __name__ == '__main__':
    import fire
    fire.Fire(main)