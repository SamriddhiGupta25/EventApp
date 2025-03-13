import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Overlay({ message }) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  text: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
});