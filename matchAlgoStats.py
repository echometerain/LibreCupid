import numpy as np
import pandas as pd
from scipy.spatial.distance import euclidean

# Generate synthetic user data
np.random.seed(42)  # For reproducibility
users_data = pd.DataFrame({
    'user_id': range(1, 101),
    'age': np.random.randint(18, 50, size=100),
    'interests': [np.random.randint(1, 10, size=5) for _ in range(100)],  # Simulate interest scores in 5 areas
    'activity_level': np.random.rand(100),  # User activity level (0 to 1)
    'looking_for': np.random.choice(['male', 'female', 'any'], size=100),  # User preference
    'gender': np.random.choice(['male', 'female'], size=100),
})

def calculate_compatibility(user1, user2):
    # Check if preferences align
    if user1['looking_for'] != 'any' and user1['looking_for'] != user2['gender']:
        return 0
    if user2['looking_for'] != 'any' and user2['looking_for'] != user1['gender']:
        return 0
    
    # Calculate shared interests score
    interests_score = 1 / (1 + euclidean(user1['interests'], user2['interests']))
    
    # Calculate activity level match
    activity_match = 1 - abs(user1['activity_level'] - user2['activity_level'])
    
    # Combine scores (weights can be adjusted)
    compatibility_score = (interests_score * 0.7) + (activity_match * 0.3)
    
    return compatibility_score

def find_matches(user_id, users_data):
    user = users_data.loc[users_data['user_id'] == user_id].iloc[0]
    scores = []
    
    for _, potential_match in users_data.iterrows():
        if potential_match['user_id'] == user_id:
            continue
        score = calculate_compatibility(user, potential_match)
        if score > 0:  # Only consider positive scores
            scores.append((potential_match['user_id'], score))
    
    # Sort matches by score
    scores.sort(key=lambda x: x[1], reverse=True)
    
    return scores[:10]  # Return top 10 matches

def main():
    user_id = 1  # Example user ID to find matches for
    matches = find_matches(user_id, users_data)
    print(f"Top matches for user {user_id}:")
    for match_id, score in matches:
        print(f"User ID: {match_id}, Compatibility Score: {score:.2f}")

if __name__ == "__main__":
    main()