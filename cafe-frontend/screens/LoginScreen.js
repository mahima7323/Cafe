import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import API from "../services/api";
import { saveToken } from "../utils/storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/users/login", { email, password });
      await saveToken(res.data.token);
      navigation.replace("Home");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={login} />
    </View>
  );
}
