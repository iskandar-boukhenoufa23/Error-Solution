import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { LogOut, ShieldCheck, Bell, Info, ChevronRight, User } from "lucide-react-native";

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "No email address";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-zinc-900 tracking-tight">Settings</Text>
          <Text className="mt-1 text-sm text-zinc-500">Manage your account preferences and session</Text>
        </View>

        {/* Account Section Cards */}
        <View className="gap-3 mb-6">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
            Account & Security
          </Text>

          {/* Signed-in Account Card */}
          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="h-10 w-10 rounded-lg bg-[#0a7ea4]/10 items-center justify-center">
                <ShieldCheck size={18} color="#0a7ea4" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-zinc-500 font-medium">Signed-in Account</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5" numberOfLines={1}>
                  {userEmail}
                </Text>
              </View>
            </View>
          </View>

          {/* Notifications Setting Mock Card */}
          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-blue-50 items-center justify-center">
                <Bell size={18} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xs text-zinc-500 font-medium">Notifications</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5">Enabled</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Info Section */}
        <View className="gap-3 mb-6">
          <Text className="text-xs font-semibold uppercase tracking-wider text-zinc-400 px-1">
            About
          </Text>

          <View className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-lg bg-purple-50 items-center justify-center">
                <Info size={18} color="#9333ea" />
              </View>
              <View>
                <Text className="text-xs text-zinc-500 font-medium">App Version</Text>
                <Text className="text-sm text-zinc-900 font-semibold mt-0.5">1.0.0 (Error Solution)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Note */}
        <Text className="text-xs leading-5 text-zinc-500 px-1 mb-6">
          Your conversations are securely associated with this account. Sign out anytime to end this active session on this device.
        </Text>

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