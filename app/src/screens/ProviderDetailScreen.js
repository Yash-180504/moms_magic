import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react-native';
import { api } from '../lib/api';
import { useData } from '../context/DataContext';

export default function ProviderDetailScreen({ route, navigation }) {
  const { providerId, providerName } = route.params;
  const { createOrder } = useData();

  const [provider, setProvider] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [provRes, menuRes] = await Promise.all([
          api.providers.get(providerId),
          api.menu.list(providerId),
        ]);
        setProvider(provRes.provider);
        setMenu(menuRes.items || []);
      } catch (err) {
        console.error('Failed to load provider:', err);
        Alert.alert('Error', 'Failed to load provider details');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [providerId]);

  const updateCart = (itemId, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[itemId];
      setCart(newCart);
    } else {
      setCart({ ...cart, [itemId]: quantity });
    }
  };

  const cartItems = menu.filter((item) => cart[item.id]);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * cart[item.id], 0);
  const total = subtotal; // Add delivery charges if needed

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your order');
      return;
    }

    setOrdering(true);
    try {
      const items = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: cart[item.id],
        price: item.price,
      }));

      await createOrder(items, 'User Address'); // TODO: Get delivery address from user
      Alert.alert('Success', 'Order placed successfully!');
      setCart({});
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-orange-50">
      <StatusBar style="dark" />

      {/* Provider Header */}
      {provider && (
        <View className="bg-white border-b border-slate-200">
          {provider.image && (
            <Image source={{ uri: provider.image }} className="w-full h-48" />
          )}
          <View className="px-5 py-4">
            <Text className="text-slate-900 text-2xl font-bold">{provider.name}</Text>
            <Text className="text-slate-600 text-sm mt-1">{provider.location}</Text>

            {/* Rating */}
            <View className="flex-row items-center gap-2 mt-3">
              <View className="flex-row items-center gap-1">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-slate-900 font-bold">{provider.rating || 4.5}</Text>
              </View>
              <Text className="text-slate-600 text-sm">
                ({provider.reviews || 0} reviews)
              </Text>
            </View>

            {provider.specialty && (
              <Text className="text-slate-600 text-sm mt-2">
                Specialty: {provider.specialty}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View className="px-5 py-4">
        <Text className="text-slate-900 text-lg font-bold mb-4">Menu</Text>

        {menu.length === 0 ? (
          <Text className="text-slate-600">No items available</Text>
        ) : (
          menu.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-slate-900 font-bold">{item.name}</Text>
                  <Text className="text-slate-600 text-sm mt-1">{item.description}</Text>
                  <Text className="text-orange-600 font-bold mt-2">Rs {item.price}</Text>
                </View>

                {/* Quantity Controls */}
                {cart[item.id] ? (
                  <View className="bg-orange-600 rounded-lg flex-row items-center">
                    <Pressable
                      onPress={() => updateCart(item.id, cart[item.id] - 1)}
                      className="p-2">
                      <Minus size={16} color="white" />
                    </Pressable>
                    <Text className="text-white font-bold px-2">{cart[item.id]}</Text>
                    <Pressable
                      onPress={() => updateCart(item.id, cart[item.id] + 1)}
                      className="p-2">
                      <Plus size={16} color="white" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => updateCart(item.id, 1)}
                    className="bg-orange-600 rounded-lg p-2">
                    <Plus size={16} color="white" />
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <View className="px-5 pb-6">
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="text-slate-900 font-bold mb-3">Order Summary</Text>
            {cartItems.map((item) => (
              <View key={item.id} className="flex-row justify-between mb-2">
                <Text className="text-slate-600">
                  {item.name} x{cart[item.id]}
                </Text>
                <Text className="text-slate-900 font-semibold">
                  Rs {item.price * cart[item.id]}
                </Text>
              </View>
            ))}
            <View className="border-t border-slate-200 pt-3 mt-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600">Subtotal</Text>
                <Text className="text-slate-900 font-semibold">Rs {subtotal}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-900 font-bold">Total</Text>
                <Text className="text-orange-600 font-bold text-lg">Rs {total}</Text>
              </View>
            </View>

            {/* Order Button */}
            <Pressable
              onPress={handleOrder}
              disabled={ordering}
              className={`mt-4 ${
                ordering ? 'bg-orange-400' : 'bg-orange-600'
              } rounded-lg py-3 flex-row items-center justify-center gap-2`}>
              {ordering ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <ShoppingCart size={20} color="white" />
                  <Text className="text-white font-bold">Place Order</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
