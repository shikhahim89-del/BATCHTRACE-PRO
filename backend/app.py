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
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
JWT_SECRET = os.getenv("JWT_SECRET", "secret123")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

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
    data = request.get_json(force=True)

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
    data = request.get_json(force=True)

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
 # ---------------- ADD BATCH ----------------
@app.route("/api/batches", methods=["POST"])
def add_batch():
    try:
        data = request.get_json()

        batchName = data.get("batch")   # ✅ FIXED
        product = data.get("product")
        expiry = data.get("expiry")

        if not batchName or not product or not expiry:
            return jsonify({"error": "All fields required"}), 400

        today = datetime.utcnow().date()
        expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()

        if expiry_date < today:
            status = "Rejected"
            ai_result = f"❌ EXPIRED | {batchName} ({product})"
        else:
            status = "Approved"
            ai_result = f"✅ SAFE | {batchName} ({product}) | Expiry: {expiry}"

        batches_collection.insert_one({
            "batch": batchName,
            "product": product,
            "expiry": expiry,
            "status": status,
            "ai_result": ai_result,
            "createdAt": datetime.utcnow()
        })

        return jsonify({
            "message": "Batch added with AI ✅",
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

        # ✅ format date safely
        if "createdAt" in b:
            b["createdAt"] = b["createdAt"].strftime("%Y-%m-%d")

        batches.append(b)

    return jsonify(batches)
# ---------------- DELETE ----------------
@app.route("/api/batches/<id>", methods=["DELETE"])
@token_required
def delete_batch(id):
    batches_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Deleted"})


# ---------------- UPDATE ----------------
@app.route("/api/batches/<id>", methods=["PUT"])
@token_required
def update_batch(id):
    data = request.get_json(force=True)

    batchName = data.get("batchName")
    product = data.get("product")
    expiry = data.get("expiry")

    # ✅ AI RE-CALCULATE
    today = datetime.utcnow().date()
    expiry_date = datetime.strptime(expiry, "%Y-%m-%d").date()

    if expiry_date < today:
        status = "Rejected"
        ai_result = f"❌ EXPIRED | {batchName} ({product})"
    else:
        status = "Approved"
        ai_result = f"✅ SAFE | {batchName} ({product}) | Expiry: {expiry}"

    batches_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "batch": batchName,
            "product": product,
            "expiry": expiry,
            "status": status,
            "ai_result": ai_result
        }}
    )

    return jsonify({"message": "Updated with AI ✅"})


# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Backend is running 🚀"


# ---------------- RUN ----------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)