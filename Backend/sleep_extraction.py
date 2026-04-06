import pandas
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import sqlite3


def extract_last_sleep(xml_path: str, email) -> dict:

    tree = ET.parse(xml_path)
    root = tree.getroot()

    all_sleep_records = [] #all sleep records in the file
    sleep_records = [] #sleep records with start and end time (sorted)
    last_night_sleep = [] #sleep records from last sleep 

    #sleep value map:
    sleep_stage_map = {
        "HKCategoryValueSleepAnalysisAwake": "Awake",
        "HKCategoryValueSleepAnalysisAsleepCore": "Core",
        "HKCategoryValueSleepAnalysisAsleepDeep": "Deep",
        "HKCategoryValueSleepAnalysisAsleepREM": "REM"
    }

    sleep_values = {
        "date": None,
        "sleep_start": None,
        "sleep_end": None,
        "total_minutes": None,
        "sleep_score": None,
        "stages": {
            "Awake": 0,
            "Core": 0,
            "Deep": 0,
            "REM": 0
        }
    }

    #loop through all health to find the sleep records
    for child in root: 
        if child.attrib.get("type") == "HKCategoryTypeIdentifierSleepAnalysis":
            all_sleep_records.append(child)

    # sort the sleep all_sleep_records by time 
    def parse_dt(s):
        return datetime.strptime(s, "%Y-%m-%d %H:%M:%S %z")

    for record in all_sleep_records:
        start = parse_dt(record.attrib["startDate"])
        end = parse_dt(record.attrib["endDate"])
        sleep_records.append((start, end, record))

    # sort by end time
    sleep_records.sort(key=lambda x: x[1]) #sorts the list
    last_night_sleep.append(sleep_records[-1])  #last ever sleep record added to list
    max_sleep_gap = timedelta(hours=2) #max gap between records for a one night sleep


    for i in range(len(sleep_records) - 2, -1, -1):
        prev_start, prev_end, prev_record = sleep_records[i]
        curr_start, curr_end, _ = last_night_sleep[0]
        
        gap = curr_start - prev_end

        if gap <= max_sleep_gap:
            last_night_sleep.insert(0, sleep_records[i])
        else:
            break


    #update the sleep_values dict with all the details about the last night sleep 
    sleep_values["date"] = (datetime.strptime(last_night_sleep[0][2].attrib["startDate"], "%Y-%m-%d %H:%M:%S %z")).strftime("%Y-%m-%d") #get the date 
    sleep_values["sleep_start"] = (datetime.strptime(last_night_sleep[0][2].attrib["startDate"], "%Y-%m-%d %H:%M:%S %z")).strftime("%H:%M:%S") #start time of the sleep
    sleep_values["sleep_end"] = (datetime.strptime(last_night_sleep[-1][2].attrib["endDate"], "%Y-%m-%d %H:%M:%S %z")).strftime("%H:%M:%S") #end time of the sleep

    for start, end, record in last_night_sleep:
        start = datetime.strptime(record.attrib["startDate"], "%Y-%m-%d %H:%M:%S %z")
        end = datetime.strptime(record.attrib["endDate"], "%Y-%m-%d %H:%M:%S %z")
        time = (end - start).total_seconds() / 60

        sleep_values["stages"][sleep_stage_map[record.attrib.get("value")]] += time

    sleep_values["total_minutes"] = sleep_values["stages"]["Awake"] + sleep_values["stages"]["REM"] + sleep_values["stages"]["Core"] + sleep_values["stages"]["Deep"]
    
    #calculate sleep score: 
    actual_sleep_time = sleep_values["total_minutes"] - sleep_values["stages"]["Awake"]

    #quantity of sleep (target 8 hours = 480 min)
    quantity_score = min(100, (actual_sleep_time / 480) * 100)

    #quality of sleep
    restorative_sleep_total = sleep_values["stages"]["Deep"] + sleep_values["stages"]["REM"]
    restorative_percentage = restorative_sleep_total / actual_sleep_time

    quality_score = min(100, (restorative_percentage / 0.45) * 100)
    restoration_score = max(0, 100 - (sleep_values["stages"]["Awake"] * 2))

    #final score 
    final_score = (
        (quantity_score * 0.40) + 
        (quality_score * 0.40) + 
        (restoration_score * 0.20)
    )

    sleep_values["sleep_score"] = round(final_score)
    
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()


    #save the data of the sleep in the history table 
    cursor.execute("""
        SELECT id FROM sleep_data 
        WHERE user_email = ? AND date = ?
    """, (email, sleep_values["date"]))
    
    existing_record = cursor.fetchone()

    if existing_record:
        print("alredy in the history")
        conn.close()
        
    else:
        # DATA IS NEW: Proceed with the INSERT
        cursor.execute("""
            INSERT INTO sleep_data (user_email, date, sleep_start, total_minutes, sleep_score)
            VALUES (?, ?, ?, ?, ?)
        """, (
            email,
            sleep_values["date"],
            sleep_values["sleep_start"],
            sleep_values["total_minutes"],
            sleep_values["sleep_score"]
        ))
        conn.commit()
        conn.close()

    return(sleep_values)

    