import { useState } from "react";
import { Pressable, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, CircleHelp } from "lucide-react-native";

const questions = [
  {
    question: "How are fixes found?",
    answer:
      "The backend searches its developer-error knowledge base for semantically similar errors and returns the matching fixes.",
  },
  {
    question: "Where are my conversations stored?",
    answer:
      "Conversation messages are saved to the account associated with your signed-in session and appear in History.",
  },
  {
    question: "Why did I receive no matches?",
    answer:
      "The current knowledge base may not contain a sufficiently similar error. Try including the complete error text and relevant framework details.",
  },
  {
    question: "Why can’t I connect to the server?",
    answer:
      "Confirm that the backend is running and that EXPO_PUBLIC_API_URL points to an address reachable from this device.",
  },
];

export default function HelpCenterScreen() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-6">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#0a7ea4]/10 border border-[#0a7ea4]/20 mb-3">
            <CircleHelp size={22} color="#0a7ea4" />
          </View>
          <Text className="text-2xl font-bold text-zinc-900 tracking-tight">
            Help Center
          </Text>
          <Text className="mt-1 text-sm text-zinc-500">
            Answers about search, conversations, and account access.
          </Text>
        </View>

        {/* FAQ Cards Container */}
        <View className="gap-3">
          {questions.map((item, index) => {
            const isExpanded = expanded === index;
            return (
              <Pressable
                key={item.question}
                onPress={() => setExpanded(isExpanded ? null : index)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                className={`border rounded-2xl p-4 transition-all ${
                  isExpanded 
                    ? "bg-white border-[#0a7ea4]/40 shadow-sm" 
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <View className="flex-row items-center justify-between gap-4">
                  <Text className="flex-1 font-semibold text-zinc-900 text-base">
                    {item.question}
                  </Text>
                  <View className={`h-8 w-8 rounded-full items-center justify-center ${isExpanded ? "bg-[#0a7ea4]/10" : "bg-zinc-200/60"}`}>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#0a7ea4" />
                    ) : (
                      <ChevronDown size={18} color="#52525b" />
                    )}
                  </View>
                </View>
                
                {isExpanded ? (
                  <Text className="mt-3 pt-3 border-t border-zinc-100 leading-6 text-zinc-600 text-sm">
                    {item.answer}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}