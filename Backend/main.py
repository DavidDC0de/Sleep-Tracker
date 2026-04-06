from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from sleep_extraction import extract_last_sleep
from database import create_users_table, create_sleep_table
from login_reg import login, signup
import sqlite3

create_users_table()
create_sleep_table()
app = FastAPI()

# This tells the browser "let anyone talk to me"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

#await for HealthKit file to be uploaded on the frontend side 
@app.post("/upload")
async def upload_health_data(file: UploadFile = File(...), email: str = Form(...)):
    #create a temp which holde the file details
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xml") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    #extracts the importand data and then sends it back
    sleep_data = extract_last_sleep(tmp_path, email)
    return sleep_data

@app.post("/login")
async def login_check(data: dict):
    return login(data)

@app.post("/signup")
async def signup_check(data: dict):
    return signup(data)

@app.get("/get_history")
async def get_history(email: str):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    
    # Get the 7 most recent scores for this user
    cursor.execute("""
        SELECT date, sleep_score, total_minutes, sleep_start
        FROM sleep_data 
        WHERE user_email = ? 
        ORDER BY date DESC 
        LIMIT 7
    """, (email,))
    
    rows = cursor.fetchall()
    conn.close()

    # Format the data into a list of dictionaries
    history_list = [
        {"date": row[0], "score": row[1], "total_minutes": row[2], "sleep_start": row[3]} 
        for row in rows
    ]
    
    return history_list