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
            <Text className="text-2xl font-bold text-foreground uppercase tracking-tighter">The Ascent</Text>
            <Text className="text-sm text-muted italic">"From Rookie to Elite. There is no middle ground."</Text>
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
                  className={`p-4 rounded-xl border-2 ${
                    selectedLevel === level.n
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface"
                  } ${level.locked ? "opacity-40" : ""}`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: level.locked ? colors.muted : colors.primary,
                        }}
                      >
                        <Text className="text-sm font-black text-white">{level.n}</Text>
                      </View>
                      <View>
                        <Text className="text-base font-black text-foreground uppercase tracking-tight">{level.name}</Text>
                        <Text className="text-[10px] font-bold text-muted uppercase">
                          {level.locked ? "RESTRICTED" : "ACTIVE STATUS"}
                        </Text>
                      </View>
                    </View>
                    {level.locked && <Text className="text-lg">🔒</Text>}
                  </View>

                  {/* XP Progress */}
                  {!level.locked && (
                    <View className="gap-1 mt-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[9px] font-bold text-muted uppercase">ELITE XP</Text>
                        <Text className="text-[9px] font-bold text-foreground">
                          {level.xpCurrent} / {level.xpNeeded}
                        </Text>
                      </View>
                      <View className="w-full h-1.5 bg-border rounded-full overflow-hidden">
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
            <View className="mt-2 p-5 bg-surface border border-border rounded-2xl gap-4 shadow-sm">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-black text-foreground uppercase tracking-tighter">
                  {levels[selectedLevel - 1]?.name}
                </Text>
                <View className="h-px flex-1 bg-border" />
              </View>
              
              <Text className="text-sm text-foreground leading-relaxed font-medium">
                {levels[selectedLevel - 1]?.desc}
              </Text>

              {!levels[selectedLevel - 1]?.locked && (
                <View className="gap-3 pt-2">
                  <Text className="text-xs font-black text-primary uppercase tracking-widest">ACTIVE DRILLS</Text>
                  <View className="gap-2">
                    {(DRILL_PROMPTS[selectedLevel] ?? []).map((prompt, idx) => (
                      <View
                        key={idx}
                        className="p-4 bg-background border border-border rounded-xl"
                      >
                        <Text className="text-sm text-foreground font-medium leading-snug">"{prompt}"</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {levels[selectedLevel - 1]?.locked && (
                <View className="p-4 bg-muted/10 rounded-xl items-center">
                  <Text className="text-xs font-bold text-muted uppercase">Increase your APEX Score to unlock</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
