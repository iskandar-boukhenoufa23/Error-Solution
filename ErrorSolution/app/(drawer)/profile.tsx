import { ActivityIndicator, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { LogOut, UserRound, Mail, Calendar, ShieldCheck } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Recently";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profile Section */}
        <View className="items-center bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm mb-6">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-[#0a7ea4]/10 border border-[#0a7ea4]/20 mb-4">
            <UserRound color="#0a7ea4" size={36} />
          </View>
          <Text className="text-xl font-bold text-zinc-900 tracking-tight">
            {user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || "Developer"}
          </Text>
          <Text className="mt-1 text-sm text-zinc-500 font-medium">
            {user?.primaryEmailAddress?.emailAddress || "No email address"}
          </Text>
          
          <View className="mt-4 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="text-xs font-semibold text-emerald-700">Active Account</Text>
          </View>
        </View>

        {/* Account Details / Stats Cards */}
        <View className="gap-3 mb-6">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
            Account Overview
          </Text>

          {/* Email Info Card */}
          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-blue-50 items-center justify-center">
                <Mail size={18} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xs text-zinc-500 font-medium">Email Address</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5">
                  {user?.primaryEmailAddress?.emailAddress || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Member Since Card */}
          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-purple-50 items-center justify-center">
                <Calendar size={18} color="#9333ea" />
              </View>
              <View>
                <Text className="text-xs text-zinc-500 font-medium">Member Since</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5">{memberSince}</Text>
              </View>
            </View>
          </View>

          {/* Security Status Card */}
          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-emerald-50 items-center justify-center">
                <ShieldCheck size={18} color="#059669" />
              </View>
              <View>
                <Text className="text-xs text-zinc-500 font-medium">Security</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5">Password & Session Secured</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity
          className="mt-auto py-4 rounded-xl flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 active:opacity-75 transition-all shadow-sm"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          onPress={() => void signOut()}
        >
          <LogOut size={18} color="#dc2626" />
          <Text className="font-bold text-red-600 text-base">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}