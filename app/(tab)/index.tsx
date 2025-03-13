import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, Dimensions } from 'react-native';
import { database } from '../../firebaseConfig'; // Import your Firebase config
import { ref, onValue } from 'firebase/database'; // Firebase Realtime Database imports
import { LineChart } from 'react-native-chart-kit'; // Chart library for graphs
import { StatusBar } from 'expo-status-bar'
import Animated,{FadeInUp, FadeInDown} from 'react-native-reanimated'

type EventDetails = {
  eventName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  maxAttendees?: number;
};

type AttendeeCounts = {
  [key: string]: {
    count?: number;
    entries?: { time: string }[];
  };
};

export default function Index() {
  const [eventDetails, setEventDetails] = useState<EventDetails>({});
  const [attendeeCounts, setAttendeeCounts] = useState<AttendeeCounts>({});
  const [currentDayEntries, setCurrentDayEntries] = useState<{ time: string }[]>([]);
  const [graphData, setGraphData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const screenWidth = Dimensions.get('window').width;
  // Fetch event details from Firebase
  useEffect(() => {
    const eventRef = ref(database, 'event/details');
    onValue(eventRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setEventDetails(data);
      } else {
        Alert.alert('Error', 'Failed to fetch event details.');
      }
    });
  }, []);
  // Fetch attendee data (day-wise counts and current day entries)
  useEffect(() => {
    const attendeesRef = ref(database, 'event/attendees');
    onValue(attendeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAttendeeCounts(data);
        const currentDay = `day${new Date().getDate()}`; // Get current day dynamically
        if (data[currentDay]?.entries) {
          setCurrentDayEntries(data[currentDay].entries);
          updateGraphData(data[currentDay].entries); // Prepare graph data
        }
      } else {
        Alert.alert('Error', 'Failed to fetch attendee data.');
      }
    });
  }, []);

  // Update graph data for the current day
  const updateGraphData = (entries: { time: string }[]) => {
    const timeCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      const time = entry.time.split(':').slice(0, 2).join(':'); // Get HH:mm format
      if (!timeCounts[time]) {
        timeCounts[time] = 1;
      } else {
        timeCounts[time]++;
      }
    });
    const graphLabels = Object.keys(timeCounts).sort();
    const graphValues = graphLabels.map((time) => timeCounts[time]);

    setGraphData({ labels: graphLabels, values: graphValues });
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <StatusBar style = "light"/>
      {/* Event Details */}
      <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-2xl font-bold text-center mb-6">Event Details</Animated.Text>
      <View className="bg-gray-100 rounded-lg p-4 mb-4">
        <Text className="text-base mb-2">Event Name: {eventDetails.eventName || 'N/A'}</Text>
        <Text className="text-base mb-2">Start Date: {eventDetails.startDate || 'N/A'}</Text>
        <Text className="text-base mb-2">End Date: {eventDetails.endDate || 'N/A'}</Text>
        <Text className="text-base mb-2">Start Time: {eventDetails.startTime || 'N/A'}</Text>
        <Text className="text-base mb-2">End Time: {eventDetails.endTime || 'N/A'}</Text>
        <Text className="text-base">Max Attendees: {eventDetails.maxAttendees || 'N/A'}</Text>
      </View>

      {/* Day-Wise Attendee Count */}
      <Animated.Text entering={FadeInUp.delay(200).duration(1000).springify()} className="text-2xl font-bold text-center mb-6">Day-Wise Attendee Count</Animated.Text>
      <View className="bg-gray-100 rounded-lg p-4 mb-4">
        {Object.keys(attendeeCounts).map((day) => (
          <Text key={day} className="text-base mb-2">
            {day.toUpperCase()}: {attendeeCounts[day]?.count || 0} attendees
          </Text>
        ))}
      </View>

      {/* Real-Time Graph */}
      <Animated.Text entering={FadeInUp.delay(400).duration(1000).springify()} className="text-2xl font-bold text-center mb-6">Real-Time Attendee Graph</Animated.Text>
      {graphData.labels.length > 0 && graphData.values.length > 0 ? (
        <LineChart
          data={{
            labels: graphData.labels,
            datasets: [{ data: graphData.values }],
          }}
          width={screenWidth - 30} // Width of the chart
          height={220} // Height of the chart
          yAxisSuffix=" Attendees"
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff3ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 0, // No decimal places
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      ) : (
        <Text className="text-base text-gray-500 text-center mt-4">No graph data available for the current day.</Text>
      )}
    </ScrollView>
  );
}



