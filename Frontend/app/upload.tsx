import { Text, Button, View, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar"; 
import SleepResults from "../components/SleepResults";

export default function Index() {
  const { email } = useLocalSearchParams<{ email: string }>(); //user email
  const [fileName, setFileName] = useState<string | null>(null);
  const [sleepResults, setSleepResults] = useState<any>(null); // State to store Python's response
  const [history, setHistory] = useState<any[]>([]); //history boxes

  useEffect(() => {if (email) fetchHistory();}, [email]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/get_history?email=${email}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("History fetch failed:", error);
    }
  };
  // 1. The logic to handle the file upload
  const uploadFile = async (fileAsset: any) => {
    try {
      const formData = new FormData();

      // Convert URI to Blob for Web compatibility
      const response = await fetch(fileAsset.uri);
      const blob = await response.blob();

      // "file" must match: async def upload_health_data(file: UploadFile...)
      formData.append("file", blob, fileAsset.name);
      formData.append("email", email);

      console.log("Uploading to backend...");

      const uploadResponse = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error("Backend rejected it:", errorData);
        return;
      }

      const data = await uploadResponse.json();
      console.log("Success! Data received:", data);
      setSleepResults(data); // Store the JSON dict from Python
      fetchHistory();
      
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // 2. The logic to pick the file
  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/xml", "text/xml"],
      copyToCacheDirectory: true
    });

    if (!result.canceled) {
      setFileName(result.assets[0].name);
      uploadFile(result.assets[0]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#161616' }}> 
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        {!sleepResults ? (
          // SHOW THIS ONLY IF NO DATA
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, color: '#ffffff', marginBottom: 20, fontWeight: 'bold' }}>
              Sleep Analyzer
            </Text>
            <Button title="Add Sleep" onPress={pickFile} />
            {fileName && <Text style={{ color: '#ffffff', marginTop: 10 }}>{fileName}</Text>}
          </View>
        ) : (
          // SHOW THIS ONCE BACKEND RESPONDS
          <SleepResults data={sleepResults} />
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 15, fontWeight: 'bold' }}>
            Last 7 Nights:
          </Text>
          <View style={{ flexDirection: 'column', flexWrap: 'wrap', gap: 10 }}>
            {history.map((day, index) => {
            // Logic to format minutes to Hours/Mins
            const hours = Math.floor(day.total_minutes / 60);
            const mins = day.total_minutes % 60;

            return (
              <View 
                key={index} 
                style={{ 
                  width: '100%',
                  padding: 15,
                  marginBottom: 10,
                  backgroundColor: '#3e3e3e',
                  borderRadius: 12, 
                  borderLeftWidth: 8, // Stylish border on the side instead of all around
                  borderLeftColor: (day.score >= 80 ? '#4CAF50' : '#FF9800'),
                  flexDirection: 'row', // Horizontal split: Left and Right
                  justifyContent: 'space-between', // Pushes groups to the edges
                  alignItems: 'center' 
                }}
              >
                {/* LEFT SIDE: DATE AND SCORE */}
                <View style={{ flexDirection: 'column' }}>
                  <Text style={{ color: '#aaa', fontSize: 14, marginBottom: 4 }}>
                    {day.date}
                  </Text>
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                    Score: {Math.round(day.score)}
                  </Text>
                </View>

                {/* RIGHT SIDE: DURATION AND BEDTIME */}
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {hours}h {mins}m
                  </Text>
                  <Text style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                    In bed: {day.sleep_start || "N/A"}
                  </Text>
                </View>
              </View>
            );
          })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
