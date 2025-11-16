import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/style.css';
import LoginPage from './pages/LoginPage';
import './styles/login-style.css';
import RegisterPage from './pages/RegisterPage';
import UserConstellationsPage from './pages/UserConstellations';
// @ts-expect-error For some reason this import gives an error even though the font exists
import "@fontsource-variable/inter";

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
    path : '/userConstellations',
    element : <UserConstellationsPage/>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
