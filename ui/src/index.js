import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ChatBotInterface from './components/ChatBotInterface.jsx';
import ReactApp from './components/ReactApp.jsx';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ReactApp />
    <ChatBotInterface />
  </React.StrictMode>
);

