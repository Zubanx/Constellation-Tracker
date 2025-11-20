import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

// Pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Constellations from "./pages/Constellations/Constellations";
import ObservationsList from "./pages/Observations/Observations";
import NewObservation from "./pages/NewObservations/NewObservations";
import ConstellationDetail from "./pages/ConstellationDetail/ConstellationDetail";
import ConfirmEmail from "./pages/ConfirmEmail/ConfirmEmail";
import EmailSent from "./pages/EmailSent/EmailSent";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// Components
import Navbar from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";

//import "./App.css";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />

            {/* Auth Routes - redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route path="/register" element={<Register />} />

            {/* Email Confirmation Routes - Public (no auth required) */}
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/email-sent" element={<EmailSent />} />

            {/* Forgot Password Route */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* Observations Routes */}
            {/* List all observations */}
            <Route
              path="/observations"
              element={
                <PrivateRoute>
                  <ObservationsList />
                </PrivateRoute>
              }
            />

            {/* Add new observation - accessed from Dashboard "Log Observation" button */}
            <Route
              path="/observations/new"
              element={
                <PrivateRoute>
                  <NewObservation />
                </PrivateRoute>
              }
            />

            {/* Add observation for specific constellation */}
            <Route
              path="/constellations/:id/add-observation"
              element={
                <PrivateRoute>
                  <NewObservation />
                </PrivateRoute>
              }
            />

            {/* Constellations Routes */}
            <Route
              path="/constellations"
              element={
                <PrivateRoute>
                  <Constellations />
                </PrivateRoute>
              }
            />
            <Route
              path="/constellations/:id"
              element={
                <PrivateRoute>
                  <ConstellationDetail />
                </PrivateRoute>
              }
            />

            {/* Profile Route (commented out) */}
            {/* <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            /> */}

            {/* 404 and catch-all */}
            {/* <Route path="/404" element={<NotFound />} /> */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

export default App;
