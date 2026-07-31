from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps
from bson.objectid import ObjectId
import os

load_dotenv()

app = Flask(__name__)

# ✅ FIXED CORS (IMPORTANT)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

bcrypt = Bcrypt(app)

JWT_SECRET = os.getenv("JWT_SECRET", "secret123")

# ---------------- DATABASE ----------------
client = MongoClient(os.getenv("MONGO_URI"))
db = client["batchDB"]

users_collection = db["users"]
batches_collection = db["batches"]

# ---------------- TOKEN ----------------
def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = auth.split(" ")[1]
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = decoded
        except Exception as e:
            print("TOKEN ERROR:", e)
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)
    return wrapper

# ---------------- REGISTER ----------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True)  # ✅ FIX

        if not data:
            return jsonify({"error": "No data received"}), 400

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()
        name = data.get("name", "").strip()

        if not email or not password or not name:
            return jsonify({"error": "All fields required"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"error": "User exists"}), 400

        hashed = bcrypt.generate_password_hash(password).decode("utf-8")

        users_collection.insert_one({
            "name": name,
            "email": email,
            "password": hashed
        })

        return jsonify({"message": "Signup successful"}), 201

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- LOGIN ----------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)  # ✅ FIX

        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        user = users_collection.find_one({"email": email})

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Wrong password"}), 401

        token = jwt.encode({
            "user_id": str(user["_id"]),
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(hours=1)
        }, JWT_SECRET, algorithm="HS256")

        return jsonify({"token": token})

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Backend is running 🚀"

# ---------------- RUN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)