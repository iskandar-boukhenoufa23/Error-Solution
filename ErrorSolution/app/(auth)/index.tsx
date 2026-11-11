import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "google" | "github";

export default function AuthIndex() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] =
    useState<OAuthProvider | null>(null);

  // Your installed Clerk package is Core 2 (v2.19.31).
  // Keep useOAuth until you migrate Clerk to Core 3.
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });

  const { startOAuthFlow: startGithubOAuth } = useOAuth({
    strategy: "oauth_github",
  });

  // Animations
  const translateY = useSharedValue(400);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    translateY.value = withTiming(0, {
      duration: 1000,
    });
  }, []);

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const upAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Google and GitHub authentication
  const handleOAuth = async (provider: OAuthProvider) => {
    if (loadingProvider) return;

    setLoadingProvider(provider);

    try {
      const startOAuthFlow =
        provider === "google"
          ? startGoogleOAuth
          : startGithubOAuth;

      const { createdSessionId, setActive } =
        await startOAuthFlow({
          redirectUrl: Linking.createURL("", {
            scheme: "errorsolution",
          }),
        });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });

        // Navigate to your authenticated drawer.
        router.replace("/(drawer)/chat");
      } else {
        Alert.alert(
          "Authentication incomplete",
          "Additional verification may be required. Please try again."
        );
      }
    } catch (error: any) {
      console.error(`${provider} authentication error:`, error);

      Alert.alert(
        "Sign-in failed",
        error?.errors?.[0]?.longMessage ||
          error?.message ||
          "Unable to authenticate. Please try again."
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
  <View className="flex-1 bg-background items-center justify-end md:justify-center">

    {/* Animated circle */}
    <Animated.View
      style={scaleAnimatedStyle}
      className="absolute top-[20%] md:top-[15%] h-7 w-7 bg-white rounded-full"
    />

    {/* Authentication Card */}
    <Animated.View
      style={upAnimatedStyle}
      className="
        w-full
        max-w-[480px]
        bg-white
        rounded-t-[40px]
        md:rounded-[40px]
        px-6
        pt-10
        pb-12
        md:shadow-2xl
      "
    >

      <Text className="text-2xl font-bold text-black text-center mb-2">
        Welcome to Error Solution
      </Text>

      <Text className="text-gray-500 text-center mb-8">
        Choose how you want to continue
      </Text>

      {/* Email */}
      <TouchableOpacity
        className="bg-black h-14 rounded-2xl items-center justify-center flex-row mb-4"
        onPress={() => router.replace("/(auth)/signin")}
        disabled={!!loadingProvider}
      >
        <Ionicons name="mail-outline" size={22} color="white" />
        <Text className="text-white font-semibold ml-3">
          Continue with Email
        </Text>
      </TouchableOpacity>

      {/* Google */}
      <TouchableOpacity
        className="bg-white border border-gray-300 h-14 rounded-2xl items-center justify-center flex-row mb-4"
        onPress={() => handleOAuth("google")}
        disabled={!!loadingProvider}
      >
        {loadingProvider === "google" ? (
          <ActivityIndicator color="#4285F4" />
        ) : (
          <Ionicons name="logo-google" size={22} color="#4285F4" />
        )}

        <Text className="text-gray-800 font-semibold ml-3">
          Continue with Google
        </Text>
      </TouchableOpacity>

      {/* GitHub */}
      <TouchableOpacity
        className="bg-[#24292e] h-14 rounded-2xl items-center justify-center flex-row"
        onPress={() => handleOAuth("github")}
        disabled={!!loadingProvider}
      >
        {loadingProvider === "github" ? (
          <ActivityIndicator color="white" />
        ) : (
          <Ionicons name="logo-github" size={22} color="white" />
        )}

        <Text className="text-white font-semibold ml-3">
          Continue with GitHub
        </Text>
      </TouchableOpacity>

    </Animated.View>
  </View>
);
}