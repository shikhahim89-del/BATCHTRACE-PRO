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

# ✅ CORS
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

# ---------------- ADD BATCH ----------------
@app.route("/api/batches", methods=["POST"])
def add_batch():
    try:
        data = request.get_json()

        batch = data.get("batch")
        product = data.get("product")
        expiry = data.get("expiry")

        if not batch or not product or not expiry:
            return jsonify({"error": "All fields required"}), 400

        today = datetime.utcnow().date()
        expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()

        if expiry_date < today:
            status = "Rejected"
            ai_result = f"❌ EXPIRED | {batch} ({product})"
        else:
            status = "Approved"
            ai_result = f"✅ SAFE | {batch} ({product}) | Expiry: {expiry}"

        batches_collection.insert_one({
            "batch": batch,
            "product": product,
            "expiry": expiry,
            "status": status,
            "ai_result": ai_result,
            "createdAt": datetime.utcnow()
        })

        return jsonify({
            "message": "Batch added",
            "status": status,
            "ai_result": ai_result
        })

    except Exception as e:
        print("BATCH ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- GET BATCHES ----------------
@app.route("/api/batches", methods=["GET"])
def get_batches():
    batches = []

    for b in batches_collection.find():
        b["_id"] = str(b["_id"])

        if "createdAt" in b:
            b["createdAt"] = b["createdAt"].strftime("%Y-%m-%d")

        batches.append(b)

    return jsonify(batches)

# ---------------- ANALYZE ----------------
@app.route("/api/batches/analyze/<id>", methods=["POST"])
def analyze_batch(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ID"}), 400

        batch = batches_collection.find_one({"_id": ObjectId(id)})

        if not batch:
            return jsonify({"error": "Batch not found"}), 404

        expiry = batch.get("expiry")
        today = datetime.utcnow().date()
        expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()

        if expiry_date < today:
            status = "Rejected"
            ai_result = f"❌ EXPIRED | {batch['batch']} ({batch['product']})"
        else:
            status = "Approved"
            ai_result = f"✅ SAFE | {batch['batch']} ({batch['product']}) | Expiry: {expiry}"

        # ✅ UPDATE DB
        batches_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "status": status,
                "ai_result": ai_result
            }}
        )

        return jsonify({
            "result": ai_result,
            "status": status
        })

    except Exception as e:
        print("ANALYZE ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- DELETE ----------------
@app.route("/api/batches/<id>", methods=["DELETE"])
def delete_batch(id):
    try:
        if not ObjectId.is_valid(id):
            return jsonify({"error": "Invalid ID"}), 400

        result = batches_collection.delete_one({"_id": ObjectId(id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Not found"}), 404

        return jsonify({"message": "Deleted successfully"})

    except Exception as e:
        print("DELETE ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- UPDATE ----------------
@app.route("/api/batches/<id>", methods=["PUT"])
def update_batch(id):
    try:
        data = request.get_json()

        batch = data.get("batch")
        product = data.get("product")
        expiry = data.get("expiry")

        today = datetime.utcnow().date()
        expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()

        if expiry_date < today:
            status = "Rejected"
            ai_result = f"❌ EXPIRED | {batch} ({product})"
        else:
            status = "Approved"
            ai_result = f"✅ SAFE | {batch} ({product}) | Expiry: {expiry}"

        batches_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "batch": batch,
                "product": product,
                "expiry": expiry,
                "status": status,
                "ai_result": ai_result
            }}
        )

        return jsonify({"message": "Updated successfully"})

    except Exception as e:
        print("UPDATE ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- PROFILE ----------------
@app.route("/api/auth/profile", methods=["GET"])
@token_required
def get_profile():
    try:
        user_id = request.user["user_id"]

        user = users_collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "name": user.get("name"),
            "email": user.get("email"),
            "user_id": str(user["_id"])
        })

    except Exception as e:
        print("PROFILE ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Backend running 🚀"

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)