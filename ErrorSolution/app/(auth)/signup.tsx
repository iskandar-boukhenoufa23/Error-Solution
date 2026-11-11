import { useAuth, useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function SignupScreen() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const handleSubmit = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })
    } catch (err) {
      setError(err)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      await signUp.attemptEmailAddressVerification({
        code,
      })

      if (signUp.status === 'complete') {
        await setActive({ session: signUp.createdSessionId })
        router.replace('/(drawer)')
      }
    } catch (err) {
      setError(err)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || isSignedIn) return null

  // ---------------- VERIFY STEP ----------------
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields?.includes('email_address')
  ) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        className="bg-[#0B0F17]"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            entering={FadeInDown.duration(400)}
            className="w-full max-w-[440px] self-center"
          >
            {/* Header */}
            <View className="items-center mb-8">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="h-9 w-9 rounded-xl bg-[#0a7ea4] items-center justify-center shadow-lg shadow-[#0a7ea4]/30">
                  <Animated.View className="h-3 w-3 bg-white rounded-full" />
                </View>
                <Text className="text-2xl text-white font-extrabold tracking-tight">
                  Error Solution
                </Text>
              </View>
              <Text className="text-gray-400 text-sm text-center">
                We sent a 6-digit verification code to your email.
              </Text>
            </View>

            {/* Verification Card */}
            <View className="bg-[#161D2A] border border-white/10 rounded-2xl p-6 shadow-2xl gap-5">
              <Text className="text-xl text-white font-bold tracking-wide">
                Verify Account
              </Text>

              <View className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Verification Code
                </Text>
                <TextInput
                  className="bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium text-center text-xl tracking-[10px] focus:border-[#0a7ea4]"
                  value={code}
                  placeholder="000000"
                  placeholderTextColor="#4B5563"
                  onChangeText={setCode}
                  keyboardType="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              </View>

              {error && (
                <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <Text className="text-red-400 text-xs font-medium text-center">
                    {error?.errors?.[0]?.message || 'Verification failed. Try again.'}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleVerify}
                disabled={!code || loading}
                className={`py-4 rounded-xl items-center justify-center bg-[#0a7ea4] active:opacity-80 transition-all shadow-lg shadow-[#0a7ea4]/25 ${
                  !code || loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Verify & Continue
                  </Text>
                )}
              </Pressable>

              <Pressable
                disabled={loading}
                onPress={async () => {
                  try {
                    await signUp.prepareEmailAddressVerification({
                      strategy: 'email_code',
                    })
                  } catch (err: any) {
                    setError(err)
                  }
                }}
                className="items-center py-1 active:opacity-70"
              >
                <Text className="text-gray-400 font-medium text-xs">
                  Didn't receive code? <Text className="text-[#0a7ea4] font-bold">Resend</Text>
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ---------------- INITIAL SIGNUP STEP ----------------
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      className="bg-[#0B0F17]"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.duration(400)}
          className="w-full max-w-[440px] self-center"
        >
          {/* Header & Logo */}
          <View className="items-center mb-8">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="h-9 w-9 rounded-xl bg-[#0a7ea4] items-center justify-center shadow-lg shadow-[#0a7ea4]/30">
                <Animated.View className="h-3 w-3 bg-white rounded-full" />
              </View>
              <Text className="text-2xl text-white font-extrabold tracking-tight">
                Error Solution
              </Text>
            </View>
            <Text className="text-gray-400 text-sm">Create an account to get started.</Text>
          </View>

          {/* Form Container */}
          <View className="bg-[#161D2A] border border-white/10 rounded-2xl p-6 shadow-2xl gap-5">
            <Text className="text-xl text-white font-bold tracking-wide">
              Create Account
            </Text>

            {/* Email Input */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address
              </Text>
              <TextInput
                className="bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium text-base focus:border-[#0a7ea4]"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="name@example.com"
                placeholderTextColor="#6B7280"
              />
            </View>

            {/* Password Input */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </Text>
              <TextInput
                className="bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium text-base focus:border-[#0a7ea4]"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Create a strong password"
                placeholderTextColor="#6B7280"
              />
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <Text className="text-red-400 text-xs font-medium text-center">
                  {error?.errors?.[0]?.message || 'Sign up failed. Please try again.'}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!emailAddress || !password || loading}
              className={`py-4 rounded-xl items-center justify-center bg-[#0a7ea4] active:opacity-80 transition-all shadow-lg shadow-[#0a7ea4]/25 ${
                !emailAddress || !password || loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">
                  Sign Up
                </Text>
              )}
            </Pressable>

            {/* Footer Navigation Link */}
            <View className="flex-row gap-1.5 justify-center items-center mt-2">
              <Text className="text-gray-400 text-sm">Already have an account?</Text>
              <Link href="/signin">
                <Text className="text-[#0a7ea4] font-bold text-sm">
                  Sign in
                </Text>
              </Link>
            </View>

            <View nativeID="clerk-captcha" />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}