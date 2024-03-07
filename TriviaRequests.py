import requests

def fetch_trivia_questions():
    token_response = requests.get("https://opentdb.com/api_token.php?command=request")
    token = token_response.json().get('token')

    # Constructing the API request with the token
    # Define the category and difficulty
    category = "11"  # This is for "Entertainment: Film". Change as needed.
    difficulty = "easy"  # Can be "easy", "medium", or "hard".

    url = f"https://opentdb.com/api.php?amount=1&type=multiple&category={category}&difficulty={difficulty}&token={token}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(data)
    else:
        print("Failed to retrieve data:", response.status.code)
# Fetch and print trivia questions to test
print(fetch_trivia_questions())
