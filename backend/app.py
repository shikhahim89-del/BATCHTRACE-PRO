from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

# ✅ Paste your CORRECT MongoDB link here (from Atlas)
client = MongoClient("mongodb+srv://shikhahim89_db_user:zhZ2ZG97yDKQnSae@cluster0.y7dkuix.mongodb.net/batchtrace_pro")

db = client["batchtrace_pro"]
collection = db["data"]

# ✅ Home route
@app.route("/")
def home():
    return "API is running 🚀"

# ✅ Insert data
@app.route("/add", methods=["POST"])
def add_data():
    data = request.json
    collection.insert_one(data)
    return jsonify({"message": "Data added successfully"})

# ✅ Get all data
@app.route("/get", methods=["GET"])
def get_data():
    data = list(collection.find({}, {"_id": 0}))
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)