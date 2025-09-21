import requests
import json

url = "http://localhost:8000/api/v1/tasks/"
headers = {"Content-Type": "application/json"}
data = {
    "task_type": "analyst",
    "prompt": "Test task",
    "history": []
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")