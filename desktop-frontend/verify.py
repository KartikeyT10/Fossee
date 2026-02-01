import requests
import os
import time

URL = "http://localhost:8000/api/datasets/"
FILE_PATH = "../sample_equipment_data.csv"

def test_api():
    print(f"Uploading {FILE_PATH}...")
    try:
        with open(FILE_PATH, 'rb') as f:
            response = requests.post(URL, files={'file': f})
        
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print("Upload Success!")
            print("Stats Summary Keys:", data['summary_stats'].keys())
            if 'numerical_stats' in data['summary_stats']:
                 print("Numerical Stats:", data['summary_stats']['numerical_stats'])
            return True
        else:
            print("Failed:", response.text)
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_list():
    try:
        response = requests.get(URL)
        print(f"List Status: {response.status_code}")
        if response.status_code == 200:
            count = len(response.json())
            print(f"Total Datasets: {count}")
            return True
        return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    # Wait for server to be fully ready
    time.sleep(2) 
    if test_api() and test_list():
        print("Verification PASSED")
    else:
        print("Verification FAILED")
