import React from 'react';
import twitterIcon from './images/insta.png';
import facebookIcon from './images/twitter.png';

function Header() {
  return (
    <header className="App-header" style={headerStyle}>
      <h3>MCC Guide</h3>
      <nav>
        <a href="#">Information</a>
        <a href="#">College Map</a>
        <a href="https://mcc.edu.in/">Link To Main Website</a>
      </nav>
      <div className="social-media-links" style={socialMediaLinksStyle}>
        <a href="https://www.example.com/twitter" target="_blank" rel="noopener noreferrer">
          <img src={twitterIcon} alt="Twitter" style={iconStyle} />
        </a>
        <a href="https://www.example.com/facebook" target="_blank" rel="noopener noreferrer">
          <img src={facebookIcon} alt="Facebook" style={iconStyle} />
        </a>
      </div>
    </header>
  );
}

const headerStyle = {
  position: 'relative', // Add relative positioning to the header
};

const iconStyle = {
  width: '24px',
  height: '24px',
  marginRight: '10px', // Add some space between icons
};

const socialMediaLinksStyle = {
  position: 'absolute', // Position the social media links absolutely
  top: 0, // Align to the top
  right: 0, // Align to the right
  display: 'flex',
  alignItems: 'center',
};

export default Header;

