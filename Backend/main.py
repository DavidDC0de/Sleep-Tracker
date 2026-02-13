import pandas
import xml.etree.ElementTree as ET
from datetime import datetime
tree = ET.parse(r"C:\Users\david\Downloads\export\apple_health_export\export.xml")
root = tree.getroot()

all_sleep_records = [] #all sleep records

#loop through all health to find the sleep records
for child in root: 
    if child.attrib.get("type") == "HKCategoryTypeIdentifierSleepAnalysis":
        all_sleep_records.append(child)
    
latest_end = None 

#loop through all sleep records to find the most recent sleep (of last night)
'''
for record in all_sleep_records:
    end = datetime.strptime(record.attrib["endDate"], "%Y-%m-%d %H:%M:%S %z")
    if latest_end is None or end > latest_end:
        latest_end = end

print(latest_end )
'''
#perhaps go backwords 
print(all_sleep_records[-1].attrib["endDate"])

#loop backwords in the list of all sleeps look at the start time
#check that  not more than 3+ hours diff (that means its same sleep just woke up and went back to sleep)
