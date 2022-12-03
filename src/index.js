import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';


let theme = createTheme({
  palette: {
    mode: 'light',
    // text: {
    //   primary: '#fff',
    // },
    primary: {
      // main: '#891fdc',
      main: '#35005f',
    },
    secondary: {
      // main: 'rgb(24 18 72)',
      main: '#e9bbff',
    },
    background: {
      primary: '#120630',
      // default: '#06001e',
      // paper: '#06001e',
      // brightGradient: 'linear-gradient(45deg, #160040, #6028cd, #d700f5b0, #ffb3ea)',
      // deepGradient: 'linear-gradient(45deg, #160040, #6028cd)',
      // brightGradient: 'linear-gradient(45deg, #d700f5b0, #ffb3ea)',
      // brightGradient: 'linear-gradient(45deg, #6028cd, #ffb3ea)',
      // brightGradient: 'linear-gradient(135deg, #d700f5b0, #6028cd)',
      darkGradient: 'linear-gradient(74deg, #06001e7d, #16006d9e)',
      deepGradient: 'linear-gradient(45deg, #891fdc91, #3b00fd8a)',
      brightGradient: 'linear-gradient(135deg, #3b2bf6b0, #8d46ffa6)',
      brighterGradient: 'linear-gradient(328deg, #1400ffbf, #e009ff85)',
      // lightGradient: 'linear-gradient(45deg, #c892d11a, #2e00c71f)',
      lightGradient: 'linear-gradient(45deg, #c892d114, #2e00c71a)',
    }
  },
  typography: {
    // // In Chinese and Japanese the characters are usually larger,
    // // so a smaller fontsize may be appropriate.
    // fontSize: 12,
  },
});
theme = responsiveFontSizes(theme);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
