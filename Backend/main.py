import pandas
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

tree = ET.parse(r"C:\Users\david\Downloads\export\apple_health_export\export.xml")
root = tree.getroot()

all_sleep_records = [] #all sleep records in the file
last_night_sleep = [] #sleep records from last sleep 
sleep_records = [] #sleep records with start and end time (sorted)

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

start, _, record = last_night_sleep[0]
_, end, _ = last_night_sleep[-1]
print("duration: ", end - start)

