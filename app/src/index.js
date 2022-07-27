import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import './index.css';
import App from "./App";
import SharedTextarea from './components/shared-textarea';
import SharedTerminal from './components/shared-terminal';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="textarea/:room" element={<SharedTextarea />} />
      <Route path="terminal/:room" element={<SharedTerminal />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);
