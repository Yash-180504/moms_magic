import { useMemo, useState } from 'react'
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { ChefHat, Search, Star, TrendingUp, Users } from 'lucide-react-native'
import './global.css'
import ProviderCard from './src/components/ProviderCard'
import HowItWorks from './src/components/HowItWorks'
import Footer from './src/components/Footer'
import { CATEGORIES, PROVIDERS } from './src/data/mockProviders'

const STATS = [
  { icon: ChefHat, value: '500+', label: 'Home Cooks', color: '#EA580C' },
  { icon: Users, value: '12,000+', label: 'Happy Customers', color: '#2563EB' },
  { icon: Star, value: '4.7', label: 'Avg Rating', color: '#F59E0B' },
  { icon: TrendingUp, value: 'Rs 60-Rs 100', label: 'Per Meal', color: '#16A34A' },
]

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProviders = useMemo(() => {
    return PROVIDERS.filter((provider) => {
      const matchesCategory =
        activeCategory === 'all' || provider.tags.includes(activeCategory)
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        q.length === 0 ||
        provider.name.toLowerCase().includes(q) ||
        provider.location.toLowerCase().includes(q) ||
        provider.specialty.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <SafeAreaView className="flex-1 bg-brand-bg">
      <StatusBar style="dark" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4 pb-7 bg-orange-50">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-11 h-11 rounded-2xl bg-brand-primary items-center justify-center">
              <ChefHat color="white" size={22} />
            </View>
            <View>
              <Text className="text-brand-muted text-xs">Home-cooked. Delivered daily.</Text>
              <Text className="text-brand-heading text-2xl font-bold">Moms Magic</Text>
            </View>
          </View>

          <Text className="text-brand-heading text-3xl font-bold leading-9">
            Taste of home, right at your door
          </Text>
          <Text className="text-brand-muted mt-3 text-base leading-6">
            Find verified home cooks near you and get freshly cooked meals delivered every day.
          </Text>

          <View className="mt-5 bg-white border border-brand-border rounded-2xl px-4 py-3 flex-row items-center gap-2">
            <Search size={18} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search kitchens, locations, meals"
              placeholderTextColor="#94A3B8"
              className="flex-1 text-brand-heading"
            />
          </View>
        </View>

        <View className="mx-5 mt-5 bg-white border border-brand-border rounded-3xl p-4">
          <View className="flex-row flex-wrap justify-between">
            {STATS.map((item) => {
              const Icon = item.icon
              return (
                <View key={item.label} className="w-[48%] bg-orange-50 rounded-2xl p-3 mb-3">
                  <Icon size={20} color={item.color} />
                  <Text className="text-brand-heading text-xl font-bold mt-2">{item.value}</Text>
                  <Text className="text-brand-muted text-xs mt-1">{item.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        <View className="px-5 mt-7">
          <Text className="text-brand-heading text-2xl font-bold">Kitchens near you</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    active
                      ? 'bg-brand-primary border-brand-primary'
                      : 'bg-white border-brand-border'
                  }`}
                >
                  <Text className={`text-sm font-semibold ${active ? 'text-white' : 'text-brand-muted'}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <View className="mt-5 gap-4">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </View>

          {filteredProviders.length === 0 && (
            <View className="items-center py-10">
              <Text className="text-brand-heading text-xl font-bold">No kitchens found</Text>
              <Text className="text-brand-muted mt-2">Try another filter or search term.</Text>
            </View>
          )}
        </View>

        <HowItWorks />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  )
}
