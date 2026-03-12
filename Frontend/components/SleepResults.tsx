import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For the bed/clock icons

export default function SleepResults({ data }: { data: any }) {
  // We'll assume a dummy score for now until you build your Python logic
  const sleepScore = 85; 

  return (
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      
      {/* 1. THE HERO CIRCLE */}
      <View style={styles.scoreSection}>
        <View style={styles.circle}>
          <Text style={styles.scoreText}>{sleepScore}%</Text>
          <Text style={styles.scoreLabel}>Sleep Quality</Text>
        </View>
      </View>

      {/* 2. MAIN STATS (Icons + Text) */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="bed-outline" size={24} color="#0a84ff" />
          <Text style={styles.statValue}>{Math.round(data.total_minutes / 60)}h {data.total_minutes % 60}m</Text>
          <Text style={styles.statTitle}>In Bed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="moon-outline" size={24} color="#5e5ce6" />
          <Text style={styles.statValue}>{Math.round((data.total_minutes - data.stages.Awake)/ 60)}h {Math.round((data.total_minutes - data.stages.Awake) % 60)}m</Text>
          <Text style={styles.statTitle}>Asleep</Text>
        </View>
      </View>

      {/* 3. THE TIMES (Start/End) */}
      <View style={styles.timeCard}>
         <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>FELL ASLEEP</Text>
            <Text style={styles.timeValue}>{data.sleep_start}</Text>
         </View>
         <View style={styles.divider} />
         <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>WOKE UP</Text>
            <Text style={styles.timeValue}>{data.sleep_end}</Text>
         </View>
      </View>

      {/* 4. THE STAGES LIST (Deep, REM, etc.) */}
      <View style={styles.stagesSection}>
        <Text style={styles.sectionTitle}>Sleep Stages</Text>
        {Object.entries(data.stages).map(([name, value]) => (
          <View key={name} style={styles.stageRow}>
             <Text style={styles.stageName}>{name}</Text>
             <Text style={styles.stageTime}>{Math.floor((value as number) / 60)}h {Math.round((value as number) % 60)}min</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#161616', // Deep black background
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: '#0a84ff', // Electric blue
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  scoreText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    color: '#8e8e93',
    fontSize: 14,
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1c1c1e',
    padding: 20,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statTitle: {
    color: '#8e8e93',
    fontSize: 12,
    marginTop: 5,
  },
  timeCard: {
    backgroundColor: '#1c1c1e',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    color: '#8e8e93',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  timeValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#38383a',
  },
  stagesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  stageName: {
    color: '#fff',
    fontSize: 16,
  },
  stageTime: {
    color: '#0a84ff',
    fontSize: 16,
    fontWeight: '600',
  },
});