import requests

def fetch_trivia_questions():
    response = requests.get("https://opentdb.com/api.php?amount=1")
    trivia_questions = response.json()
    return trivia_questions

# Fetch and print trivia questions to test
print(fetch_trivia_questions())
