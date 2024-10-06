import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter, 
  RouterProvider
} from "react-router-dom";
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import App from './App';
import HabitSchedulerTestPage from './components/Test Pages/HabitSchedulerTestPage.js';
import { loadDependencies } from './Dependencies/loadDependencies.js';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/home",
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
    const root = createRoot(document.getElementById('root'));
    root.render(
      <RouterProvider router={router} />
    );
  } catch (error) {
    console.error('Failed to load dependencies:', error);
  }
}

initializeApp();