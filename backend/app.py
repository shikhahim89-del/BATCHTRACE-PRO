from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from authlib.integrations.flask_client import OAuth
from functools import wraps
import jwt
import datetime
import os


load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SESSION_SECRET", "batchtrace_session")

CORS(app)


bcrypt = Bcrypt(app)


limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day"]
)


JWT_SECRET = os.getenv("JWT_SECRET", "batchtrace_secret")



# ---------------- GOOGLE OAUTH ----------------

oauth = OAuth(app)


google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=
    "https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)



# ---------------- DATABASE ----------------

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client["batchDB"]

collection = db["batches"]

users_collection = db["users"]




# ---------------- HOME ----------------

@app.route("/")
def home():
    return "Backend running 🚀"




# ---------------- REGISTER ----------------
@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():

    data = request.get_json()


    if not data:
        return jsonify({
            "error": "Invalid request"
        }), 400



    name = data.get("name")
    email = data.get("email")
    password = data.get("password")



    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password required"
        }), 400



    if users_collection.find_one({
        "email": email
    }):
        return jsonify({
            "error": "User already exists"
        }), 400



    hashed_password = bcrypt.generate_password_hash(
        password
    ).decode("utf-8")



    users_collection.insert_one({

        "name": name,

        "email": email,

        "password": hashed_password

    })



    return jsonify({

        "message": "User registered successfully"

    }), 201




# ---------------- LOGIN ----------------

@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():

    data = request.get_json()


    email = data.get("email")
    password = data.get("password")


    user = users_collection.find_one({
        "email":email
    })


    if not user:
        return jsonify({
            "error":"Invalid credentials"
        }),401



    if not bcrypt.check_password_hash(
        user["password"],
        password
    ):
        return jsonify({
            "error":"Invalid credentials"
        }),401



    token = jwt.encode(

        {
            "user_id":str(user["_id"]),
            "email":user["email"],
            "exp":
            datetime.datetime.utcnow()
            +
            datetime.timedelta(hours=1)
        },

        JWT_SECRET,

        algorithm="HS256"

    )


    return jsonify({

        "message":"Login successful",

        "token":token

    }),200

    # ---------------- TOKEN CHECK ----------------

def token_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        auth = request.headers.get("Authorization")


        if not auth:
            return jsonify({
                "error":"Token missing"
            }),401


        try:

            if auth.startswith("Bearer "):
                token = auth.replace("Bearer ","")
            else:
                token = auth


            decoded = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )


            request.user = decoded


        except Exception as e:

            return jsonify({
                "error":"Invalid token",
                "details":str(e)
            }),401



        return func(*args, **kwargs)


    return wrapper





# ---------------- PROFILE ----------------

@app.route("/profile", methods=["GET"])
@token_required
def profile():

    return jsonify({

        "email":request.user["email"]

    })





# ---------------- PROTECTED TEST ----------------

@app.route("/api/protected", methods=["GET"])
@token_required
def protected():

    return jsonify({

        "message":"Access granted"

    })





# ---------------- DASHBOARD ----------------

@app.route("/api/auth/dashboard", methods=["GET"])
@token_required
def dashboard():

    return jsonify({

        "message":"Dashboard working",

        "email":request.user.get("email")

    })





# ---------------- GET BATCHES ----------------

@app.route("/api/batches", methods=["GET"])
@token_required
def get_batches():

    batches = list(collection.find())


    for batch in batches:

        batch["_id"] = str(batch["_id"])



    return jsonify(batches)





# ---------------- ADD BATCH ----------------

@app.route("/api/batches", methods=["POST"])
@token_required
def add_batch():

    data = request.get_json()


    if not data or "batch" not in data:

        return jsonify({

            "error":"Batch required"

        }),400



    collection.insert_one({

        "batch":data["batch"],

        "status":data.get(
            "status",
            "Pending"
        )

    })


    return jsonify({

        "message":"Batch added"

    }),201





# ---------------- DELETE BATCH ----------------

@app.route("/api/batches/<id>", methods=["DELETE"])
@token_required
def delete_batch(id):

    try:

        collection.delete_one({

            "_id":ObjectId(id)

        })


        return jsonify({

            "message":"Deleted"

        })


    except:

        return jsonify({

            "error":"Invalid ID"

        }),400

    # ---------------- GOOGLE LOGIN ----------------

@app.route("/api/auth/google")
def google_login():

    redirect_uri = "http://localhost:5000/api/auth/google/callback"

    return google.authorize_redirect(
        redirect_uri
    )





# ---------------- GOOGLE CALLBACK ----------------

@app.route("/api/auth/google/callback")
def google_callback():

    token = google.authorize_access_token()


    user_info = token.get("userinfo")


    if not user_info:

        return jsonify({

            "error":"Google login failed"

        }),400



    email = user_info["email"]



    user = users_collection.find_one({

        "email":email

    })



    # Create Google user if new

    if not user:

        result = users_collection.insert_one({

            "email":email,

            "google_login":True

        })

        user_id = str(result.inserted_id)


    else:

        user_id = str(user["_id"])





    # Create JWT token

    jwt_token = jwt.encode(

        {

            "user_id":user_id,

            "email":email,

            "exp":
            datetime.datetime.utcnow()
            +
            datetime.timedelta(hours=1)

        },

        JWT_SECRET,

        algorithm="HS256"

    )



    return redirect(

        "http://localhost:3000/dashboard?token="
        +
        jwt_token

    )





# ---------------- RUN ----------------

if __name__ == "__main__":

    app.run(

        debug=True

    )