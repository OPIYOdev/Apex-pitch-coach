import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ArenaScreen() {
  const colors = useColors();
  const [pitchText, setPitchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(50); // Mock token balance
  const [feedback, setFeedback] = useState<any>(null);

  const analyzePitch = async () => {
    if (!pitchText.trim()) {
      alert("Please enter a pitch");
      return;
    }

    if (tokens < 5) {
      alert("Insufficient tokens. Need 5 tokens to analyze.");
      return;
    }

    setLoading(true);
    try {
      // Mock Grok API call - replace with real API when credentials are available
      const mockFeedback = {
        verdict: "Strong opening, but needs more emotional resonance.",
        landed: "Clear problem statement and specific market focus.",
        killed: "Weak call-to-action, no urgency created.",
        scores: {
          hook: 7,
          clarity: 8,
          pain: 6,
          solutionFit: 7,
          credibility: 6,
          callToAction: 5,
        },
        overallScore: 6.5,
        drill: "Practice opening with a 10-second story about a real customer's pain point.",
        rewrite: "Instead of 'We solve invoicing problems,' try: 'Every day, freelancers waste 2 hours chasing payments. We cut that to 30 seconds.'",
        nextLevel: "Move from explaining your solution to showing its impact through customer stories.",
      };

      setFeedback(mockFeedback);
      setTokens(tokens - 5);
      setPitchText("");
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to analyze pitch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-foreground">APEX Arena</Text>
              <Text className="text-sm text-muted">Level 1 • Rookie</Text>
            </View>
            <View className="bg-primary px-4 py-2 rounded-full">
              <Text className="text-white font-semibold">{tokens} tokens</Text>
            </View>
          </View>

          {/* Pitch Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Your Pitch</Text>
            <TextInput
              value={pitchText}
              onChangeText={setPitchText}
              placeholder="Enter your pitch here... (or use voice input below)"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={6}
              className="w-full border border-border rounded-lg p-4 text-foreground bg-surface"
              editable={!loading}
            />
            <Text className="text-xs text-muted text-right">{pitchText.length} characters</Text>
          </View>

          {/* Voice Input Placeholder */}
          <View className="bg-surface border border-border rounded-lg p-4 items-center gap-3">
            <Text className="text-3xl">🎤</Text>
            <Text className="text-sm text-foreground font-semibold">Voice Input</Text>
            <Text className="text-xs text-muted text-center">
              Tap the microphone button to record your pitch (coming soon with Grok API)
            </Text>
            <TouchableOpacity
              disabled
              className="bg-primary px-6 py-2 rounded-lg opacity-50"
            >
              <Text className="text-white font-semibold text-sm">Record Pitch</Text>
            </TouchableOpacity>
          </View>

          {/* Analyze Button */}
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
              <Text className="text-white font-bold text-lg">Analyze Pitch (5 tokens)</Text>
            )}
          </TouchableOpacity>

          {/* Feedback Display */}
          {feedback && (
            <View className="bg-surface border border-border rounded-lg p-4 gap-4">
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">Verdict</Text>
                <Text className="text-base text-foreground italic">{feedback.verdict}</Text>
              </View>

              {/* Scores */}
              <View className="gap-2">
                <Text className="text-lg font-bold text-foreground">Scores</Text>
                <View className="gap-2">
                  {Object.entries(feedback.scores).map(([key, value]: [string, any]) => (
                    <View key={key} className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground capitalize">{key}</Text>
                      <View className="flex-row items-center gap-2">
                        <View className="w-20 h-2 bg-border rounded-full overflow-hidden">
                          <View
                            className="h-full bg-primary"
                            style={{ width: `${(value / 10) * 100}%` }}
                          />
                        </View>
                        <Text className="text-sm font-bold text-foreground w-8">{value}/10</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Overall Score Ring */}
              <View className="items-center py-4">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary, opacity: 0.1 }}
                >
                  <View className="items-center">
                    <Text className="text-3xl font-bold text-primary">
                      {feedback.overallScore}
                    </Text>
                    <Text className="text-xs text-muted">/10</Text>
                  </View>
                </View>
              </View>

              {/* Drill */}
              <View className="gap-2 bg-primary bg-opacity-10 p-3 rounded-lg">
                <Text className="text-sm font-bold text-primary">Your Drill</Text>
                <Text className="text-sm text-foreground">{feedback.drill}</Text>
              </View>

              {/* Rewrite */}
              <View className="gap-2 bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Text className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                  Elite Rewrite
                </Text>
                <Text className="text-sm text-yellow-900 dark:text-yellow-100">{feedback.rewrite}</Text>
              </View>

              {/* Next Level */}
              <View className="gap-2 bg-success bg-opacity-10 p-3 rounded-lg">
                <Text className="text-sm font-bold text-success">Next Level</Text>
                <Text className="text-sm text-foreground">{feedback.nextLevel}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
