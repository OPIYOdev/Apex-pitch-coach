import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function ArenaScreen() {
  const colors = useColors();
  const [pitchText, setPitchText] = useState("");

  // Live data from the server
  const profileQuery = trpc.user.profile.useQuery();
  const analyzeMutation = trpc.pitch.analyze.useMutation({
    onSuccess: () => {
      // Refresh token balance after a successful analysis
      profileQuery.refetch();
      setPitchText("");
    },
    onError: (err) => {
      Alert.alert("Analysis Failed", err.message);
    },
  });

  const tokens = profileQuery.data?.tokens ?? 0;
  const levelName = profileQuery.data?.levelName ?? "Rookie";
  const level = profileQuery.data?.level ?? 1;
  const feedback = analyzeMutation.data?.feedback ?? null;
  const loading = analyzeMutation.isPending;

  const analyzePitch = () => {
    if (!pitchText.trim()) {
      Alert.alert("Empty Pitch", "Please enter a pitch before analysing.");
      return;
    }
    analyzeMutation.mutate({ pitchText });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-foreground">APEX Arena</Text>
              <Text className="text-sm text-muted italic">
                "Stop pitching. Start closing."
              </Text>
            </View>
            <View className="bg-primary px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">
                {profileQuery.isLoading ? "…" : `${tokens} tokens`}
              </Text>
            </View>
          </View>

          {/* Value Proposition */}
          <View className="bg-surface border border-border rounded-lg p-4 mb-2">
            <Text className="text-sm font-bold text-primary mb-1">THE APEX EDGE</Text>
            <Text className="text-xs text-muted leading-relaxed">
              APEX isn't just an AI. It's a high-stakes simulator built on the frameworks of 
              Oren Klaff, Chris Voss, and Y-Combinator. We don't just fix your grammar; 
              we fix your frame.
            </Text>
          </View>

          {/* Pitch Input */}
          <View className="gap-2">
            <View className="flex-row justify-between items-end">
              <Text className="text-sm font-semibold text-foreground">The Pitch Lab</Text>
              <Text className="text-xs text-muted">Level {level}: {levelName}</Text>
            </View>
            <TextInput
              value={pitchText}
              onChangeText={setPitchText}
              placeholder="Paste your script or outline here..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={6}
              className="w-full border border-border rounded-lg p-4 text-foreground bg-surface"
              style={{ minHeight: 120 }}
              editable={!loading}
            />
            <Text className="text-xs text-muted text-right">{pitchText.length} characters</Text>
          </View>

          {/* Voice Integration Options */}
          <View className="flex-row gap-2">
            <View className="flex-1 bg-surface border border-border rounded-lg p-3 items-center">
              <Text className="text-xl mb-1">🎙️</Text>
              <Text className="text-[10px] font-bold text-foreground text-center">VOICE-TO-TEXT</Text>
              <Text className="text-[9px] text-muted text-center mt-1">Dictate your pitch</Text>
            </View>
            <View className="flex-1 bg-surface border border-border rounded-lg p-3 items-center">
              <Text className="text-xl mb-1">🎭</Text>
              <Text className="text-[10px] font-bold text-foreground text-center">ROLEPLAY</Text>
              <Text className="text-[9px] text-muted text-center mt-1">Live AI feedback</Text>
            </View>
            <View className="flex-1 bg-surface border border-border rounded-lg p-3 items-center">
              <Text className="text-xl mb-1">📈</Text>
              <Text className="text-[10px] font-bold text-foreground text-center">TONE ANALYSER</Text>
              <Text className="text-[9px] text-muted text-center mt-1">Emotion mapping</Text>
            </View>
          </View>

          {/* Analyse Button */}
          <TouchableOpacity
            onPress={analyzePitch}
            disabled={loading || pitchText.trim().length === 0}
            className={`py-4 px-6 rounded-lg items-center ${
              loading || pitchText.trim().length === 0
                ? "bg-muted opacity-50"
                : "bg-primary"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                RUN SIMULATION (5 tokens)
              </Text>
            )}
          </TouchableOpacity>

          {/* Feedback Display */}
          {feedback && (
            <View className="bg-surface border border-border rounded-lg p-4 gap-4">
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">The Verdict</Text>
                <Text className="text-base text-foreground italic leading-relaxed">"{feedback.verdict}"</Text>
              </View>

              {/* APEX Scoring System */}
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">APEX Metrics</Text>
                <View className="gap-2">
                  {Object.entries(feedback.scores).map(([key, value]: [string, any]) => (
                    <View key={key} className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground capitalize">{key}</Text>
                        <Text className="text-[9px] text-muted">
                          {key === 'frame' ? 'Status & Authority' : 
                           key === 'hook' ? 'The First 30 Seconds' :
                           key === 'logic' ? 'The Business Case' :
                           key === 'urgency' ? 'The Cost of Inaction' : 'Metric'}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <View className="w-20 h-2 bg-border rounded-full overflow-hidden">
                          <View
                            className="h-full bg-primary"
                            style={{ width: `${(value / 10) * 100}%` }}
                          />
                        </View>
                        <Text className="text-sm font-bold text-foreground w-8">
                          {value}/10
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Overall Score */}
              <View className="items-center py-4 border-y border-border my-2">
                <Text className="text-xs font-bold text-muted mb-2 uppercase tracking-widest">APEX SCORE</Text>
                <View
                  className="w-24 h-24 rounded-full items-center justify-center border-4 border-primary"
                  style={{ backgroundColor: colors.primary + '10' }}
                >
                  <View className="items-center">
                    <Text className="text-4xl font-black text-primary">
                      {feedback.overallScore}
                    </Text>
                    <Text className="text-[10px] font-bold text-muted">ELITE INDEX</Text>
                  </View>
                </View>
              </View>

              {/* Drill */}
              <View className="gap-2 bg-primary bg-opacity-10 p-4 rounded-lg border-l-4 border-primary">
                <Text className="text-sm font-bold text-primary uppercase">THE DRILL</Text>
                <Text className="text-sm text-foreground leading-relaxed">{feedback.drill}</Text>
              </View>

              {/* Rewrite */}
              <View className="gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                <Text className="text-sm font-bold text-yellow-700 dark:text-yellow-300 uppercase">
                  ELITE REWRITE
                </Text>
                <Text className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed italic">
                  "{feedback.rewrite}"
                </Text>
              </View>

              {/* Next Level */}
              <View className="gap-2 bg-success bg-opacity-10 p-4 rounded-lg border-l-4 border-success">
                <Text className="text-sm font-bold text-success uppercase">THE JOURNEY</Text>
                <Text className="text-sm text-foreground leading-relaxed">{feedback.nextLevel}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
