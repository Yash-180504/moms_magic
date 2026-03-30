import React, { useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { User, LogOut, Mail, Settings } from "lucide-react-native";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout, loading } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView className="flex-1 bg-orange-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-orange-600 items-center justify-center">
            <User color="white" size={22} />
          </View>
          <View>
            <Text className="text-slate-900 text-2xl font-bold">Profile</Text>
            <Text className="text-slate-600 text-xs mt-1">
              Manage your account
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : (
        <>
          {/* User Info */}
          <View className="px-5 py-6">
            <View className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center mb-4">
                  <Text className="text-white font-bold text-3xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-slate-900 text-2xl font-bold text-center">
                  {user?.name}
                </Text>
                <Text className="text-slate-600 text-sm mt-2">
                  {user?.email}
                </Text>
              </View>

              {user?.role && (
                <View className="bg-orange-50 rounded-lg p-3 mb-4">
                  <Text className="text-slate-600 text-xs mb-1">
                    Account Type
                  </Text>
                  <Text className="text-slate-900 font-semibold capitalize">
                    {user.role}
                  </Text>
                </View>
              )}
            </View>

            {/* Menu Items */}
            <View className="space-y-3">
              <Pressable className="bg-white rounded-lg p-4 flex-row items-center justify-between border border-slate-200">
                <View className="flex-row items-center gap-3">
                  <Mail size={20} color="#EA580C" />
                  <Text className="text-slate-900 font-semibold">
                    Edit Email
                  </Text>
                </View>
                <Text className="text-slate-400">›</Text>
              </Pressable>

              <Pressable className="bg-white rounded-lg p-4 flex-row items-center justify-between border border-slate-200">
                <View className="flex-row items-center gap-3">
                  <Settings size={20} color="#EA580C" />
                  <Text className="text-slate-900 font-semibold">
                    Account Settings
                  </Text>
                </View>
                <Text className="text-slate-400">›</Text>
              </Pressable>
            </View>

            {/* Logout Button */}
            <Pressable
              onPress={handleLogout}
              disabled={loading}
              className={`mt-6 ${
                loading ? "bg-red-400" : "bg-red-600"
              } rounded-lg py-3 flex-row items-center justify-center gap-2`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <LogOut size={20} color="white" />
                  <Text className="text-white font-bold text-base">
                    Sign Out
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Info Section */}
          <View className="px-5 pb-10">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Text className="text-blue-900 font-semibold text-sm mb-2">
                About This App
              </Text>
              <Text className="text-blue-800 text-xs leading-5">
                Moms Magic connects you with verified home cooks for fresh,
                home-cooked meals delivered daily. Quality, trust, and care in
                every meal.
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
