import React, { useState } from 'react';     // useState hooks to store user inputs
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { database } from '../../firebaseConfig';
import { ref, set, remove } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function EventSetting() {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [maxAttendees, setMaxAttendees] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const navigation = useNavigation();
  
  // Save event configuration
  const handleSaveConfig = () => {
    if (!eventName || !startDate || !endDate || !startTime || !endTime || !maxAttendees) {
      Alert.alert('Error', 'Please fill out all fields!');
      return;
    }
    const formatDate = (date: Date): string => {
      // Format the date in YYYY-MM-DD format for the local timezone
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // Adjust for local timezone
      return localDate.toISOString().split('T')[0];
    };
    const formatTime = (time: Date): string => {
      // Format the time as HH:MM (local time)
      return time.toTimeString().split(' ')[0].slice(0, 5);
    };    
    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);
    const startTimeString = formatTime(startTime);
    const endTimeString = formatTime(endTime);
    const eventDetailsRef = ref(database, 'event/details');
    const attendeesRef = ref(database, 'event/attendees');
    const generateDays = (): {
      [key: string]: { 
        date: string; 
        startDateTime: string; 
        endDateTime: string; 
        count: number; 
        entries: string[]; 
      }
    } => {
      const start = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000); // Adjust for local timezone
      const end = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);       // Adjust for local timezone

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        Alert.alert('Error', 'Invalid start or end date. Please check the dates.');
        return {};
      }
    
      const dailyStartTime = new Date(startTime); // Use input start time
      const dailyEndTime = new Date(endTime); // Use input end time
    
      const days: { 
        [key: string]: { 
          date: string; 
          startDateTime: string; 
          endDateTime: string; 
          count: number; 
          entries: string[]; 
        } 
      } = {};
    
      for (let i = 0; ; i++) {
        const currentDay = new Date(start.getTime() + i * 24 * 60 * 60 * 1000); // Increment by 1 day
        if (currentDay > end) break;
    
        const startDateTime = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate(),
          dailyStartTime.getHours(),
          dailyStartTime.getMinutes()
        );
    
        const endDateTime = new Date(
          currentDay.getFullYear(),
          currentDay.getMonth(),
          currentDay.getDate() + (dailyEndTime < dailyStartTime ? 1 : 0), // Handle overnight events
          dailyEndTime.getHours(),
          dailyEndTime.getMinutes()
        );
    
        const dayKey = `day${i + 1}`;
        days[dayKey] = {
          date: currentDay.toISOString().split('T')[0], // YYYY-MM-DD
          startDateTime: startDateTime.toLocaleString(), // ISO format for storage
          endDateTime: endDateTime.toLocaleString(), // ISO format for storage
          count: 0,
          entries: [],
        };
      }
      return days;
    };           
    
  set(eventDetailsRef, {
    eventName,
    startDate: startDateString, // Store the adjusted local date
    endDate: endDateString,     // Store the adjusted local date
    startTime: startTimeString, // Use full datetime
    endTime: endTimeString,     // Use full datetime
    maxAttendees: parseInt(maxAttendees, 10),
  })
    .then(() => {
      const days = generateDays();
      if (Object.keys(days).length > 0) {
        set(attendeesRef, days)
          .then(() => {
            Alert.alert('Success', 'Event details and day entities configured successfully!');
          })
          .catch((error) => {
            Alert.alert('Error', `Failed to save day entities: ${error.message}`);
          });
      }
    })
    .catch((error) => {
      Alert.alert('Error', `Failed to save event details: ${error.message}`);
    });
  };
  
  const handleResetEvent = () => {
    Alert.alert(
      'Confirm Reset',
      'Are you sure you want to reset event details?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const eventDetailsRef = ref(database, 'event/details');
            set(eventDetailsRef, {
              eventName: '',
              startDate: '',
              endDate: '',
              startTime: '',
              endTime: '',
              maxAttendees: null,
            })
              .then(() => {
                Alert.alert('Success', 'Event details reset successfully!');
                setEventName('');
                setStartDate(new Date());
                setEndDate(new Date());
                setStartTime(new Date());
                setEndTime(new Date());
                setMaxAttendees('');
              })
              .catch((error) => {
                Alert.alert('Error', `Failed to reset event details: ${error.message}`);
              });
          },
        },
      ]
    );
  };

  // Delete all previous event data
  const handleDeleteData = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete all previous event data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const attendeesRef = ref(database, 'event/attendees');
            remove(attendeesRef)
              .then(() => {
                Alert.alert('Success', 'Previous event data deleted successfully!');
              })
              .catch((error) => {
                Alert.alert('Error', `Failed to delete data: ${error.message}`);
              });
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white h-full w-full p-4">
      <StatusBar style="light" />

      <Animated.Text entering={FadeInUp.duration(1000).springify()} className="text-2xl font-bold text-center mb-6">
        Configure Event
      </Animated.Text>

      <View className="space-y-4">
        <TextInput
          placeholder="Event Name"
          placeholderTextColor="gray"
          value={eventName}
          onChangeText={setEventName}
          className="bg-gray-100 p-4 rounded-lg mb-1"
        />

        {/* Start Date Picker */}
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="bg-gray-100 p-4 rounded-lg mb-1">
          <Text>{`Start Date: ${startDate.toDateString()}`}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        {/* End Date Picker */}
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="bg-gray-100 p-4 rounded-lg mb-1">
          <Text>{`End Date: ${endDate.toDateString()}`}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        {/* Start Time Picker */}
        <TouchableOpacity onPress={() => setShowStartTimePicker(true)} className="bg-gray-100 p-4 rounded-lg mb-1">
          <Text>{`Start Time: ${startTime.toLocaleTimeString()}`}</Text>
        </TouchableOpacity>
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowStartTimePicker(false);
              if (selectedTime) setStartTime(selectedTime);
            }}
          />
        )}

        {/* End Time Picker */}
        <TouchableOpacity onPress={() => setShowEndTimePicker(true)} className="bg-gray-100 p-4 rounded-lg mb-1">
          <Text>{`End Time: ${endTime.toLocaleTimeString()}`}</Text>
        </TouchableOpacity>
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowEndTimePicker(false);
              if (selectedTime) setEndTime(selectedTime);
            }}
          />
        )}

        <TextInput
          placeholder="Max Attendees"
          placeholderTextColor="gray"
          value={maxAttendees}
          onChangeText={setMaxAttendees}
          keyboardType="numeric"
          className="bg-gray-100 p-4 rounded-lg mb-1"
        />
      </View>

      <View className="mt-8 space-y-4">
        <Animated.View entering={FadeInDown.duration(1000).springify()} className="w-full bg-sky-500 p-4 rounded-2xl mb-2">
          <TouchableOpacity onPress={handleSaveConfig}>
            <Text className="text-white text-center font-bold">Save Event Configuration</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} className="w-full bg-sky-500 p-4 rounded-2xl mb-2">
          <TouchableOpacity onPress={handleResetEvent}>
            <Text className="text-white text-center font-bold">Reset Event Details</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} className="w-full bg-sky-500 p-4 rounded-2xl mb-2">
          <TouchableOpacity onPress={handleDeleteData}>
            <Text className="text-white text-center font-bold">Delete Previous Event Data</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}