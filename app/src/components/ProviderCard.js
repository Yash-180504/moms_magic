import { Pressable, Text, View } from 'react-native'
import { Clock3, MapPin, ShieldCheck, Star } from 'lucide-react-native'

const TAG_CONFIG = {
  veg: { label: 'Veg', bg: 'bg-green-100', text: 'text-green-700' },
  nonveg: { label: 'Non-Veg', bg: 'bg-red-100', text: 'text-red-700' },
}

export default function ProviderCard({ provider }) {
  return (
    <Pressable className="bg-white border border-brand-border rounded-2xl overflow-hidden">
      <View
        className="h-32 justify-between p-4"
        style={{
          backgroundColor: provider.thumbnail.from,
        }}
      >
        <View className="flex-row justify-between items-start">
          <Text className="text-white/90 text-3xl font-bold">{provider.name[0]}</Text>
          {provider.verified && (
            <View className="bg-white/90 rounded-full px-2 py-1 flex-row items-center gap-1">
              <ShieldCheck size={12} color="#2563EB" />
              <Text className="text-[11px] font-semibold text-[#2563EB]">Verified</Text>
            </View>
          )}
        </View>

        <View className="self-start bg-white/90 rounded-full px-2 py-1 flex-row items-center gap-1">
          <Star size={12} color="#F59E0B" fill="#F59E0B" />
          <Text className="text-xs font-semibold text-brand-heading">{provider.rating}</Text>
          <Text className="text-xs text-brand-muted">({provider.totalOrders})</Text>
        </View>
      </View>

      <View className="p-4 gap-3">
        <View>
          <Text className="text-brand-heading text-lg font-bold">{provider.name}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MapPin size={13} color="#64748B" />
            <Text className="text-xs text-brand-muted">{provider.location}</Text>
          </View>
        </View>

        <Text className="text-brand-muted text-sm">{provider.specialty}</Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-2">
            {provider.tags.map((tag) => {
              const config = TAG_CONFIG[tag]
              return (
                <View key={tag} className={`rounded-full px-2 py-1 ${config.bg}`}>
                  <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
                </View>
              )
            })}
          </View>

          <View className="flex-row items-center gap-1">
            <Clock3 size={12} color="#64748B" />
            <Text className="text-xs text-brand-muted">{provider.deliveryTime}</Text>
          </View>
        </View>

        <View className="pt-3 border-t border-brand-border flex-row items-center justify-between">
          <Text className="text-brand-muted text-sm">
            From <Text className="text-brand-primary text-lg font-bold">Rs {provider.priceFrom}</Text> / meal
          </Text>
          <Pressable className="bg-brand-primary rounded-xl px-4 py-2">
            <Text className="text-white text-sm font-semibold">Order</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  )
}
