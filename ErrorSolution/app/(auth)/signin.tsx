import { useSignIn } from '@clerk/clerk-expo'
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [verifyingSecondFactor, setVerifyingSecondFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  // 1. First Step: Authenticate with Email & Password
  const handleSignIn = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('(drawer)')
      } else if (result.status === 'needs_second_factor') {
        // Find supported 2FA strategy from Clerk response
        const emailFactor = result.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === 'email_code'
        )

        if (emailFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: (emailFactor as any).emailAddressId,
          })
          setVerifyingSecondFactor(true)
        } else {
          setError({ errors: [{ message: 'No supported 2FA method found.' }] })
        }
      } else {
        console.log('Additional steps required:', result)
      }
    } catch (err) {
      setError(err)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  // 2. Second Step: Attempt 2FA Code Verification
  const handleVerifySecondFactor = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError(null)

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(drawer)')
      } else {
        console.log('2FA status incomplete:', result)
      }
    } catch (err) {
      setError(err)
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) return null

  // ---------------- VIEW 2: 2FA CODE VERIFICATION ----------------
  if (verifyingSecondFactor) {
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
            <View className="items-center mb-8">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="h-9 w-9 rounded-xl bg-[#0a7ea4] items-center justify-center shadow-lg shadow-[#0a7ea4]/30">
                  <View className="h-3 w-3 bg-white rounded-full" />
                </View>
                <Text className="text-2xl text-white font-extrabold tracking-tight">
                  Error Solution
                </Text>
              </View>
              <Text className="text-gray-400 text-sm text-center">
                Enter the verification code sent to your email.
              </Text>
            </View>

            <View className="bg-[#161D2A] border border-white/10 rounded-2xl p-6 shadow-2xl gap-5">
              <Text className="text-xl text-white font-bold tracking-wide">
                Two-Factor Authentication
              </Text>

              <View className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Security Code
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
                    {error?.errors?.[0]?.message || 'Invalid code. Please try again.'}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleVerifySecondFactor}
                disabled={!code || loading}
                className={`py-4 rounded-xl items-center justify-center bg-[#0a7ea4] active:opacity-80 transition-all shadow-lg shadow-[#0a7ea4]/25 ${
                  !code || loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Verify & Sign In
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setVerifyingSecondFactor(false)}
                className="items-center py-1 active:opacity-70"
              >
                <Text className="text-gray-400 text-xs font-medium">
                  ← Back to Sign In
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // ---------------- VIEW 1: EMAIL & PASSWORD SIGN IN ----------------
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
          <View className="items-center mb-8">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="h-9 w-9 rounded-xl bg-[#0a7ea4] items-center justify-center shadow-lg shadow-[#0a7ea4]/30">
                <View className="h-3 w-3 bg-white rounded-full" />
              </View>
              <Text className="text-2xl text-white font-extrabold tracking-tight">
                Error Solution
              </Text>
            </View>
            <Text className="text-gray-400 text-sm">Welcome back! Please enter your details.</Text>
          </View>

          <View className="bg-[#161D2A] border border-white/10 rounded-2xl p-6 shadow-2xl gap-5">
            <Text className="text-xl text-white font-bold tracking-wide">
              Sign In
            </Text>

            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address
              </Text>
              <TextInput
                className="bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium text-base focus:border-[#0a7ea4]"
                autoCapitalize="none"
                autoComplete="email"
                value={emailAddress}
                placeholder="name@example.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                returnKeyType="next"
              />
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Password
              </Text>
              <TextInput
                className="bg-[#0B0F17] border border-white/10 rounded-xl px-4 py-3.5 text-white font-medium text-base focus:border-[#0a7ea4]"
                value={password}
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                autoComplete="current-password"
                onChangeText={setPassword}
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
              />
            </View>

            {error && (
              <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <Text className="text-red-400 text-xs font-medium text-center">
                  {error?.errors?.[0]?.message || 'Something went wrong. Please try again.'}
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleSignIn}
              disabled={!emailAddress || !password || loading}
              className={`py-4 rounded-xl items-center justify-center bg-[#0a7ea4] active:opacity-80 transition-all shadow-lg shadow-[#0a7ea4]/25 ${
                !emailAddress || !password || loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-bold text-base tracking-wide">
                  Sign In
                </Text>
              )}
            </Pressable>

            <View className="flex-row gap-1.5 justify-center items-center mt-2">
              <Text className="text-gray-400 text-sm">Don't have an account?</Text>
              <Link href="/signup">
                <Text className="text-[#0a7ea4] font-bold text-sm">
                  Sign up
                </Text>
              </Link>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}