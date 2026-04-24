import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

const DRILL_PROMPTS: Record<number, string[]> = {
  1: [
    "Explain what your startup does in 3 sentences",
    "Pitch your idea to a complete stranger at a coffee shop",
    "Describe the problem you're solving and who it hurts",
  ],
  2: [
    "Tell a 30-second story about a real customer's pain",
    "Pitch without using the word 'solution'",
    "Describe your market in one vivid sentence",
  ],
  3: [
    "Handle the objection: 'The market is too small'",
    "Pitch in under 60 seconds with a strong CTA",
    "Explain your traction in three numbers",
  ],
  4: [
    "Pitch to a room of 20 investors — no slides",
    "Answer: 'Why you?' in 30 seconds",
    "Close the room with a specific ask",
  ],
  5: [
    "Deliver a pitch so clear they repeat it back",
    "Handle any objection cold, in real time",
    "Inspire a stranger to become a customer in 2 minutes",
  ],
};

export default function LevelsScreen() {
  const colors = useColors();
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Live level progression from the server
  const levelsQuery = trpc.user.levels.useQuery();
  const levels = levelsQuery.data ?? [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <View className="mb-2">
            <Text className="text-2xl font-bold text-foreground">Skill Progression</Text>
            <Text className="text-sm text-muted">Master pitch coaching through 5 levels</Text>
          </View>

          {/* Level Cards */}
          {levelsQuery.isLoading ? (
            <ActivityIndicator />
          ) : (
            <View className="gap-3">
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.n}
                  onPress={() => setSelectedLevel(level.n)}
                  className={`p-4 rounded-lg border-2 ${
                    selectedLevel === level.n
                      ? "border-primary bg-primary bg-opacity-10"
                      : "border-border bg-surface"
                  } ${level.locked ? "opacity-60" : ""}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: level.locked ? colors.muted : colors.primary,
                          opacity: level.locked ? 0.5 : 1,
                        }}
                      >
                        <Text className="text-lg font-bold text-white">{level.n}</Text>
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-foreground">{level.name}</Text>
                        <Text className="text-xs text-muted">
                          {level.locked ? "Locked" : "Unlocked"}
                        </Text>
                      </View>
                    </View>
                    {level.locked && <Text className="text-lg">🔒</Text>}
                  </View>

                  {/* XP Progress */}
                  {!level.locked && (
                    <View className="gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-muted">XP Progress</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {level.xpCurrent} / {level.xpNeeded}
                        </Text>
                      </View>
                      <View className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary"
                          style={{
                            width: `${(level.xpCurrent / level.xpNeeded) * 100}%`,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Level Details */}
          {levels.length > 0 && selectedLevel && (
            <View className="mt-4 p-4 bg-surface border border-border rounded-lg gap-3">
              <Text className="text-lg font-bold text-foreground">
                {levels[selectedLevel - 1]?.name} Details
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {levels[selectedLevel - 1]?.desc}
              </Text>
              {!levels[selectedLevel - 1]?.locked && (
                <View className="gap-2 pt-2">
                  <Text className="text-sm font-semibold text-foreground">Drill Prompts</Text>
                  <View className="gap-2">
                    {(DRILL_PROMPTS[selectedLevel] ?? []).map((prompt, idx) => (
                      <TouchableOpacity
                        key={idx}
                        className="p-3 bg-primary bg-opacity-10 rounded-lg"
                      >
                        <Text className="text-sm text-foreground">{prompt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
