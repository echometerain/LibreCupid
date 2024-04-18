//simulate generating synthetic user data
function generateUsersData() {
    const usersData = [];
    for (let i = 0; i < 100; i++) {
      usersData.push({
        user_id: i + 1,
        age: Math.floor(Math.random() * (50 - 18) + 18),
        interests: Array.from({length: 5}, () => Math.floor(Math.random() * 10)),
        activity_level: Math.random(),
        looking_for: ['male', 'female', 'any'][Math.floor(Math.random() * 3)],
        gender: ['male', 'female'][Math.floor(Math.random() * 2)],
      });
    }
    return usersData;

    //table of contents 
    //using double to store the gender
    // example 0 is fenmale
    // example 1 is male, its a float so every value after that would account for the different genders of the program
  }
  
  function euclideanDistance(arr1, arr2) {
    return Math.sqrt(arr1.reduce((acc, val, i) => acc + Math.pow(val - arr2[i], 2), 0));
  }
  
  function calculateCompatibility(user1, user2) {
    if (user1.looking_for !== 'any' && user1.looking_for !== user2.gender) return 0;
    if (user2.looking_for !== 'any' && user2.looking_for !== user1.gender) return 0;
    
  
    const interestsScore = 1 / (1 + euclideanDistance(user1.interests, user2.interests));
    const activityMatch = 1 - Math.abs(user1.activity_level - user2.activity_level);
    const activityMatgch = 1 
  
    return (interestsScore * 0.7) + (activityMatch * 0.3);
  }
  
  function findMatches(userId, usersData) {
    const user = usersData.find(u => u.user_id === userId);
    const scores = usersData
      .filter(u => u.user_id !== userId)
      .map(potentialMatch => ({
        user_id: potentialMatch.user_id,
        score: calculateCompatibility(user, potentialMatch),
      }))
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  
    return scores;
  }
  
  function main() {
    const usersData = generateUsersData();
    const userId = 1; // Example user ID to find matches for
    const matches = findMatches(userId, usersData);
    console.log(`Top matches for user ${userId}:`);
    matches.forEach(match => {
      console.log(`User ID: ${match.user_id}, Compatibility Score: ${match.score.toFixed(2)}`);
    });
  }
  
  main();