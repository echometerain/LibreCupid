import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to Our Dating App</h1>
      <p>Find your match today!</p>
      <div className="navigation">
        <Link to="/matches">View Matches</Link>
        <Link to="/profile">Your Profile</Link>
      </div>
    </div>
  );
}

export default HomePage;