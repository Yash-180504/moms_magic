import { Text, View } from 'react-native'
import { Bike, MapPin, UtensilsCrossed } from 'lucide-react-native'

const STEPS = [
  {
    icon: MapPin,
    title: 'Find nearby kitchens',
    description: 'Browse verified cooks by location, meal type, and price.',
    bg: 'bg-blue-100',
    color: '#2563EB',
  },
  {
    icon: UtensilsCrossed,
    title: 'Choose a meal plan',
    description: 'Pick daily or weekly plans with clear pricing.',
    bg: 'bg-orange-100',
    color: '#EA580C',
  },
  {
    icon: Bike,
    title: 'Get fresh delivery',
    description: 'Receive hot, home-style food on your schedule.',
    bg: 'bg-green-100',
    color: '#16A34A',
  },
]

export default function HowItWorks() {
  return (
    <View className="px-5 pt-10">
      <Text className="text-brand-heading text-2xl font-bold">How it works</Text>
      <View className="mt-4 gap-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <View key={step.title} className="bg-white border border-brand-border rounded-2xl p-4">
              <View className="flex-row items-start gap-3">
                <View className={`w-11 h-11 rounded-2xl items-center justify-center ${step.bg}`}>
                  <Icon size={20} color={step.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-brand-heading text-base font-bold">
                    {index + 1}. {step.title}
                  </Text>
                  <Text className="text-brand-muted text-sm mt-1">{step.description}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
