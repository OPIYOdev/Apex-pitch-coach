import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const LEVELS = [
  {
    n: 1,
    name: "Rookie",
    xpNeeded: 0,
    xpCurrent: 45,
    desc: "You freeze up, mumble, or ramble. Goal: one clear sentence.",
  },
  {
    n: 2,
    name: "Contender",
    xpNeeded: 100,
    xpCurrent: 0,
    desc: "You can explain your idea. Goal: hook them in 10 seconds.",
    locked: true,
  },
  {
    n: 3,
    name: "Pitcher",
    xpNeeded: 250,
    xpCurrent: 0,
    desc: "You've got structure. Goal: make them feel the pain.",
    locked: true,
  },
  {
    n: 4,
    name: "Closer",
    xpNeeded: 500,
    xpCurrent: 0,
    desc: "You can pitch. Goal: end with irresistible ask.",
    locked: true,
  },
  {
    n: 5,
    name: "Elite",
    xpNeeded: 900,
    xpCurrent: 0,
    desc: "You command the room. Goal: they repeat your pitch.",
    locked: true,
  },
];

export default function LevelsScreen() {
  const colors = useColors();
  const [selectedLevel, setSelectedLevel] = useState(1);

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
          <View className="gap-3">
            {LEVELS.map((level) => (
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

          {/* Selected Level Details */}
          {selectedLevel && (
            <View className="mt-4 p-4 bg-surface border border-border rounded-lg gap-3">
              <Text className="text-lg font-bold text-foreground">
                {LEVELS[selectedLevel - 1].name} Details
              </Text>
              <Text className="text-sm text-foreground leading-relaxed">
                {LEVELS[selectedLevel - 1].desc}
              </Text>

              {!LEVELS[selectedLevel - 1].locked && (
                <View className="gap-2 pt-2">
                  <Text className="text-sm font-semibold text-foreground">Drill Prompts</Text>
                  <View className="gap-2">
                    <TouchableOpacity className="p-3 bg-primary bg-opacity-10 rounded-lg">
                      <Text className="text-sm text-foreground">
                        "Explain what your startup does in 3 sentences"
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-3 bg-primary bg-opacity-10 rounded-lg">
                      <Text className="text-sm text-foreground">
                        "Pitch your idea to a complete stranger at a coffee shop"
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-3 bg-primary bg-opacity-10 rounded-lg">
                      <Text className="text-sm text-foreground">
                        "Describe the problem you're solving and who it hurts"
                      </Text>
                    </TouchableOpacity>
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
