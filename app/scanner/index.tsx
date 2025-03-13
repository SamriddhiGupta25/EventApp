import React, { useState, useEffect, useRef } from "react";
import { AppState, SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CameraView } from "expo-camera";
import { Link } from "expo-router";
import { database } from "../../firebaseConfig"; // Import your Firebase config
import { ref, get, update } from "firebase/database";

export default function Scanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);

  // Function to validate and log pass entries
  const validatePass = async (passId: string): Promise<string> => {
    const currentDateTime = new Date(); // Current date and time
    const currentDateKey = currentDateTime.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
      const eventDetailsSnapshot = await get(ref(database, "event/details"));
      const attendeesSnapshot = await get(ref(database, "event/attendees"));

      if (!eventDetailsSnapshot.exists() || !attendeesSnapshot.exists()) {
        return "Error: Event data missing.";
      }

      const eventDetails = eventDetailsSnapshot.val();
      const attendees = attendeesSnapshot.val();

      const eventStartDate = eventDetails.startDate; // e.g., "2024-12-31"
      const eventStartTime = eventDetails.startTime; // e.g., "17:00"
      const eventEndTime = eventDetails.endTime; // e.g., "02:00"

      const startDateTime = new Date(`${eventStartDate}T${eventStartTime}:00`);
      let endDateTime = new Date(`${eventStartDate}T${eventEndTime}:00`);

      // If the event end time is earlier than the start time, adjust to the next day
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const daysBetween = Math.ceil(
        (new Date(eventDetails.endDate).getTime() - startDateTime.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Check if current time falls within each 24-hour window
      let isValidTime = false;
      for (let i = 0; i <= daysBetween; i++) { // Check next 3 days if the event runs over multiple days
        let checkStart = new Date(startDateTime.getTime() + i * 24 * 60 * 60 * 1000); // Increment 1 day
        let checkEnd = new Date(endDateTime.getTime() + i * 24 * 60 * 60 * 1000); // Increment 1 day
        
        if (currentDateTime >= checkStart && currentDateTime <= checkEnd) {
          isValidTime = true;
          break;
        }
      }

      if (!isValidTime) {
        return "Event not active during this time.";
      }

      // Calculate the current event day key
      const daysDiff = Math.floor((currentDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24));
      const dayKey = `day${daysDiff + 1}`;

      if (!dayKey || !attendees[dayKey]) {
        return "Error: Invalid event day.";
      }
  
      // Validate the pass format
      if (!passId.startsWith("ONGC") || !/ONGC\d+/.test(passId)) {
        return "Invalid Pass: Pass is not for this Event.";
      }

      const dayData = attendees[dayKey];
      const dayEntries = dayData.entries || [];

      // Check for re-entry
      const alreadyUsed = dayEntries.some((entry: any) => entry.passId === passId);
      if (alreadyUsed) {
        return "Pass Valid: Re-entry allowed.";
      }

      // Check if the pass was used on previous days
      for (let i = 0; i < daysBetween + 1; i++) {
        const prevDayKey = `day${i + 1}`;
        const prevDayData = attendees[prevDayKey]?.entries || [];
        const passFoundInPreviousDay = prevDayData.some((entry: any) => entry.passId === passId);

        if (passFoundInPreviousDay) {
          return "Pass Invalid: This pass is already used.";
        }
      }

      // Check max attendees limit
      const currentCount = dayData.count || 0;
      if (currentCount >= eventDetails.maxAttendees) {
        return "Event capacity reached. Entry not allowed.";
      }

      // Log new entry
      const newEntry = { passId, date: currentDateKey, time: currentDateTime.toLocaleTimeString(),};
      const newEntries = [...dayEntries, newEntry];
      const newCount = currentCount + 1;

      await update(ref(database, `event/attendees/${dayKey}`), {
        entries: newEntries,
        count: newCount,
      });

      return "Pass Valid: Entry logged.";
    } catch (error) {
      console.error("Validation Error:", error);
      return "Error validating pass.";
    }
  };

  // Reset the scanner when app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle barcode scan
  const handleBarcodeScan = ({ data }: { data: string }) => {
    if (!qrLock.current) {
      qrLock.current = true;
      validatePass(data).then((message) => {
        setScanResult(message);
        setTimeout(() => {
          setScanResult(null); // Clear the result
          qrLock.current = false;
        }, 3000); // Delay for better UX
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.title}>Event Scanner</Text>
        <Link href="./" style={styles.backButton}>
          <Text style={styles.backText}>Back to Home</Text>
        </Link>
      </View>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={handleBarcodeScan}
      />
      {scanResult ? (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>{scanResult}</Text>
          <TouchableOpacity
            onPress={() => setScanResult(null)}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.infoText}>Point the scanner at a QR Code</Text>
      )}
    </SafeAreaView>
  );
}

// Styles (remains the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  header: {
    padding: 15,
    backgroundColor: "#0ea5e9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  backButton: {
    padding: 10,
  },
  backText: {
    fontSize: 16,
    color: "#ffd700",
  },
  camera: {
    flex: 1,
  },
  resultOverlay: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  dismissButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#0ea5e9",
    borderRadius: 5,
  },
  dismissText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginVertical: 20,
  },
});