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
CORS(app)

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
    data = request.get_json()

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

# ---------------- LOGIN ----------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()

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

# ---------------- PROFILE ----------------
@app.route("/api/auth/profile")
@token_required
def profile():
    user = users_collection.find_one({"email": request.user["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"]
    })

# ---------------- ADD BATCH ----------------
@app.route("/api/batches", methods=["POST"])
@token_required
def add_batch():
    try:
        data = request.get_json()

        batch_name = data.get("batch") or data.get("name") or "Unknown Batch"
        product = data.get("product") or "Not specified"
        expiry = data.get("expiry")

        status = "Pending"

        if expiry:
            try:
                exp_date = datetime.strptime(expiry, "%Y-%m-%d")

                if exp_date < datetime.utcnow():
                    status = "Rejected"
                elif exp_date - datetime.utcnow() < timedelta(days=5):
                    status = "Pending"
                else:
                    status = "Approved"
            except:
                expiry = None

        result = batches_collection.insert_one({
            "batch": batch_name,
            "product": product,
            "expiry": expiry,
            "status": status,
            "user_email": request.user["email"]
        })

        return jsonify({
            "message": "Batch added",
            "id": str(result.inserted_id),
            "status": status
        })

    except Exception as e:
        print("ADD ERROR:", e)
        return jsonify({"error": "Add failed"}), 500

# ---------------- GET BATCHES ----------------
@app.route("/api/batches", methods=["GET"])
@token_required
def get_batches():
    batches = list(batches_collection.find({
        "user_email": request.user["email"]
    }))

    for b in batches:
        b["_id"] = str(b["_id"])

    return jsonify(batches)

# ---------------- DELETE ----------------
@app.route("/api/batches/<id>", methods=["DELETE"])
@token_required
def delete_batch(id):
    try:
        batches_collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Deleted"})
    except Exception as e:
        print("DELETE ERROR:", e)
        return jsonify({"error": "Delete failed"}), 500

# ---------------- ANALYZE ----------------
@app.route("/api/batches/analyze/<batch_id>", methods=["POST"])
@token_required
def analyze_batch(batch_id):
    try:
        batch = batches_collection.find_one({"_id": ObjectId(batch_id)})

        if not batch:
            return jsonify({"error": "Batch not found"}), 404

        batch_name = batch.get("batch", "Unknown")
        product = batch.get("product", "Unknown")
        expiry = batch.get("expiry", "N/A")

        if expiry and expiry != "N/A":
            try:
                exp_date = datetime.strptime(expiry, "%Y-%m-%d")

                if exp_date < datetime.utcnow():
                    result = f"❌ EXPIRED | {batch_name} ({product})"
                    status = "Rejected"
                else:
                    result = f"✅ SAFE | {batch_name} ({product}) | Expiry: {expiry}"
                    status = "Approved"

            except:
                result = "⚠️ Invalid expiry format"
                status = "Pending"
        else:
            result = "⚠️ No expiry provided"
            status = "Pending"

        batches_collection.update_one(
            {"_id": ObjectId(batch_id)},
            {
                "$set": {
                    "status": status,
                    "ai_result": result
                }
            }
        )

        return jsonify({
            "message": "Analyzed",
            "result": result
        })

    except Exception as e:
        print("ANALYZE ERROR:", e)
        return jsonify({"error": "Analyze failed"}), 500

# ---------------- HOME ROUTE ----------------
@app.route("/")
def home():
    return "Backend is running 🚀"

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)