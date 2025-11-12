import React from "react";
import { View, Text, Button } from "react-native";
import { removeToken } from "../utils/storage";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to Cafe App!</Text>
      <Button
        title="Logout"
        onPress={async () => {
          await removeToken();
          navigation.replace("Login");
        }}
      />
    </View>
  );
}
