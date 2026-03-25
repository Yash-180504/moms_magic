import { Text, View } from 'react-native'

export default function Footer() {
  return (
    <View className="mt-10 bg-slate-900 px-5 py-8">
      <Text className="text-white text-xl font-bold">Moms Magic</Text>
      <Text className="text-slate-300 mt-2 leading-6">
        Connecting home cooks with people who crave a taste of home.
      </Text>
      <Text className="text-slate-400 mt-5 text-xs">Built for students, professionals, and families.</Text>
    </View>
  )
}
