import React, { useRef, useState, useContext, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';



export const useOnScreen = ref => {
	const [isOnScreen, setOnScreen] = useState(false);

	useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setOnScreen(entry.isIntersecting),
            {threshold: [0.25, 0.5, 0.75]});
		observer.observe(ref.current);
		return () => {
			observer.disconnect();
		};
	}, [ref]);

	return isOnScreen;
};


export const useNav = name => {
	const ref = useRef(null);
	const { setActive, refs } = useContext(NavContext);
	const isOnScreen = useOnScreen(ref);

    useEffect(() => {
        if(name) refs.current[name] = ref;
        return () => { if(name) delete refs.current[name]; }
    }, [refs, name]);

	useEffect(() => {
		isOnScreen && name && setActive(name)
	}, [isOnScreen, setActive, name]);
	return ref;
};


export const NavContext = React.createContext();
export const useNavControl = () => useContext(NavContext);

export const NavProvider = ({ children }) => {
    const refs = useRef({});
	const [active, setActive] = useState('');
    const scrollTo = useCallback((name) => {
		setActive(name);
		refs.current?.[name].current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	return (
		<NavContext.Provider value={{
            active, setActive, scrollTo, refs
        }}>{children}</NavContext.Provider>
	);
};

export const Nav = ({ }) => {
    const { refs, active, scrollTo } = useNavControl();
    return (<AppBar position="sticky" sx={{ background: 'background.default' }}>
        <Box maxWidth="xl">
        <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(refs.current).map((name) => (
                <Button
                key={name}
                onClick={() => scrollTo(name)}
                variant={active === name ? 'outlined' : 'default'}
                sx={{ 
                    my: 2, color: 'white', display: 'block',
                    transition: 'color 0.3s ease-in-out'
                }}>
                {name}
                </Button>
            ))}
            </Box>
        </Toolbar>
        </Box>
    </AppBar>)
  }