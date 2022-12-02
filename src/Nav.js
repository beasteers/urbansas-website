import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

// import DownArrowIcon from './arrow.svg';
import {ReactComponent as DownArrowIcon} from './arrow.svg';
import SvgIcon from '@mui/material/SvgIcon';
import IconButton from '@mui/material/IconButton';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';


const str2id = s => s.toLowerCase().replace(/\W/g,'_')

export const Nav = ({ children }) => {
  const ref = useRef();
  const current = useScrollId(ref.current?.childNodes, document.getElementById('root'));
  console.log(current);

  const pages = React.Children.map(children, ch => (
    ch?.props?.menu ? { name: ch.props.menu, id: str2id(ch.props.menu) } : null)).filter(x=>x)
  return (<Box>
    <AppBar position="sticky" sx={{ background: 'background.default' }}>
      <Box maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'auto' }}>
            {pages.map(({ name, id }) => (
              <Button
                key={id}
                // onClick={handleCloseNavMenu}
                // variant={}
                sx={{ 
                  my: 2, color: theme => name == current ? theme.palette.secondary.main : 'white', 
                  display: 'block',
                  transition: 'color 0.3s ease-in-out'
                }}>
                {name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Box>
    </AppBar>
    <Box ref={ref}>
      {children}
    </Box>
  </Box>)
}

export const NextButton = ({ sectionRef }) => {
    const theme = useTheme();
    return sectionRef.current?.nextSibling && <IconButton aria-label="next" sx={{
      border: '1px solid black',
      borderBottom: 'none',
      height: '3em',
      width: '3em',
      borderRadius: '100% 100% 0 0',
    }} onClick={e => {
      e.preventDefault();
      sectionRef.current.nextSibling.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}>
      {/* <KeyboardArrowDownIcon /> */}
      <SvgIcon component={DownArrowIcon} stroke={theme.palette.text.primary} inheritViewBox />
    </IconButton>
}

export const useScrollId = (sections, element=window) => {
  const [ current, setCurrent ] = useState();
  useEvent(element, 'scroll', () => {
    sections?.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.getBoundingClientRect().top - 50;
      if(0 > sectionTop && 0 <= sectionTop + sectionHeight) {
        if(current !== section) {
          setCurrent(section)
        }
      }
    })
  })
  return current;
}

const useEvent = (object, event, cb) => {
  const ref = useRef();
  ref.current = cb;
  useEffect(() => {
    const e = (...args) => { ref.current?.(...args) }
    object.addEventListener(event, e);
    return () => { object.removeEventListener(event, e) }
  }, [ object, event ])
}


export const useScrollVisible = ({ timeout=0, once }={}) => {
    const [ isVisible, setVisible ] = useState(true);
    const ref = useRef();
    useEffect(() => {
      if(once && isVisible) return;
      const el = ref.current
      let unmounted = false;
      const observer = new IntersectionObserver(entries => {
        setTimeout(() => {
          !unmounted && entries.forEach(e => setVisible(e.isIntersecting))
        }, timeout)
      });
      observer.observe(el);
      return () => { observer.unobserve(el); unmounted = true; };
    }, [ timeout, once, isVisible ]);
    return [ isVisible, ref ];
  }
  