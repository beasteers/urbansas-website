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

import GitHubIcon from '@mui/icons-material/GitHub';
import ArticleIcon from '@mui/icons-material/Article';
import DataArrayIcon from '@mui/icons-material/DataArray';

import Avatar from '@mui/material/Avatar';

import annotations from './annotations.json'
import VideoAnnotated from './VideoClip';

import { Section, Code, StandardImageList, MultiTableSample, RelatedWorkCard, ProportionChart } from './PageElements'
// import { Nav } from './Nav'
import { NavProvider, Nav } from './Nav2'

import { Bar } from './Plots'

// const MAIN_BG = 'street_traffic-helsinki-165-5047';
// const MAIN_BG = 'street_traffic-milan-1166-44225';
const MAIN_BG = 'milan1166_44225';

console.log(annotations)




const TitleSlide = ({ menu }) => {
  return (
    <Section className='with-bg' full menu={menu}
          background={annotations.misc[MAIN_BG]?.gif_path}
          sx={{
            color: 'white'
          }}>
        <Typography variant='h1'>
          UrbanSaS
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


const WhySlide = ({ menu }) => {
  return (
    <Section menu={menu}>
        <Typography variant='h2' gutterBottom>
          Why did we compile this dataset?
        </Typography>
        <Typography gutterBottom>
        Automatic audio-visual urban traffic understanding is a growing area of research with many potential applications of value to academia, industry, and the public sector. 
Yet, the lack of well-curated resources for training and evaluating models to research in this area hinders their development.
        </Typography>
        <Typography variant='h2' gutterBottom mt={3}>
          What is this dataset about?
        </Typography>
        <Typography gutterBottom>
        To address this we present a curated audio-visual dataset, Urban Sound & Sight (Urbansas), developed for investigating the detection and localization of sounding vehicles in the wild. Urbansas consists of 12 hours of unlabeled data 
along with 3 hours of manually annotated data, including bounding boxes with classes and unique id of vehicles, and strong audio labels featuring vehicle types and indicating off-screen sounds. 
        </Typography>
        <Stack direction='row' sx={{ justifyContent: 'space-around', textAlign: 'center' }}>
          <Box gutterBottom>
            <Typography variant='h3'>13 hours</Typography>
            <Typography>total</Typography>
          </Box>
          <Box gutterBottom>
            <Typography variant='h3'>4 hours</Typography>
            <Typography>annotated @ 2 FPS</Typography>
          </Box>
          <Box gutterBottom>
            <Typography variant='h3'>9 hours</Typography>
            <Typography>unlabeled</Typography>
          </Box>
        </Stack>
        <Typography variant='h6'>Amount of Labeled Data:</Typography>
        <ProportionChart labels={['labeled', 'unlabeled']} values={[4, 9]} unit='hrs' colors={['#aaaaff', '#aaffff']} />
        <Typography variant='h6'>Amount by time of day:</Typography>
        <ProportionChart labels={['night', 'day']} values={[0.5, 3.5]} unit='hrs' colors={['#aaaaff', '#aaffff']} />

        <Typography variant='h6'>Vehicle counts:</Typography>
        <Box sx={{ height: 30 }}>
          <Bar data={annotations.stats.video_label_box_counts} />
        </Box>
        <Typography variant='h6'>Amount with offscreen sounds:</Typography>
        {/* <ProportionChart labels={['offscreen', 'no offscreen']} values={[1, 3]} unit='hrs' colors={['#aaaaff', '#aaffff']} /> */}
        <Box sx={{ height: 30 }}>
          <Bar data={annotations.stats.offscreen_counts} />
        </Box>

        <Typography variant='h6'>Vehicle polyphony (number of vehicles at one time):</Typography>
        <Typography variant='h6'>Distribution between MAVD and TAU across both labeled and unlabeled:</Typography>
        <Typography variant='h6'>Distribution between different locations:</Typography>
        <Typography variant='h6'>Vehicle detection counts:</Typography>
        <Typography variant='h6'>Vehicle instance counts:</Typography>
        <Typography variant='h6'>Vehicle/No Vehicle:</Typography>
        <Typography variant='h6'>Night/Day:</Typography>
        <Typography variant='h6'>Onscreen/Offscreen:</Typography>
      </Section>
  )
}


const LocationsSlide = ({ menu }) => {
  return (
    <Section wide menu={menu}>
      <Typography variant='h2' gutterBottom>
        42 different locations around the world
      </Typography>
      <StandardImageList images={[
        ...Object.values(annotations.locations).map(d => d.gif_path_sm),
        // ...Object.values(annotations.misc).map(d => d.gif_path_sm),
      ]} />
    </Section>
  )
}

const DescriptionSlide = ({ menu }) => {
  return (
    <Section menu={menu}>
      <Typography variant='h2' gutterBottom>
        Rich Video & Audio Annotations
      </Typography>
      {/* <StandardImageList images={Object.values(annotations.locations).map(d => d.gif_path_sm)} /> */}
      <Box display='flex' flexWrap='wrap' sx={{ '> *': { flexBasis: '200px', flexGrow: 1 }, maxWidth: '70rem', margin: '0 auto' }}>
        <VideoAnnotated fid={'vienna177_5448'} size='md' />
        <VideoAnnotated fid={'prague1153_41096'} size='md' />
      </Box>
      <Typography variant='h6'>Various perspectives:</Typography>
      <Typography variant='h4' gutterBottom mt={10}>
        Un avant-goût ;)
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
        {/* <StandardImageList images={Object.values(annotations.locations)} srcKey='gif_path_sm' /> */}
        <Box display='flex' flexWrap='wrap' sx={{ '> *': { flexBasis: '200px', flexGrow: 1 }, maxWidth: '70rem', margin: '0 auto' }}>
          <VideoAnnotated fid={'paris272_8271'} size='md' />
          <VideoAnnotated fid={'london167_5118'} size='md' />
          {/* <VideoAnnotated fid={'helsinki-164-5044'} size='md' /> */}
          {/* <VideoAnnotated fid={'lisbon1067_41198'} size='md' /> */}
        </Box>
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
      <VideoAnnotated fid={'paris272_8271'} size='md' />
      <VideoAnnotated fid={'london167_5118'} size='md' />
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
  author={Fuentes, Magdalena and Steers, Bea and Zinemanas, Pablo and Rocamora, Martín and Bondi, Luca and Wilkins, Julia and Shi, Qianyi and Hou, Yao and Das, Samarjit and Serra, Xavier and Bello, Juan Pablo},
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

const RelatedWorkSlide = () => {
  return (
    <Section alignItems='center' noNext>
      <Box maxWidth='40rem'>
      <Typography variant='h2' gutterBottom>
        Related Work
      </Typography>

      <RelatedWorkCard 
        title={'How to Listen? Rethinking Visual Sound Localization'}
        src='/rcgrad.png'
        description={`

        `}>

      </RelatedWorkCard>


      Here's a list of concurrent research on audio-visual localization.
        <ul>
          <li>Julia</li>
          <li>Ho-Hsiang</li>
          <li>TAU</li>
          <li>Montevideo</li>
          <li>Sound of Pixels</li>
        </ul>
        Table of related datasets with features?
      </Box>
    </Section>
  )
}


const Author = ({ name, src, size=80 }) => {
  return (<Stack justify='center'>
    <Avatar alt={name} src={src} sx={{ width: size, height: size }} />
    <Typography variant='subtitle' gutterBottom>
      {name}
    </Typography>
  </Stack>)
}

const AuthorSlide = () => {
  return (
    <Section alignItems='center' noNext>
      <Typography variant='h2' gutterBottom>
        People
      </Typography>
      <Stack direction='row' spacing={3} align='center' sx={{ justifyContent: 'space-around' }}>
        <Author name='Magda' src='/logo192.png' />
        <Author name='Bea' src='/logo192.png' />
      </Stack>
    </Section>
  )
}

const Footer = () => {
  return (
    <AppBar position="static">
      <Toolbar sx={{ py: 5, justifyContent: 'center' }}>
        <Typography>
          Copyright © MARL, NYU 2022
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
      <NavProvider>
       {/* <Nav name="Urbansas"> */}
        <Nav />
        <TitleSlide menu='Urbansas' />
        <WhySlide menu='Why' />
        <LocationsSlide menu='Scenes' />
        <DescriptionSlide menu='Description' />
      
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

        <BibSlide menu='access' />
        <RelatedWorkSlide />
        <AuthorSlide />
      {/* </Nav> */}
      </NavProvider>
      <Footer />
    </Box>
  );
}

export default App;
