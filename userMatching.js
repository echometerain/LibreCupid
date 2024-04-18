// Sample user profiles
const users = [
  { id: 1, name: 'Alice', interests: ['music', 'movies', 'reading'] },
  { id: 2, name: 'Bob', interests: ['sports', 'travel', 'music'] },
  { id: 3, name: 'Charlie', interests: ['coding', 'music', 'games'] },
  // Assume the current user is defined last
  { id: 4, name: 'Current User', interests: ['movies', 'reading', 'travel'] }
];

// Matching algorithm to find the best match based on shared interests
function findBestMatch(currentUser, users) { //change this algorithm to the preference liking
  let bestMatch = null;
  let highestScore = 0;

  users.forEach(user => {
    // Skip if it's the current user
    if (user.id === currentUser.id) return;

    // Calculate the match score based on shared interests
    const sharedInterests = user.interests.filter(interest => currentUser.interests.includes(interest));
    const score = sharedInterests.length;

    // Update best match if this user has a higher score
    if (score > highestScore) {
      bestMatch = user;
      highestScore = score;
    }
  });

  return bestMatch;
}

// Function to find a match for the current user
function findMatch() {
  // Assuming the last user in the array is the current user
  const currentUser = users[users.length - 1];

  const match = findBestMatch(currentUser, users);

  if (match) {
    console.log(`Best match for ${currentUser.name} is ${match.name} with shared interests: ${match.interests.join(', ')}`);
  } else {
    console.log('No match found.');
  }
}

// Call the findMatch function to execute the matching process
findMatch();
