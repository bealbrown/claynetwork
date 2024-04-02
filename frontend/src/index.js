import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import App3d from './App_3d';
import App_with_neighbors from './App_3d_with_neighbors';
import App_newest from './App_newest';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App_newest />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
