import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';

import GitHubIcon from '@mui/icons-material/GitHub';
import ArticleIcon from '@mui/icons-material/Article';
import DataArrayIcon from '@mui/icons-material/DataArray';

import Avatar from '@mui/material/Avatar';

import annotations from './annotations.json'
import VideoAnnotated, { MultiVideoAnnotated, LEGEND } from './VideoClip';

import { Section, Code, StandardImageList, MultiTableSample, RelatedWorkCard, ProportionChart } from './PageElements'
// import { Nav } from './Nav'
import { NavProvider, Nav } from './Nav2'

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import { Bar, SingleBar } from './Plots'

// const MAIN_BG = 'milan1011_40336';
// const MAIN_BG = 'street_traffic-milan-1166-44225';
// const MAIN_BG = 'milan1166_44225';

console.log(annotations)




const TitleSlide = ({ menu }) => {
  const vid = annotations.meta[annotations.backgrounds[0]];
  return (
    <Section className='with-bg' full menu={menu}
          background={vid?.video_path || vid.video_path_md}
          sx={{
            color: 'white'
          }}>
        <Typography variant='h1'>
          Urbansas
        </Typography>
        <Typography variant='h4'>
        <b>Urban</b> <b>S</b>ight <b>a</b>nd <b>S</b>ound: An Audio-Visual Traffic Dataset
        </Typography>
        <Typography variant='h6'>
          <b>Magdalena Fuentes, Bea Steers, Pablo Zinemanas, Martin Rocamora, Luca Bondi, Julia Wilkins, Qianyi Shi, Yao Hou, Samarjit Das, Xavier Serra, Juan Pablo Bello</b>
        </Typography>
      </Section>
  )
}

console.log(Object.entries(LEGEND))
const WhySlide = ({ menu }) => {
  return (
    <Section menu={menu}>
        <Typography variant='h2' gutterBottom>
          Why did we compile this dataset?
        </Typography>
        <Typography gutterBottom>
        Automatic audio-visual urban traffic understanding is a growing area of research with many potential applications of value to academia, industry, and the public sector. 
Yet, the lack of well-curated resources for training and evaluating models to research in this area hinders their development.
        To address this we present a curated audio-visual dataset, Urban Sound & Sight (Urbansas), developed for investigating the detection and localization of sounding vehicles in the wild. Urbansas consists of 12 hours of unlabeled data 
along with 3 hours of manually annotated data, including bounding boxes with classes and unique id of vehicles, and strong audio labels featuring vehicle types and indicating off-screen sounds. 
        </Typography>
        <Typography gutterBottom>
        All videos from Urbansas are sourced from two existing datasets: <a href="https://zenodo.org/record/3338727#.Y4p-dexKi3I" target="_blank">Montevideo Audio and Video Dataset (MAVD)</a> and <a href="https://zenodo.org/record/3338727#.Y4p-dexKi3I" target="_blank">TAU Urban Audio-Visual Scenes 2021, Development dataset (TAU)</a>.
        </Typography>
        <Typography variant='h3' gutterBottom mt={3}>
          What's inside?
        </Typography>
        <Stack direction='row' sx={{ justifyContent: 'space-around', textAlign: 'center' }}>
          <Box gutterBottom>
            <Typography variant='h4'>15 hours</Typography>
            <Typography>of audio and video total</Typography>
          </Box>
          <Box gutterBottom>
            <Typography variant='h4'>3 hours</Typography>
            <Typography>annotated @ 2 FPS</Typography>
          </Box>
          <Box gutterBottom>
            <Typography variant='h4'>12 hours</Typography>
            <Typography>of audio and video unlabeled</Typography>
          </Box>
        </Stack>
      </Section>
  )
}



const LocationsSlide = ({ menu }) => {
  // const [muted, setMuted] = useState(false);
  return (
    <Section wide menu={menu}>
      <Typography variant='h2' gutterBottom>
        {annotations.locations.length} different locations around the world
      </Typography>
      <Typography gutterBottom>
        Hover over (or touch) the video to play. If it doesn't play, try touching anywhere on the page and try again.
      </Typography>
      <Typography gutterBottom>
        <b>WARNING: they do have audio!</b>
      </Typography>
      <StandardImageList playOnHover images={[
        ...Object.values(annotations.locations).map(f => annotations.meta[f].video_path_sm),
        // ...Object.values(annotations.misc).map(f => annotations.meta[f].gif_path_sm),
      ]} />
    </Section>
  )
}

const AnnotationsSlide = ({ menu }) => {
  return (
    <Section menu={menu}>
      <Typography variant='h2' gutterBottom>
        Rich Video & Audio Annotations
      </Typography>
      <Box sx={{ 'li': { m: 1 }}}>
        <ul>
            <li>
              Annotations for both <b>2 channel audio</b> (48kHz, 24bit) and <b>video</b> (1280x720, 24fps, annotated at 2fps), stored in separate files for easier data loaders
            </li>
            <li>
              We ensured <b>stereo audio</b> for use in audio source localization
            </li>
            <li>
              Videos were divided into continuous <b>10 second chunks</b> for efficient batching
            </li>
            <li>
              For each vehicle, we annotated:
              <ul>
                <li>The vehicle <b>track_id</b> across multiple frames</li>
                <li>
                  different <b>vehicle classes</b>: 
                  <Stack direction='row' ml={1} spacing={1} display='inline-flex'>
                    {Object.entries(annotations.colors).map(([l, color]) => 
                      <Chip key={l} label={<b>{l}</b>} variant='outlined' size='small' sx={{ borderColor: color, borderWidth: 2 }} />)}
                  </Stack>
                </li>
                <li>
                  when a vehicle was <b>obstructed</b> from view: 
                  <Stack direction='row' ml={1} spacing={1} display='inline-flex'>
                    <Chip label='visibility: 1' variant='outlined' size='small' sx={{ borderWidth: 2 }} />
                    <Chip label='visibility: 0' variant='outlined' size='small' sx={{ borderWidth: 2, borderStyle: 'dashed' }} />
                  </Stack>
                </li>
                <li>
                  We also labeled vehicles that were <b>audible but not visible</b> as 
                  <Stack direction='row' ml={1} spacing={1} display='inline-flex'>
                    <Chip label='offscreen' variant='outlined' size='small' sx={{ borderWidth: 2 }} />
                  </Stack>
                </li>
                <li>
                  Only <b>sounding vehicles</b> were annotated (ignored parked cars).
                </li>
              </ul>
            </li>
            
            <li>
              At the clip-level, we annotated:
              <ul>
                <li><b>night</b> vs. <b>day</b></li>
                <li>If there were <b>non-identifiable vehicle sounds</b> - meaning that there are many sounding vehicles and distinguishing the sounds from individual vehicles was not possible.</li>
              </ul>
            </li>
            
            <li>
              Faces and license plates are automatically <b>anonymized</b> using _____
            </li>
            
          </ul>
        </Box>
      {/* <Box display='flex' flexWrap='wrap' sx={{ '> *': { flexBasis: '200px', flexGrow: 1 }, maxWidth: '70rem', margin: '0 auto' }}>
        <VideoAnnotated fid={'lyon1029_40200'} size='md' />
        <VideoAnnotated fid={'milan1087_40737'} size='md' />
      </Box> */}
      <MultiVideoAnnotated fids={['lyon1029_40200', 'milan1087_40737']} />
      <Typography variant='h5' mt={3}>There are many scenes with diverse traffic perspectives.</Typography>
      <MultiVideoAnnotated fids={['stockholm174_5341', 'vienna178_5485', 'vienna176_5411']} />
      
      <Typography variant='h6' gutterBottom mt={10}>
        What am I going to see when I download the dataset?
      </Typography>
      <MultiTableSample tables={annotations.table_samples} />
    </Section>
  )
}

const ChallengingSlide = ({ menu }) => {
  return (
    <Section menu={menu}>
        <Typography variant='h2' gutterBottom>
          Challenging Scenarios
        </Typography>
        <Typography>
          Add play, unmute buttons, add legend, fix weird shifting
        </Typography>
        <MultiVideoAnnotated fids={['paris272_8271', 'london167_5118']} />
        <Typography variant='h6'>Occlusions:</Typography>
        <Typography variant='h6'>Low Visibility:</Typography>
        <Typography variant='h6'>Busy Scenes:</Typography>
      </Section>
  )
}

const ClipLevelSlide = ({ menu }) => {
  return (
    <Section menu={menu}>
      <Typography variant='h2' gutterBottom>
        Clip Level Annotations
      </Typography>
      <Typography>
        We have variety in lighting conditions, including both night and daytime recordings.
      </Typography>
      <MultiVideoAnnotated fids={['paris272_8271', 'london167_5118']} />
    </Section>
  )
}

const ExploreSlide = ({ menu }) => {
  const [ fid, setFileId ] = useState(annotations.locations[0]);
  return (
    <Section menu={menu}>
      <Typography variant='h2' gutterBottom>
        Explore
      </Typography>
      <Typography>
        Here's a small sample of the clips available.
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="demo-explore-clips">File ID</InputLabel>
        <Select
          labelId="demo-explore-clips"
          value={fid}
          label="File ID"
          onChange={e => setFileId(e.target.value)}
        >
          {annotations.locations.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </Select>
      </FormControl>
      <Box>
      <MultiVideoAnnotated fids={[fid]} sx={{ maxWidth: '40em' }} />
      </Box>
      
    </Section>
  )
}


const StatsSlide = ({ menu }) => {
  return (
    <Section wide menu={menu}>
      <Typography variant='h2' gutterBottom textAlign='center'>
          What's the composition of the labeled dataset?
        </Typography>
      {/* <Typography variant='h6'>Amount of Labeled Data:</Typography>
        <ProportionChart labels={['labeled', 'unlabeled']} values={[4, 9]} unit='hrs' colors={['#aaaaff', '#aaffff']} />
        <Typography variant='h6'>Amount by time of day:</Typography>
        <ProportionChart labels={['night', 'day']} values={[0.5, 3.5]} unit='hrs' colors={['#aaaaff', '#aaffff']} /> */}


        {/* <Typography variant='h5'>Video-level statistics:</Typography> */}

        <Typography variant='h5' mt={3}>What kind of audio do they have?</Typography>
        <Box sx={{ height: 30 }}>
          <SingleBar data={annotations.stats.audio_type_counts} unit='videos' />
        </Box>
        <Typography variant='h5'  mt={3}>How many videos were labeled at each location?</Typography>
        <Box sx={{ height: 600 }}>
          <Bar data={annotations.stats.location_counts} layout='horizontal' margin={100} unit='videos' />
        </Box>
        <Typography variant='h5'  mt={3}>How many videos were labeled in each city?</Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={annotations.stats.city_counts} layout='horizontal' margin={100} unit='videos' />
        </Box>


        <Typography variant='h5'  mt={3}>How many day and night videos?</Typography>
        <Box sx={{ height: 30 }}>
          <SingleBar data={annotations.stats.night_counts} unit='videos' />
        </Box>
        <Typography variant='h5'  mt={3}>How many videos with non-identifiable vehicle sound (NIVS)?</Typography>
        <Box sx={{ height: 30 }}>
          <SingleBar data={annotations.stats.non_identifiable_vehicle_sound_counts} unit='videos' />
        </Box>
        <Typography variant='h5'  mt={3}>How many videos with offscreen sounds?</Typography>
        <Box sx={{ height: 30 }}>
          <SingleBar data={annotations.stats.offscreen_counts} unit='videos' />
        </Box>

        <Typography variant='h5'  mt={3}>How many individual vehicles are there in the dataset?</Typography>
        <Stack direction='row' sx={{ flexWrap: 'wrap', justifyContent: 'stretch', '> *': { flex: '1 1 200px' } }}>
          <Box>
            <Box sx={{ height: 90 }}>
              <Bar data={annotations.stats.video_label_object_counts} margin={70} unit='vehicles' />
            </Box>
            <Typography sx={{ textAlign: 'center' }}><b>Video</b></Typography>
          </Box>
          <Box>
            <Box sx={{ height: 90 }}>
              <Bar data={annotations.stats.audio_label_object_counts} margin={70} unit='vehicles' />
            </Box>
            <Typography sx={{ textAlign: 'center' }}><b>Audio</b></Typography>
          </Box>
        </Stack>
        
        <Typography variant='h5'  mt={3}>How many boxes are there in total?</Typography>
        <Box sx={{ height: 90 }}>
          <Bar data={annotations.stats.video_label_box_counts} unit='boxes' margin={70} />
        </Box>

        <Typography variant='h5'  mt={3}>How common is it to have multiple vehicles in one frame?</Typography>
        <Box sx={{ height: 180 }}>
          <Bar data={annotations.stats.vehicle_polyphony_counts} layout='vertical' margin={50} unit='frames' xLegend='vehicles'  />
        </Box>

        <Typography variant='h5'  mt={3}>How many frames have at least one vehicle?</Typography>
        <Box sx={{ height: 30 }}>
          <SingleBar data={annotations.stats.has_vehicle_counts} unit='frames' />
        </Box>
    </Section>
  )
}

const UnlabeledStatsSlide = ({ menu }) => {
  return (
    <Section wide menu={menu}>
      <Typography variant='h2' gutterBottom textAlign='center'>
          What's the composition of the unlabeled dataset?
        </Typography>
      
    </Section>
  )
}



const BibSlide = ({ menu }) => {
  return (
    <Section alignItems='center' menu={menu}>
        <Typography variant='h2' gutterBottom textAlign='center'>
          Paper, Dataset, Code
        </Typography>
        <Stack spacing={2} py={1} pb={3} direction='row' justifyContent='center'>
          <Button component={Link} target="_blank" rel="noopener" href='https://zenodo.org/record/6658386' variant='outlined' startIcon={<DataArrayIcon />}>Dataset</Button>
          <Button component={Link} target="_blank" rel="noopener" href='https://ieeexplore.ieee.org/document/9747644' variant='outlined' startIcon={<ArticleIcon />}>Publication</Button>
          <Button component={Link} target="_blank" rel="noopener" href='https://github.com/magdalenafuentes/urbansas' variant='outlined' startIcon={<GitHubIcon />}>Github</Button>
          {/* <Button component={Link} href='#' variant='outlined' startIcon={<DataArrayIcon />}>soundata</Button> */}
          {/* <Button component={Link} href='#' variant='outlined' startIcon={<ArticleIcon />}>Arxiv</Button> */}
        </Stack>
        <Code lang='python'>{`
# Coming Soon! NOT READY YET!
# Follow PR: https://github.com/soundata/soundata/pull/99/files#diff-ef059c5b067235e1cfdd709dab224ec81516942eec3ec42ecdef17a2f898ba2a
from soundata.datasets import urbansas

dataset = urbansas.Dataset()

clip = dataset.clip(default_clipid)
urbansas.load_video(clip.video_path)
          `.trim()}</Code>

        <Code lang='latex'>{`
@InProceedings{fuentes_2022_icassp,
  author={Fuentes, Magdalena and Steers, Bea and Zinemanas, Pablo and Rocamora, Mart??n and Bondi, Luca and Wilkins, Julia and Shi, Qianyi and Hou, Yao and Das, Samarjit and Serra, Xavier and Bello, Juan Pablo},
  booktitle={ICASSP 2022 - 2022 IEEE International Conference on Acoustics, Speech and Signal Processing (ICASSP)}, 
  title={Urban Sound  amp; Sight: Dataset And Benchmark For Audio-Visual Urban Scene Understanding}, 
  year={2022},
  volume={},
  number={},
  pages={141-145},
  doi={10.1109/ICASSP43922.2022.9747644}}
`.trim()}</Code>
      
      </Section>
  )
}

const RelatedWorkSlide = ({ menu }) => {
  return (
    <Section alignItems='center' menu={menu}>
      <Box>
      <Typography variant='h2' gutterBottom>
        Work using Urbansas
      </Typography>

      <RelatedWorkCard 
        title={'How to Listen? Rethinking Visual Sound Localization'}
        src='rcgrad.png'
        description={`
        
        `}
        paperUrl='https://arxiv.org/abs/2204.05156'
        codeUrl='https://github.com/hohsiangwu/rethinking-visual-sound-localization'
      >
        <Typography variant='body1' gutterBottom>
        This paper investigates how back-propagation with audio-visual contrastive learning
        can be utilized to do localization of sounding sources through images conditioned on audio. 
        They compare between different models and audio-visual datasets and found that in  
        several of the datasets there was a strong
        bias towards single-source scenes where objects are large and central to the frame and thus, 
        a naive baseline was able to 
        achieve competative results just by placing a rectangle in the center of the screen.
        They showed that Urbansas does not have as strong biases and therefore has less incentive
        to overfit to a naive baseline.
        </Typography>
      </RelatedWorkCard>

      <RelatedWorkCard 
        title={'Towards Vehicle Sound Source Localization in Urban Scenes'}
        // paperUrl='https://arxiv.org/abs/2204.05156'
        codeUrl='https://github.com/juliawilkins/localize_sound_density'
      >
        <Typography variant='body1' gutterBottom>
        This work investigates audio-source localization using Urbansas. 
        Due to the complexities in multi-source audio localization, 
        they instead predict audio direction as a mixture of gaussian distributions
        (as a function of angle). Their method yields promising results in a supervised 
        setting for vehicle sound source localization, outperforming
        the beamforming baseline, and providing more interpretable results
        than previous binary formulations.
        </Typography>
      </RelatedWorkCard>

      <RelatedWorkCard 
        title={'...'}
        // src=''
        // description={`
        // `}
        // paperUrl='https://arxiv.org/abs/2204.05156'
        // codeUrl='https://github.com/hohsiangwu/rethinking-visual-sound-localization'
      />

      {/* Here's a list of concurrent research on audio-visual localization.
        <ul>
          <li>Julia</li>
          <li>Ho-Hsiang</li>
          <li>TAU</li>
          <li>Montevideo</li>
          <li>Sound of Pixels</li>
        </ul>
        Table of related datasets with features? */}
      </Box>
    </Section>
  )
}

// .img-gradient:after {
//   content:'';
//   position:absolute;
//   left:0; top:0;
//   width:100%; height:100%;
//   display:inline-block;
//   background: linear-gradient(to bottom, rgba(0,47,75,0.5) 0%,rgba(220, 66, 37, 0.5) 100%);
// }
// .image::before {
//   content: '';
//   position: absolute;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   z-index: 1;
// }

// .image:hover,
// .image:focus {
//   transform: translate(-9px, -9px);
//   box-shadow: 10px 10px #95e1d3;
// }

// .image:hover::before,
// .image:focus::before {
//   background-image: -moz-linear-gradient( 90deg, rgb(252, 227, 138) 0%, rgb(243, 129, 129) 100%);
//   background-image: -webkit-linear-gradient( 90deg, rgb(252, 227, 138) 0%, rgb(243, 129, 129) 100%);
//   background-image: -ms-linear-gradient( 90deg, rgb(252, 227, 138) 0%, rgb(243, 129, 129) 100%);
//   mix-blend-mode: overlay;
// }
const Author = ({ name, src, size=120, menu }) => {
  return (<Stack justify='center' menu={menu} m={2}>
    <Avatar alt={name} src={src} sx={{ 
      width: size, height: size,
      position: 'relative',
      ':after': {
        content: '""',
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0, zIndex: 1,
        background: theme => theme.palette.background.brighterGradient,
        mixBlendMode: 'overlay',
      }
    }} />
    <Typography variant='subtitle' gutterBottom>
      {name}
    </Typography>
  </Stack>)
}

const AuthorSlide = ({ menu }) => {
  return (
    <Section alignItems='center' menu={menu}>
      <Typography variant='h2' gutterBottom>
        People
      </Typography>
      <Stack direction='row' align='center' sx={{ justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <Author name='Magda' src='authors/magda.png' />
        <Author name='Bea' src='authors/bea.png' />
        <Author name='Pablo' src='authors/pablo.png' />
        <Author name='Martin' src='authors/martin.png' />
        <Author name='Luca' src='authors/luca.png' />
        <Author name='Julia' src='authors/julia.png' />
        <Author name='Qianyi' src='authors/qianyi.png' />
        <Author name='Yao' src='authors/yao.png' />
        <Author name='Samarjit' src='authors/samarjit.png' />
        <Author name='Xavier' src='authors/xavier.png' />
        <Author name='Juan' src='authors/juan.png' />
      </Stack>
    </Section>
  )
}

const Footer = () => {
  return (
    <AppBar position="static">
      <Toolbar sx={{ py: 5, justifyContent: 'center' }}>
        <Typography>
          Copyright ?? MARL, NYU 2022
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

const App = () => {
  return (
    <Box sx={{ 
      // '> *:not(.with-bg):nth-of-type(even)': { backgroundImage: theme => theme.palette.background.darkGradient },
      '> *:not(.with-bg):nth-of-type(odd)': { backgroundImage: theme => theme.palette.background.lightGradient }
     }}>
      <NavProvider ignoreHashFor={['Urbansas']}>
        <Nav />
        <TitleSlide menu='Urbansas' />
        <WhySlide menu='why' />
        <LocationsSlide menu='scenes' />
        <AnnotationsSlide menu='annotations' />
      
      {/* <Section full>
        <Typography variant='h5' gutterBottom mt={3}>
          Realistic Data (show Ho-Hsiang's heatmap distribution plot)
        </Typography>
        <Typography variant='h5' gutterBottom mt={3}>
          Stereo Audio (some audio localization figure?)
        </Typography>
      </Section> */}

        <ChallengingSlide />
        <ClipLevelSlide />
        <ExploreSlide menu='explore' />
        <StatsSlide menu='stats' />
        <BibSlide menu='dataset' />
        <RelatedWorkSlide menu='related' />
        <AuthorSlide menu='people' />
      </NavProvider>
      <Footer />
    </Box>
  );
}

export default App;
