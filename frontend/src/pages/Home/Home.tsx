import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

const Home: React.FC = () => {
  const features = [
    {
      icon: '🔭',
      title: 'Track Constellations',
      description: 'Explore and track all 88 recognized constellations from around the world.'
    },
    {
      icon: '📍',
      title: 'Log Observations',
      description: 'Record your stargazing sessions with location, conditions, and personal notes.'
    },
    {
      icon: '📊',
      title: 'Personal Dashboard',
      description: 'View your observation history, statistics, and favorite constellations.'
    },
    {
      icon: '🌟',
      title: 'Detailed Information',
      description: 'Learn about each constellation\'s mythology, brightest stars, and visibility.'
    }
  ];

  return (
    <div className="home-container">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="hero-title mb-4">
                Chart Your Journey Through the Stars
              </h1>
              <p className="hero-subtitle mb-5">
                Track, explore, and document your celestial observations with Constellation Tracker. 
                Your personal guide to the night sky.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-lg me-3 mb-3">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg mb-3">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-constellation">
                <svg width="100%" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Orion constellation representation */}
                  <circle cx="200" cy="80" r="4" fill="#FFD700" className="star-pulse"/>
                  <circle cx="150" cy="150" r="5" fill="#FFD700" className="star-pulse" style={{animationDelay: '0.2s'}}/>
                  <circle cx="250" cy="150" r="5" fill="#FFD700" className="star-pulse" style={{animationDelay: '0.4s'}}/>
                  <circle cx="180" cy="200" r="3" fill="#FFD700" className="star-pulse" style={{animationDelay: '0.6s'}}/>
                  <circle cx="200" cy="210" r="6" fill="#FFD700" className="star-pulse" style={{animationDelay: '0.8s'}}/>
                  <circle cx="220" cy="200" r="3" fill="#FFD700" className="star-pulse" style={{animationDelay: '1s'}}/>
                  <circle cx="120" cy="280" r="4" fill="#FFD700" className="star-pulse" style={{animationDelay: '1.2s'}}/>
                  <circle cx="280" cy="280" r="4" fill="#FFD700" className="star-pulse" style={{animationDelay: '1.4s'}}/>
                  
                  <line x1="200" y1="80" x2="150" y2="150" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="200" y1="80" x2="250" y2="150" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="150" y1="150" x2="180" y2="200" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="250" y1="150" x2="220" y2="200" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="180" y1="200" x2="200" y2="210" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="220" y1="200" x2="200" y2="210" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="150" y1="150" x2="120" y2="280" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                  <line x1="250" y1="150" x2="280" y2="280" stroke="#FFD700" strokeWidth="2" opacity="0.6"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Everything You Need to Explore the Cosmos</h2>
            <p className="section-subtitle">Powerful tools for amateur astronomers and stargazing enthusiasts</p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-md-6 col-lg-3">
                <div className="feature-card h-100">
                  <div className="feature-icon mb-3">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <h3 className="stat-number">88</h3>
                <p className="stat-label">Constellations</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <h3 className="stat-number">1000+</h3>
                <p className="stat-label">Observations Logged</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-item">
                <h3 className="stat-number">365</h3>
                <p className="stat-label">Days of Stargazing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="cta-title mb-4">Ready to Start Your Celestial Journey?</h2>
              <p className="cta-subtitle mb-4">
                Join stargazers worldwide in tracking and exploring the wonders of the night sky.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;