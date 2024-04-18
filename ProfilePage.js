import React, { useState } from 'react';

function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Your Name',
    age: 30,
    interests: ['Your Interests'],
  });

  // Add functionality to update profile
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    // Update profile in the backend
  };

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      <p>Name: {profile.name}</p>
      <p>Age: {profile.age}</p>
      <p>Interests: {profile.interests.join(', ')}</p>
      {/* Add form or modal to edit profile */}
    </div>
  );
}

export default ProfilePage;