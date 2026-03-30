import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Search, Star, ChefHat } from "lucide-react-native";
import { useData } from "../context/DataContext";

export default function HomeScreen({ navigation }) {
  const { providers, loading, error, isConnected } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProviders, setFilteredProviders] = useState([]);

  useEffect(() => {
    const filtered = providers.filter((p) => {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.specialty?.toLowerCase().includes(q)
      );
    });
    setFilteredProviders(filtered);
  }, [providers, searchQuery]);

  return (
    <ScrollView className="flex-1 bg-orange-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-4 pb-7 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-11 h-11 rounded-2xl bg-orange-600 items-center justify-center">
            <ChefHat color="white" size={22} />
          </View>
          <View>
            <Text className="text-slate-500 text-xs">
              Home-cooked. Delivered daily.
            </Text>
            <Text className="text-slate-900 text-2xl font-bold">
              Moms Magic
            </Text>
          </View>
        </View>

        <Text className="text-slate-900 text-xl font-bold leading-7 mb-3">
          Find fresh meals near you
        </Text>

        {/* Search Bar */}
        <View className="bg-slate-100 border border-slate-300 rounded-2xl px-4 py-3 flex-row items-center gap-2">
          <Search size={18} color="#64748B" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search kitchens, dishes..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-slate-900"
          />
        </View>

        {/* Connection Status */}
        {!isConnected && (
          <View className="mt-3 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
            <Text className="text-yellow-900 text-xs">
              ⚠ Sync disconnected - pull to refresh
            </Text>
          </View>
        )}
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#EA580C" />
          <Text className="text-slate-600 mt-3">Loading kitchens...</Text>
        </View>
      ) : error ? (
        <View className="p-5">
          <View className="bg-red-100 border border-red-300 rounded-lg p-4">
            <Text className="text-red-900 font-semibold">
              Error loading kitchens
            </Text>
            <Text className="text-red-800 text-sm mt-1">{error}</Text>
          </View>
        </View>
      ) : filteredProviders.length === 0 ? (
        <View className="p-5">
          <Text className="text-slate-600 text-center">
            {searchQuery
              ? "No kitchens match your search"
              : "No kitchens available"}
          </Text>
        </View>
      ) : (
        <View className="px-5 py-4">
          <Text className="text-slate-900 text-lg font-bold mb-3">
            {filteredProviders.length} Kitchen
            {filteredProviders.length !== 1 ? "s" : ""} Available
          </Text>

          {filteredProviders.map((provider) => (
            <Pressable
              key={provider.id}
              onPress={() =>
                navigation.navigate("ProviderDetail", {
                  providerId: provider.id,
                  providerName: provider.name,
                })
              }
              className="bg-white rounded-2xl p-4 mb-4 border border-slate-200"
            >
              <View className="flex-row gap-3">
                {provider.image && (
                  <Image
                    source={{ uri: provider.image }}
                    className="w-20 h-20 rounded-lg"
                  />
                )}
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold text-base">
                    {provider.name}
                  </Text>
                  <Text className="text-slate-600 text-xs mt-1">
                    {provider.location}
                  </Text>
                  {provider.specialty && (
                    <Text className="text-slate-600 text-xs mt-1">
                      • {provider.specialty}
                    </Text>
                  )}

                  {/* Rating */}
                  <View className="flex-row items-center gap-1 mt-2">
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text className="text-slate-900 font-semibold text-sm">
                      {provider.rating || 4.5}
                    </Text>
                    <Text className="text-slate-600 text-xs">
                      ({provider.reviews || 0} reviews)
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
