import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/style.css';
import LoginPage from './pages/LoginPage';
import './styles/login-style.css';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import './styles/home-style.css';
// @ts-expect-error For some reason this import gives an error even though the font exists
import "@fontsource-variable/inter";
import GalleryPage from './pages/GalleryPage';

const router = createBrowserRouter([
  {
    path : '/',
    element : <LoginPage/>
  },
  {
    path : '/register',
    element : <RegisterPage/>
  },
  {
    path : '/home',
    element : <HomePage/>
  },
  {
    path : '/gallery',
    element : <GalleryPage/>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
