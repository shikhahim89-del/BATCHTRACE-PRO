from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["batchDB"]
collection = db["batches"]


@app.route('/')
def home():
    return "Backend running 🚀"


# ✅ GET
@app.route('/api/batches', methods=['GET'])
def get_batches():
    data = list(collection.find())

    for item in data:
        item["_id"] = str(item["_id"])

    return jsonify(data)


# ✅ POST
@app.route('/api/batches', methods=['POST'])
def add_batch():
    data = request.get_json()   # 🔥 FIX (was request.json)

    if not data or "batch" not in data:
        return jsonify({"error": "Batch required"}), 400

    new_batch = {
        "batch": data["batch"],
        "status": data.get("status", "Pending")
    }

    collection.insert_one(new_batch)

    return jsonify({"message": "Batch added"})

@app.route('/api/batches/<id>', methods=['PUT'])
def update_batch(id):
    data = request.get_json()

    collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": data.get("status")}}
    )

    return jsonify({"message": "Updated"})

    


# ✅ DELETE
@app.route('/api/batches/<id>', methods=['DELETE'])
def delete_batch(id):
    try:
        collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Deleted"})
    except:
        return jsonify({"error": "Invalid ID"}), 400

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    print("Signup Data:", data)  # 👈 terminal में दिखेगा

    return jsonify({"message": "Signup success"})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    print("Login Data:", data)  # 👈 terminal में दिखेगा

    return jsonify({"message": "Login success"})


if __name__ == "__main__":
    app.run(debug=True)