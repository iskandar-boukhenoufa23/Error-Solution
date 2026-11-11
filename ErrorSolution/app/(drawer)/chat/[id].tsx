import { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ArrowUp } from "lucide-react-native";
import { apiRequest } from "../../../utils/api";

interface Message {
  id: string;
  role: string;
  message: string;
  created_at?: string;
}

interface ChatDetail {
  messages: Message[];
}

interface MessageResult {
  error: string;
  fix: string;
  score: number;
}

interface SendResponse {
  chat_id: string;
  response: MessageResult[];
}

function renderMessage(message: string) {
  try {
    const results = JSON.parse(message) as MessageResult[];
    if (!Array.isArray(results)) return message;
    if (results.length === 0)
      return "No similar errors were found in the knowledge base.";

    return results.map((result, index) => (
      <View key={`${result.error}-${index}`} className="mb-3.5 last:mb-0 bg-white/60 p-3 rounded-xl border border-zinc-200/60">
        <Text className="font-bold text-zinc-900 text-sm">Similar Error</Text>
        <Text className="mt-1 text-zinc-700 text-sm leading-5">{result.error}</Text>
        <Text className="mt-3 font-bold text-[#0a7ea4] text-sm">Suggested Fix</Text>
        <Text className="mt-1 text-zinc-700 text-sm leading-5">{result.fix}</Text>
        <View className="mt-3 pt-2 border-t border-zinc-200/40 flex-row justify-between items-center">
          <Text className="text-xs font-semibold text-zinc-400">Match Score</Text>
          <Text className="text-xs font-bold text-[#0a7ea4]">
            {Math.round(result.score * 100)}%
          </Text>
        </View>
      </View>
    ));
  } catch {
    return message;
  }
}

export default function ChatScreen() {
  const { getToken } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadChat = async () => {
      setMessages([]);
      setError("");
      if (!id) return;

      setLoadingHistory(true);
      try {
        const token = await getToken();
        const chat = await apiRequest<ChatDetail>(
          `/chat/${encodeURIComponent(id)}`,
          token,
        );
        if (active) setMessages(chat.messages ?? []);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load conversation.",
          );
      } finally {
        if (active) setLoadingHistory(false);
      }
    };

    void loadChat();
    return () => {
      active = false;
    };
  }, [id]);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || sending) return;

    const optimisticId = `local-${Date.now()}`;
    const createdAt = new Date().toISOString();
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "user", message, created_at: createdAt },
    ]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const token = await getToken();
      const result = await apiRequest<SendResponse>("/message/create", token, {
        method: "POST",
        body: JSON.stringify({ chat_id: id ?? null, message }),
      });
      if (!id) {
        router.replace(`/(drawer)/chat/${result.chat_id}`);
        return;
      }
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          message: JSON.stringify(result.response),
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (sendError) {
      setMessages((current) =>
        current.filter((item) => item.id !== optimisticId),
      );
      setInput(message);
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            loadingHistory ? (
              <ActivityIndicator className="mt-12" color="#0a7ea4" size="large" />
            ) : (
              <View className="flex-1 items-center justify-center px-8">
                <View className="h-16 w-16 rounded-full bg-[#0a7ea4]/10 items-center justify-center mb-3">
                  <ArrowUp size={26} color="#0a7ea4" />
                </View>
                <Text className="text-lg font-bold text-zinc-900 text-center">
                  What error are you solving?
                </Text>
                <Text className="mt-1.5 text-center text-zinc-500 text-sm">
                  Describe or paste the error log below to search for related fixes.
                </Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View
                className={`mb-3.5 max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                  isUser 
                    ? "self-end bg-[#0a7ea4]" 
                    : "self-start bg-zinc-50 border border-zinc-200"
                }`}
              >
                {isUser ? (
                  <Text className="text-base leading-6 text-white font-medium">
                    {item.message}
                  </Text>
                ) : (
                  <View>{renderMessage(item.message)}</View>
                )}
                <Text
                  className={`mt-2 text-xs font-medium text-right ${
                    isUser ? "text-cyan-100" : "text-zinc-400"
                  }`}
                >
                  {item.created_at
                    ? new Date(item.created_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Now"}
                </Text>
              </View>
            );
          }}
        />

        {error ? (
          <Text className="px-4 pb-2 text-sm text-red-600 font-medium">{error}</Text>
        ) : null}

        <View className="flex-row items-end gap-3 border-t border-zinc-200 px-4 py-3 bg-white">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Paste an error message or log..."
            placeholderTextColor="#a1a1aa"
            multiline
            maxLength={10000}
            className="max-h-32 min-h-12 flex-1 rounded-2xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-base text-zinc-900"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending || !input.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            className={`h-12 w-12 items-center justify-center rounded-2xl ${
              sending || !input.trim() ? "bg-zinc-200" : "bg-[#0a7ea4] shadow-md shadow-[#0a7ea4]/30"
            }`}
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ArrowUp color="white" size={21} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}