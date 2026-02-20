from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tempfile
from sleep_extraction import extract_last_sleep

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
async def upload_health_data(file: UploadFile = File(...)):
    #create a temp which holde the file details
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xml") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    #extracts the importand data and then sends it back
    sleep_data = extract_last_sleep(tmp_path)
    return sleep_data

