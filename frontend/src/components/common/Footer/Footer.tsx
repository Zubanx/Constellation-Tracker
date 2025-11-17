import React from 'react';
// Assuming you would have a CSS file for styles
// import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>&copy; {currentYear} My Company. All rights reserved.</p>
        <div className="social-links">
          <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;