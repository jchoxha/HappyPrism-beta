import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter, 
  RouterProvider
} from "react-router-dom";
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import App from './App';
import { loadDependencies } from './Dependencies/loadDependencies.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/app",
    element: <App />,
  },
]);

async function initializeApp() {
  try {
    await loadDependencies();
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to load dependencies:', error);
  }
}

initializeApp();