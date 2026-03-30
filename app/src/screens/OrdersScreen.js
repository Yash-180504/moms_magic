import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ShoppingBag, Clock } from "lucide-react-native";
import { useData } from "../context/DataContext";

export default function OrdersScreen() {
  const { orders, loading, fetchOrders } = useData();

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100";
      case "preparing":
        return "bg-blue-100";
      case "confirmed":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "delivered":
        return "text-green-900";
      case "preparing":
        return "text-blue-900";
      case "confirmed":
        return "text-yellow-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <ScrollView className="flex-1 bg-orange-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-4 pb-6 bg-white border-b border-slate-200">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-2xl bg-orange-600 items-center justify-center">
            <ShoppingBag color="white" size={22} />
          </View>
          <View>
            <Text className="text-slate-900 text-2xl font-bold">
              Your Orders
            </Text>
            <Text className="text-slate-600 text-xs mt-1">
              Track and manage your deliveries
            </Text>
          </View>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center py-20 px-5">
          <ShoppingBag size={48} color="#D1D5DB" />
          <Text className="text-slate-600 mt-4 text-center">No orders yet</Text>
          <Text className="text-slate-500 text-sm mt-2 text-center">
            Start ordering from your favorite kitchens
          </Text>
        </View>
      ) : (
        <View className="px-5 py-4">
          {orders.map((order) => (
            <View
              key={order.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-slate-200"
            >
              {/* Order Header */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold">
                    Order #{order.id?.slice(-6)}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Clock size={14} color="#64748B" />
                    <Text className="text-slate-600 text-xs">
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                </View>
                <View
                  className={`${getStatusColor(order.status)} rounded-lg px-3 py-1`}
                >
                  <Text
                    className={`${getStatusTextColor(order.status)} text-xs font-semibold capitalize`}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <View className="bg-slate-50 rounded-lg p-3 mb-3">
                <Text className="text-slate-900 font-semibold text-sm mb-2">
                  Items
                </Text>
                {order.items?.map((item, idx) => (
                  <Text key={idx} className="text-slate-600 text-xs">
                    • {item.name} x{item.quantity}
                  </Text>
                ))}
              </View>

              {/* Order Summary */}
              <View className="border-t border-slate-200 pt-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-600 text-sm">Subtotal</Text>
                  <Text className="text-slate-900 font-semibold">
                    Rs {order.subtotal || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-900 font-bold">Total</Text>
                  <Text className="text-orange-600 font-bold">
                    Rs {order.total || 0}
                  </Text>
                </View>
              </View>

              {order.status !== "delivered" && (
                <Pressable className="mt-3 bg-orange-600 rounded-lg py-2 items-center">
                  <Text className="text-white font-semibold text-sm">
                    Track Order
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
