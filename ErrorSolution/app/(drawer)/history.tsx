import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ChevronRight, Clock3, History as HistoryIcon } from "lucide-react-native";
import { apiRequest } from "../../utils/api";

interface History {
  id: string;
  title: string;
  created_at: string;
  preview?: string | null;
  last_message_at?: string | null;
}

function displayPreview(preview?: string | null) {
  if (!preview) return "No messages yet";
  try {
    const results = JSON.parse(preview) as { fix?: string }[];
    if (Array.isArray(results)) return results[0]?.fix ?? "Related solutions";
  } catch {
    return preview;
  }
  return preview;
}

export default function HistoryScreen() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [histories, setHistories] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchHistories = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getToken();
        const data = await apiRequest<History[]>("/chats", token);
        if (active) setHistories(data);
      } catch (loadError) {
        if (active)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load conversations.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchHistories();
    return () => {
      active = false;
    };
  }, [getToken, retryCount]);

  return (
    <SafeAreaView className="flex-1 bg-white px-5" edges={["bottom"]}>
      {/* Header Section */}
      <View className="py-6">
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#0a7ea4]/10 border border-[#0a7ea4]/20 mb-3">
          <HistoryIcon size={22} color="#0a7ea4" />
        </View>
        <Text className="text-2xl font-bold text-zinc-900 tracking-tight">History</Text>
        <Text className="mt-1 text-sm text-zinc-500">Your previous conversations and solutions</Text>
      </View>

      <FlatList
        data={histories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator className="mt-12" color="#0a7ea4" size="large" />
          ) : error ? (
            <TouchableOpacity
              onPress={() => setRetryCount((count) => count + 1)}
              className="mt-12 items-center bg-red-50 border border-red-200 rounded-2xl p-6"
            >
              <Text className="text-center text-red-600 font-medium">{error}</Text>
              <Text className="mt-2 font-bold text-zinc-900">
                Tap to retry
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-16 items-center justify-center px-4">
              <View className="h-16 w-16 rounded-full bg-zinc-100 items-center justify-center mb-3">
                <Clock3 size={28} color="#a1a1aa" />
              </View>
              <Text className="text-base font-semibold text-zinc-800">No conversations yet</Text>
              <Text className="mt-1 text-sm text-zinc-500 text-center">
                Your past error searches will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            className="mb-3 flex-row items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 active:bg-zinc-100 transition-all shadow-sm"
            onPress={() => router.replace(`/(drawer)/chat/${item.id}`)}
          >
            <View className="mr-3.5 h-11 w-11 items-center justify-center rounded-xl bg-[#0a7ea4]/10 border border-[#0a7ea4]/20">
              <Clock3 size={20} color="#0a7ea4" />
            </View>
            <View className="flex-1 mr-2">
              <Text numberOfLines={1} className="font-bold text-zinc-900 text-base">
                {item.title}
              </Text>
              <Text numberOfLines={1} className="mt-1 text-sm text-zinc-600 font-medium">
                {displayPreview(item.preview)}
              </Text>
              <Text className="mt-1.5 text-xs text-zinc-400 font-medium">
                {new Date(
                  item.last_message_at ?? item.created_at,
                ).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <ChevronRight size={18} color="#a1a1aa" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}