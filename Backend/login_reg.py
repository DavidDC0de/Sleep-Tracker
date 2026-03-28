import sqlite3

def get_db():
    return sqlite3.connect("users.db")

def signup(data):
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, password),
        )
        conn.commit()
        conn.close()
        return {"success": True, "message": "Account created"}

    except sqlite3.IntegrityError:
        return {"success": False, "message": "User already exists"}


def login(data):
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password),
    )

    user = cursor.fetchone()
    conn.close()

    if user:
        return {"success": True, "message": "Login successful", "email": email}
    else:
        return {"success": False, "message": "Invalid credentials"}
