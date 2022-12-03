
import { useState, useEffect, useRef, useMemo, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

import VolumeMuteIcon from '@mui/icons-material/VolumeMute';

import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import ContactlessIcon from '@mui/icons-material/Contactless';
import NoiseAwareIcon from '@mui/icons-material/NoiseAware';

import { styled, useTheme, alpha } from '@mui/material/styles';

import colormap from 'colormap';

import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
// import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.spectrogram.min.js';

import annotations from './annotations.json'



const colors = colormap({
  colormap: 'magma',
  nshades: 256,
  format: 'float',
})

export const MultiVideoAnnotated = ({ fids, boxSx, ...props }) => {
  return (
    <Box display='flex' justifyContent='center' flexWrap='wrap' sx={{ '> *': { flexBasis: '200px', flexGrow: 1 }, maxWidth: '70rem', margin: '0 auto', ...boxSx }}>
      {fids.map(f => f && <VideoAnnotated key={f} fid={f} {...props} />)}
    </Box>
  )
}

// XXX: FPS ASSUMPTION
const VideoAnnotated = ({ fid, size='md', preLabeledBoxes=false, group='locations', annotationFps=2, hideAudio, sx, ...props }) => {
  const fullAnn = annotations.meta[fid] || {}
  const { visual_objects, audio_objects, ...ann } = fullAnn;
  const src = ann[preLabeledBoxes ? 'video_path_prelabeled' : (size ? `video_path_${size}` : 'video_path')];
  useEffect(() => { console.log(fullAnn) }, [])

  useEffect(() => {
    for(let o of audio_objects) {
      o.color = alpha(annotations.colors[o.label] || '#aaa', 0.3)
    }
  }, [audio_objects])

  const [frameIndex, setFrameIndex] = useState(0);
  const currentBoxes = visual_objects?.[frameIndex];
  // console.log(frameIndex)

  // const [[width, height], setVectorDimensions] = useState([0, 0]);
  const [videoDuration, setVideoDuration] = useState(0);
  // const [fps, setFps] = useState(24);
  const frameLength = 1 / annotationFps;
  const getFrameIndex = timeSec => {
    return Math.max(Math.floor(timeSec / frameLength + 0.5), 0); // XXX: weird constant !! 0.25 idk that's what it took
  };
  // const [isPaused, setIsPaused] = useState(true);
  // const [muted, setMuted] = useState(true);

  const vidRef = useRef();
  // const [ vidEl, setVidEl ] = useState();
  const timestampWatcherRef = useRef();

  const stopTracking = () => {
    cancelAnimationFrame(timestampWatcherRef.current);
  };
  const startTracking = () => {
    timestampWatcherRef.current = requestAnimationFrame(() => {
      updateFrameIndex();
      startTracking();
    });
  };

  // const maxFrames = Math.ceil(videoDuration / frameLength);
  const updateFrameIndex = () => {
    const nextFrameIndex = getFrameIndex(vidRef.current?.currentTime);
    if (nextFrameIndex !== frameIndex) {
      // console.log(vidRef.current.currentTime, vidRef.current.currentTime/annotationFps, frameIndex, nextFrameIndex)
      setFrameIndex(nextFrameIndex);
    }
  };

  return src && <Box sx={sx}>
    <Box sx={{ position: 'relative', width: '100%', marginTop: '1rem', }}>
      <video
        width='100%'
        ref={vidRef}
        preload='none'
        onLoadedMetadata={e => {
          setVideoDuration(e.target.duration);
        }}
        onTimeUpdate={updateFrameIndex}
        onPlay={() => {
          // setIsPaused(false);
          startTracking();
        }}
        onPause={() => {
          // setIsPaused(true);
          stopTracking();
        }}
        onWaiting={stopTracking}
        onPlaying={startTracking}
        // Since the editor being on top captures all the mouse clicks
        // there's not much use to leaving the controls
        // controls={false}
        loop
        controls
        // muted
        autoPlay
        src={src}
      />
      <AnnotationCanvas {...ann} boxes={currentBoxes} colors={annotations.colors} {...props} />
    </Box>
    <VideoControls videoRef={vidRef} />
    {!hideAudio && vidRef && <Audio video={vidRef} regions={audio_objects} {...ann} />}
  </Box>
}


const VideoControls = ({ videoRef }) => {
  const paused = videoRef.current?.paused;
  const toggle = () => videoRef.current && (videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause());
  return <Stack direction='row'>
    <Button aria-label="play/pause" onClick={toggle}>
      {/* {!paused ? <PauseIcon /> : <PlayArrowIcon />} */}
      <PlayArrowIcon />/<PauseIcon />
    </Button>

    {/* <IconButton aria-label="mute/unmute">
      {!paused ? <PauseIcon onClick={toggle} /> : <PlayArrowIcon onClick={toggle} />}
    </IconButton> */}
  </Stack>
}

const WavesurferContext = createContext();
const useWavesurfer = () => useContext(WavesurferContext);

const WavesurferContainer = styled('div')`
border-left: #000000 solid 1px;
* region.wavesurfer-region {
  cursor: unset !important;
}
* region.wavesurfer-region:before {
    content: attr(data-region-label);
    position: absolute;
    top: 0;
    left: 4px;
    color: black;
    text-shadow: 0px 0px 3px rgb(255 255 255);
    font-size: 0.75em;
    font-weight: bold;
}
* region.wavesurfer-region[data-region-label=non_identifiable_vehicle_sound]:before {
  top: unset;
  bottom: 0;
}
spectrogram canvas {
  height: 100% !important;
}
> wave {
  cursor: pointer !important;
}
`

const Audio = ({ video, regions, non_identifiable_vehicle_sound }) => {
  const theme = useTheme();
  const ref = useRef();
  const [ ws, setWs ] = useState(null);
  useEffect(() => {
    const ws = WaveSurfer.create({
      container: ref.current,
      normalize: true,
      splitChannels: true,
      waveColor: theme.palette.primary.main,
      progressColor: theme.palette.primary.dark,
      height: 50,
      responsive: true,
      backend: 'MediaElement',
      // width: '100%',
      plugins: [
        RegionsPlugin.create({
          // timeFormatCallback: ()
        }),
      //   CursorPlugin.create({
      //     showTime: true,
      //     opacity: 1,
      //     // customShowTimeStyle: {
      //     //     'background-color': '#000',
      //     //     color: '#fff',
      //     //     padding: '2px',
      //     //     'font-size': '10px'
      //     // }
      // })
        SpectrogramPlugin.create({
            container: ref.current,
            labels: false,
            colorMap: colors,
            height: 86,
            splitChannels: true,
        })
      ]
    })
    setWs(ws)
    return () => { 
      if(!ws) return;
      setWs(null);
      ws.backend.media = null;
      ws.destroy()
    };
  }, [])
  useEffect(() => {  
    if(!( ws && video?.current?.src && !ws.isDestroyed )) return;
    ws.load(video.current)
    ws.setMute(false)
    // ws.play()
  }, [ws, video]); // XXX: video element assumption
  return <WavesurferContext.Provider value={ws}>
    <WavesurferContainer ref={ref}>
      {non_identifiable_vehicle_sound && 
        <Region start={0} end={video.current?.duration} label={'non_identifiable_vehicle_sound'} />}
      {regions && regions.map((r, i) => <Region key={i} {...r} />)}
    </WavesurferContainer>
  </WavesurferContext.Provider>
}

const Region = ({ start, end, color='transparent', label }) => {
  const ws = useWavesurfer();
  useEffect(() => {
    if(!ws?.regions || ws?.isDestroyed) return;
    const r = ws.regions.add({
      start, end, 
      drag: false, resize: false, 
      showTooltip: true,
      color,
      attributes: {
        label: label
      },
    })
    return () => {
      try {
        ws && !ws.isDestroyed && r.remove()
      } catch {
        // I don't care
      }
    }
  }, [ ws, start, end, label ])
  return 
}

const AnnotationCanvas = ({ boxes, sx, night, offscreen, non_identifiable_vehicle_sound, colors, hideBoxes, hideClipLabels, hideBoxLabel, ...props }) => {
  return <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      // pointerEvents: 'none',
      ...sx,
    }}
    {...props}
  >
    {/* {!hideClipLabels && night !== null && <Avatar sx={{ 
        position: 'absolute', top: 0, right: '0.1rem', transform: 'translateY(-50%) scale(0.8)', width: 32, height: 32,
        backgroundColor: theme => alpha(theme.palette.background.default, 0.6),
        color: 'text.primary', backdropFilter: 'blur(2px)' }}>
      {night ? 
        <Tooltip title='night' placement='top'><NightsStayIcon fontSize='small' /></Tooltip> : 
        <Tooltip title='day' placement='top'><LightModeIcon fontSize='small' /></Tooltip>}
    </Avatar>} */}
 
    {!hideClipLabels && <Stack direction='row-reverse' spacing={0.2} sx={{ position: 'absolute', top: 0, right: '0.1rem', transform: 'translateY(-50%)' }}>
        <LabelIcon value={night} labels={['day', 'night']} icons={[LightModeIcon, NightsStayIcon]} />
        <LabelIcon value={offscreen} labels={[null, 'off-screen sounds']} icons={[null, ContactlessIcon]} />
        <LabelIcon value={non_identifiable_vehicle_sound} labels={[null, 'non-identifiable vehicle sounds']} icons={[null, NoiseAwareIcon]} />
    </Stack>}
    {!hideBoxes && boxes && boxes.map((b, i) => <BoundingBox key={i} hideLabel={hideBoxLabel} color={colors?.[b.label]} {...b} />)}
    {/* {!hideClipLabels && offscreen && <Box sx={{ 
      position: 'absolute', bottom: 0, right: 0, px: 1, //fontSize: 0.7,
      backgroundColor: 'secondary.dark', color: 'text.primary',
      borderRadius: '10% 0 0 0',
    }}>Off-screen</Box>} */}
  </Box>
}

const LabelIcon = ({ value, labels, icons, colors }) => {
  const i = value ? 1 : 0;
  const Icon = icons?.[i];
  return value !== null && Icon && <Avatar sx={{ 
        width: 25, height: 25,
        backgroundColor: colors?.[i] || (theme => alpha(theme.palette.background.default, 0.6)),
        color: 'text.primary', backdropFilter: 'blur(2px)', border: '1px solid #333' }}>
    <Tooltip title={labels?.[i] || ''} placement='top'><Icon fontSize='small' /></Tooltip>
  </Avatar>
}


const BoundingBox = ({ x, y, w, h, label, visibility, borderWidth='2px', color, labelColor='black', showLabel=true, ...props }) => {
  // color = color || COLORS[label] || COLORS[null]
  color = color || LEGEND[label]?.color || LEGEND[null].color;
  return <Tooltip title={showLabel ? '' : (label || '')}>
    <Box sx={{ 
      position: 'absolute',
      top: `calc(${y*100}% - ${borderWidth})`, 
      left: `calc(${x*100}% - ${borderWidth})`,
      width: `${w*100}%`,
      height: `${h*100}%`,
      border: `${borderWidth} ${visibility ? 'solid' : 'dashed'} ${color}`,
    }} {...props}>
      {showLabel && <span style={{
        position: 'absolute',
        // bottom: '100%', 
        // left: `-${borderWidth}`,
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '0.7rem',
        backgroundColor: color, //alpha(color, 0.8),
        color: labelColor,
        display: 'inline-block',
        padding: `0 5px`,

      }}>{label}</span>}
    </Box>
  </Tooltip>
}

const COLORS = {
  null: '#00FF00',
}

export const LEGEND = {
  car: { color: '#00FF00' },
  truck: { color: '#ff0043' },
  bus: { color: '#003aff' },
  motorbike: { color: '#ffc800' },
  // car: { color: '#00FF00' },
}

export default VideoAnnotated;