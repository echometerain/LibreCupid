import React, { useState, useEffect } from 'react';
import UserProfile from '../components/UserProfile';

function MatchesPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Fetch matches from the backend or use static data
    const fetchedMatches = [
      { id: 1, name: 'Alex', age: 29, interests: ['Hiking', 'Reading', 'Coding'] },
      // Add more matches
    ];
    setMatches(fetchedMatches);
  }, []);

  return (
    <div className="matches-page">
      <h1>Your Matches</h1>
      <div className="matches-list">
        {matches.map(match => (
          <UserProfile key={match.id} user={match} />
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;