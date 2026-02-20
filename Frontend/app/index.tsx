import { Text, Button, View, ScrollView } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";

export default function Index() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [sleepResults, setSleepResults] = useState<any>(null); // State to store Python's response

  // 1. The logic to handle the file upload
  const uploadFile = async (fileAsset: any) => {
    try {
      const formData = new FormData();

      // Convert URI to Blob for Web compatibility
      const response = await fetch(fileAsset.uri);
      const blob = await response.blob();

      // "file" must match: async def upload_health_data(file: UploadFile...)
      formData.append("file", blob, fileAsset.name);

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
    <ScrollView contentContainerStyle={{ padding: 40, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20, fontWeight: 'bold' }}>
        HealthKit Sleep Analyzer
      </Text>

      <Button title="Select Health Export XML" onPress={pickFile} />
      
      {fileName && (
        <Text style={{ marginTop: 10, color: 'green' }}>
          Selected: {fileName}
        </Text>
      )}

      {/* 3. Display the result from Python */}
      {sleepResults && (
        <View style={{ marginTop: 30, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, width: '100%' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Results from Backend:</Text>
          <Text>{JSON.stringify(sleepResults, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}