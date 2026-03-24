import requests

url = "http://127.0.0.1:5000/predict_batch"

files = {'file': open('sample.csv', 'rb')}

res = requests.post(url, files=files)

print(res.text)