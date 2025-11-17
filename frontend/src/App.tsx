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
import Observations from "./pages/Observations/Observations";
import ConstellationDetail from "./pages/ConstellationDetail/ConstellationDetail";
// import Profile from "./pages/Profile/Profile";
// import NotFound from "./pages/NotFound/NotFound";

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

            {/* Protected Routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/observations/"
              element={
                <PrivateRoute>
                  <Observations />
                </PrivateRoute>
              }
            />
            <Route
              path="/constellations/:id/add-observation"
              element={
                <PrivateRoute>
                  <Observations />
                </PrivateRoute>
              }
            />
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
