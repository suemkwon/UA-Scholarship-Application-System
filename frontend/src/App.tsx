import React from 'react';
import logo from './logo.svg';
import './App.css';
import {useNavigate} from 'react-router';
import SignIn from './pages/signin';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

function App() {

  return (
      <AppRoutes />
  );
}


export default App;