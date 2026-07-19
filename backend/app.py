from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from authlib.integrations.flask_client import OAuth
from functools import wraps
import jwt
from datetime import datetime, timedelta
import requests
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SESSION_SECRET", "batchtrace_session")

CORS(app)
bcrypt = Bcrypt(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day"])

JWT_SECRET = os.getenv("JWT_SECRET", "batchtrace_secret")

# ---------------- GOOGLE OAUTH ----------------
oauth = OAuth(app)

google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"}
)

# ---------------- DATABASE ----------------
client = MongoClient(os.getenv("MONGO_URI"))
db = client["batchDB"]

collection = db["batches"]
users_collection = db["users"]
jobs_collection = db["jobs"]

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Backend running 🚀"

# ---------------- TOKEN CHECK ----------------
def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")

        if not auth:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = auth.replace("Bearer ", "")
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user = decoded
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return func(*args, **kwargs)
    return wrapper

# ---------------- AUTH ----------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()

    if users_collection.find_one({"email": data.get("email")}):
        return jsonify({"error": "User exists"}), 400

    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    users_collection.insert_one({
        "name": data["name"],
        "email": data["email"],
        "password": hashed
    })

    return jsonify({"message": "Registered"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users_collection.find_one({"email": data.get("email")})

    if not user or not bcrypt.check_password_hash(user["password"], data.get("password")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        "user_id": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=1)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({"token": token})

# ---------------- ADD BATCH ----------------
@app.route("/api/batches", methods=["POST"])
def add_batch():
    data = request.get_json()

    expiry = data.get("expiry")
    status = "Pending"

    if expiry:
        exp_date = datetime.strptime(expiry, "%Y-%m-%d")

        if exp_date < datetime.utcnow():
            status = "Rejected"
        elif exp_date - datetime.utcnow() < timedelta(days=5):
            status = "Pending"
        else:
            status = "Approved"

    collection.insert_one({
        "batch": data["batch"],
        "product": data.get("product", ""),
        "expiry": expiry,
        "status": status
    })

    return jsonify({"message": "Batch added", "status": status})

# ---------------- GET BATCHES (FIXED) ----------------
@app.route("/api/batches", methods=["GET"])
def get_batches():
    batches = list(collection.find())

    for b in batches:
        b["_id"] = str(b["_id"])

    return jsonify(batches)

# ---------------- VERIFY ----------------
@app.route("/api/verify/<batch_id>")
def verify(batch_id):
    batch = collection.find_one({"batch": batch_id})

    if not batch:
        return jsonify({"error": "Not found"}), 404

    return jsonify({
        "batch": batch["batch"],
        "status": batch["status"]
    })

# ---------------- AI ANALYSIS ----------------
@app.route("/api/ai/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        text = data.get("text")

        if not text:
            return jsonify({"error": "Missing text"}), 400

        prompt = f"""
        Analyze this batch:
        {text}

        Give:
        Risk Level + Reason + Final Status (short)
        """

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}]
            }
        )

        result = response.json()

        if "choices" not in result:
            return jsonify({"error": "AI failed"}), 500

        output = result["choices"][0]["message"]["content"]

        return jsonify({"analysis": output})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/batches/<id>", methods=["DELETE"])
def delete_batch(id):
    from bson.objectid import ObjectId

    collection.delete_one({"_id": ObjectId(id)})

    return jsonify({"message": "Deleted"})

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)