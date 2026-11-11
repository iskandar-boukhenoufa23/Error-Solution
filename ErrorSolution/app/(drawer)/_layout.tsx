import { View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Drawer,
  DrawerContentScrollView,
  DrawerItemList,
} from "expo-router/drawer";
import { useUser, useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { MessageSquarePlus, History, HelpCircle, Settings, User, LogOut } from "lucide-react-native";
import { useState } from "react";

// Custom Drawer Content
function CustomDrawerContent(props: any) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <View className="flex-1">
      <DrawerContentScrollView {...props}>
        {/* User information */}
        <View className="p-5 border-b border-zinc-200 mb-2 items-start">
          <TouchableOpacity
            className="mt-2 py-1 flex-row items-center gap-2"
            onPress={() => setShowLogout(!showLogout)}
          >
            <View className="h-8 w-8 rounded-full bg-zinc-100 items-center justify-center">
              <User size={16} color="#18181b" />
            </View>
            <Text className="text-zinc-800 font-medium text-xs flex-1" numberOfLines={1}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </TouchableOpacity>

          {showLogout && (
            <TouchableOpacity
              className="mt-3 py-1.5 px-3 rounded-lg bg-red-50 border border-red-200 flex-row items-center gap-2 w-full"
              onPress={() => signOut()}
            >
              <LogOut size={16} color="#dc2626" />
              <Text className="text-red-600 font-medium text-xs">
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation items */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}

export default function Layout() {
  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerTitle: "",
          headerStyle: {
            backgroundColor: "#ffffff",
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              className="ml-4 justify-center items-center h-10 w-10"
            >
              <Ionicons name="menu" size={30} color="#18181b" />
            </TouchableOpacity>
          ),
        })}
      >
        <Drawer.Screen
          name="chat/index"
          options={{
            drawerLabel: "New Chat",
            title: "New Chat",
            drawerIcon: ({ color, size }) => (
              <MessageSquarePlus size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="chat/[id]"
          options={{
            drawerItemStyle: { display: "none" },
          }}
        />

        <Drawer.Screen
          name="history"
          options={{
            drawerLabel: "History",
            title: "History",
            drawerIcon: ({ color, size }) => (
              <History size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="help-center"
          options={{
            drawerLabel: "Help Center",
            title: "Help Center",
            drawerIcon: ({ color, size }) => (
              <HelpCircle size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="settings/index"
          options={{
            drawerLabel: "Settings",
            title: "Settings",
            drawerIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: "My Profile",
            title: "Profile",
            drawerIcon: ({ color, size }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}