import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import ImageListItem from '@mui/material/ImageListItem';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
// import CardMedia from '@mui/material/CardMedia';

import { DataGrid } from '@mui/x-data-grid';

import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

import { NextButton, useScrollId, useScrollVisible } from './Nav';
import { useNav } from './Nav2';


import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
// import latex from 'react-syntax-highlighter/dist/esm/languages/prism/latex';
import { nightOwl as syntaxStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
// SyntaxHighlighter.registerLanguage('python', python);
// SyntaxHighlighter.registerLanguage('latex', latex);




const backgroundUrl = (theme, url) => ({
  background: `url(${url}) no-repeat center center fixed, ${theme.palette.background.darkGradient}`,
  backgroundSize: 'cover',
})


export const Section = ({ children, sx, background, full, wide, menu, noNext, ...props }) => {
  // const [isin, ref] = useScrollVisible({ timeout: 300, once: true });
  const ref = useNav(menu)
  

  return <Box ref={ref}
    display='flex' flexDirection='column' 
    justifyContent='center'
    sx={{ 
      minHeight: full ? '100vh' : null,
      // maxWidth: '100vw',
      // width: '100vw',
      background: theme => background && `url(${background}) no-repeat center center fixed, ${theme.palette.background.brightGradient}`,
      backgroundSize: 'cover',
      backgroundBlendMode: 'multiply',
      // ...(background && backgroundUrl(background)),
      // backgroundColor: (theme) => theme.palette.background.darkGradient,
      ...sx,
    }} px={3} {...props}>
      <Box maxWidth={wide ? '1200px' : '900px'} width='100%' py={10} margin='auto'>
        {/* {children} */}
        {/* <Fade in={isin} appear timeout={1000}> */}
          <div style={{ maxWidth: '100%' }}>{children}</div>
        {/* </Fade> */}
      </Box>
      {/* <button><DownArrow /></button> */}
      {/* {!noNext && <Box display='flex' justifyContent='center'>
        <NextButton sectionRef={ref} />
      </Box>} */}
  </Box>
}

export const Highlight = ({ children, ...sx }) => {
  return <Box display='inline-block' sx={{ 
    backgroundColor: (theme) => alpha(theme.palette.background.default, 0.5),
    backdropFilter: 'blur(3px)',
    // backgroundImage: theme => theme.palette.background.darkGradient,
  }} px={2} {...sx}>{children}</Box>
}

// const StandardImageList = ({ images, srcKey }) => {
//   return (
//     <Stack direction='row' flexWrap='wrap' sx={{ 
//       '> *': { flexShrink: 1, flexGrow: 1, flexBasis: '100px' }
//      }}>
//       {images && srcKey && images.map(d => (
//         <img key={d[srcKey]} src={d[srcKey]} srcSet={d[srcKey]} alt={d[srcKey]} loading="lazy" />
//       ))}
//       <div></div>
//     </Stack>
//   );
// }

const Video = ({ src }) => {
  return (
    src?.endsWith('gif') ? 
    <img src={src} srcSet={src} alt={src} loading="lazy" />
    : (
      <video autoPlay loop muted>
        <source src={src} type="video/mp4" />
      </video>
    )
  )
}



export const StandardImageList = ({ images }) => {
  return (
    <Stack direction='row' sx={{ flexWrap: 'wrap' }}>
      {images && images.map(src => (
          <Video key={src} src={src} />
      ))}
    </Stack>
  );
}

// export const StandardImageList = ({ images }) => {
//   return (
//     <ImageGalleryList>
//       {images && images.map(src => (
//         <ImageListItem key={src}>{
//           <Video src={src} />
//         }</ImageListItem>
//       ))}
//     </ImageGalleryList>
//   );
// }

const ImageGalleryList = styled('ul')(({ theme }) => ({
  display: 'grid',
  padding: 0,
  margin: '0 auto',
  gap: 2,
  maxWidth: '80rem',
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: 'repeat(3, 1fr)'
  },
  [theme.breakpoints.up('sm')]: {
      gridTemplateColumns: 'repeat(4, 1fr)'
  },
  [theme.breakpoints.up('md')]: {
      gridTemplateColumns: 'repeat(5, 1fr)'
  },
  [theme.breakpoints.up('lg')]: {
      gridTemplateColumns: 'repeat(6, 1fr)'
  },
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(7, 1fr)'
},
}));


export const Code = ({ children, lang=null, ...props }) => {
  return <Box sx={{
    '> *': {
      padding: '1rem',
      // background: theme => alpha(theme.palette.text.primary, 0.02),
      overflow: 'auto',
      borderRadius: '8px',
      border: '1px solid white',
      // fontSize: '0.7rem',
      maxWidth: '100%'
    }
  }} {...props}>
    {lang ? 
    <SyntaxHighlighter language={lang} style={syntaxStyle}>
      {children}
    </SyntaxHighlighter>
    : <pre><code>{children}</code></pre>}
  </Box>
}

// const ClipboardButton = ({ text }) => {
//   return (

//   )
// }

async function copyTextToClipboard(text) {
  return 'clipboard' in navigator ? (await navigator.clipboard.writeText(text)) : document.execCommand('copy', true, text);
}


export const MultiTableSample = ({ tables }) => {
  const [value, setValue] = React.useState(0);

  return (<Box>
    <Box sx={{ borderBottom: 1, borderColor: 'divider', minHeight: '100px' }}>
      <Tabs value={value} onChange={(e, x) => setValue(x)}>
        {Object.keys(tables).map(x => <Tab label={x} key={x} />)}
      </Tabs>
    </Box>
    {Object.entries(tables).map(([k, x], i) => <div hidden={value !== i} key={k}><Table data={x} /></div>)}
  </Box>)
}

const Table = ({ data }) => {
  const columns = [...(data?.length ? Object.keys(data[0]).map(k => ({ field: k })) : [])];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={data && data.map((d, id) => ({ id, ...d }))}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
    </div>
  )
}



export const RelatedWorkCard = ({ title, description, children, src, links }) => {
  return (
    <Card>
      <CardContent>
        <Stack direction='row' spacing={2}>
        <img src={src} style={{ borderRadius: '8', maxWidth: '50%' }} />
          <Box>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          {children}
          </Box>
        </Stack>
        
        
      </CardContent>
      <CardActions>
        {links}
        {/* <Button size="small">Share</Button>
        <Button size="small">Learn More</Button> */}
      </CardActions>
    </Card>
  );
}


export const ProportionChart = ({ labels, values, colors, unit }) => {
  const total = values.reduce((x, xi) => x+xi, 0);
  return (
    <Stack mb={1}>
      <Stack direction='row' sx={{ height: '2em', width: '100%' }}>
        {labels.map((l, i) => 
        <Box key={l} sx={{ 
            display: 'flex',
            alignItems: 'center',
            padding: '0 1em',
            backgroundColor: colors[i], 
            height: '100%', 
            width: `${100*values[i]/total}%`,
            whiteSpace: 'nowrap',
            overflow: 'visible',
          }}><b>{l}</b>: {values[i]} {unit}</Box>)}
      </Stack>
      <Box>
      {total} {unit} total
      </Box>
    </Stack>
  )
}