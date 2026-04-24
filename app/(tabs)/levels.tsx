import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { AnimatedCard } from "@/components/animated-card";

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
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <View className="mb-2">
              <Text className="text-2xl font-bold text-foreground uppercase tracking-tighter">The Ascent</Text>
              <Text className="text-sm text-muted italic">"From Rookie to Elite. There is no middle ground."</Text>
            </View>
          </motion.div>

          {/* Level Cards */}
          {levelsQuery.isLoading ? (
            <ActivityIndicator />
          ) : (
            <motion.div
              className="gap-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {levels.map((level, idx) => (
                <motion.div
                  key={level.n}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  whileHover={!level.locked ? { scale: 1.02, x: 4 } : {}}
                  whileTap={!level.locked ? { scale: 0.98 } : {}}
                >
                  <TouchableOpacity
                    onPress={() => !level.locked && setSelectedLevel(level.n)}
                    className={`p-4 rounded-xl border-2 ${
                      selectedLevel === level.n
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface"
                    } ${level.locked ? "opacity-40" : ""}`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-3">
                        <motion.div
                          animate={
                            selectedLevel === level.n
                              ? { scale: [1, 1.1, 1] }
                              : { scale: 1 }
                          }
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{
                            backgroundColor:
                              level.locked ? colors.muted : colors.primary,
                          }}
                        >
                          <Text className="text-sm font-black text-white">{level.n}</Text>
                        </motion.div>
                        <View>
                          <Text className="text-base font-black text-foreground uppercase tracking-tight">
                            {level.name}
                          </Text>
                          <Text className="text-[10px] font-bold text-muted uppercase">
                            {level.locked ? "RESTRICTED" : "ACTIVE STATUS"}
                          </Text>
                        </View>
                      </View>
                      {level.locked && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Text className="text-lg">🔒</Text>
                        </motion.div>
                      )}
                    </View>

                    {/* XP Progress */}
                    {!level.locked && (
                      <motion.div
                        className="gap-1 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-[9px] font-bold text-muted uppercase">Elite XP</Text>
                          <Text className="text-[9px] font-bold text-foreground">
                            {level.xpCurrent} / {level.xpNeeded}
                          </Text>
                        </View>
                        <View className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(level.xpCurrent / level.xpNeeded) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </View>
                      </motion.div>
                    )}
                  </TouchableOpacity>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Selected Level Details */}
          <AnimatePresence mode="wait">
            {levels.length > 0 && selectedLevel && (
              <motion.div
                key={selectedLevel}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatedCard delay={0} variant="slideUp">
                  <View className="mt-2 p-5 bg-surface border border-border rounded-2xl gap-4 shadow-sm">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl font-black text-foreground uppercase tracking-tighter">
                        {levels[selectedLevel - 1]?.name}
                      </Text>
                      <View className="h-px flex-1 bg-border" />
                    </View>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Text className="text-sm text-foreground leading-relaxed font-medium">
                        {levels[selectedLevel - 1]?.desc}
                      </Text>
                    </motion.div>

                    {!levels[selectedLevel - 1]?.locked && (
                      <motion.div
                        className="gap-3 pt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Text className="text-xs font-black text-primary uppercase tracking-widest">
                          Active Drills
                        </Text>
                        <motion.div
                          className="gap-2"
                          initial="hidden"
                          animate="visible"
                          variants={{
                            hidden: { opacity: 0 },
                            visible: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.05,
                              },
                            },
                          }}
                        >
                          {(DRILL_PROMPTS[selectedLevel] ?? []).map((prompt, idx) => (
                            <motion.div
                              key={idx}
                              variants={{
                                hidden: { opacity: 0, x: -10 },
                                visible: { opacity: 1, x: 0 },
                              }}
                              whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                              className="p-4 bg-background border border-border rounded-xl"
                            >
                              <Text className="text-sm text-foreground font-medium leading-snug">
                                "{prompt}"
                              </Text>
                            </motion.div>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}

                    {levels[selectedLevel - 1]?.locked && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-muted/10 rounded-xl items-center"
                      >
                        <Text className="text-xs font-bold text-muted uppercase">
                          Increase your APEX Score to unlock
                        </Text>
                      </motion.div>
                    )}
                  </View>
                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
