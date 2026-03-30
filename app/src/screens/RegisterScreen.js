import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ChefHat } from "lucide-react-native";
import { AuthContext } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await register(email, password, name, "customer");
    } catch (err) {
      setError(err.data?.error || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-10 justify-center">
          {/* Logo */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-3xl bg-orange-600 items-center justify-center mb-4">
              <ChefHat color="white" size={32} />
            </View>
            <Text className="text-slate-900 text-3xl font-bold">
              Moms Magic
            </Text>
            <Text className="text-slate-600 text-sm mt-2">
              Create your account
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <Text className="text-red-900 font-semibold text-sm">
                {error}
              </Text>
            </View>
          )}

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-slate-700 font-semibold text-sm mb-2">
              Full Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor="#94A3B8"
              editable={!loading}
              className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
            />
          </View>

          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-slate-700 font-semibold text-sm mb-2">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              editable={!loading}
              className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
            />
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-slate-700 font-semibold text-sm mb-2">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              editable={!loading}
              className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
            />
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-slate-700 font-semibold text-sm mb-2">
              Confirm Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              editable={!loading}
              className="bg-slate-100 border border-slate-300 rounded-lg px-4 py-3 text-slate-900"
            />
          </View>

          {/* Register Button */}
          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className={`${
              loading ? "bg-orange-400" : "bg-orange-600"
            } rounded-lg py-3 items-center mb-4`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Login Link */}
          <View className="flex-row justify-center gap-1 mt-2">
            <Text className="text-slate-600">Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text className="text-orange-600 font-bold">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
