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
import { motion, AnimatePresence } from "framer-motion";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { AnimatedCard } from "@/components/animated-card";
import { ScoreRing } from "@/components/score-ring";
import { Badge } from "@/components/badge";
import { ProgressBar } from "@/components/progress-bar";

export default function ArenaScreen() {
  const colors = useColors();
  const [pitchText, setPitchText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  // Live data from the server
  const profileQuery = trpc.user.profile.useQuery();
  const analyzeMutation = trpc.pitch.analyze.useMutation({
    onSuccess: () => {
      profileQuery.refetch();
      setShowFeedback(true);
      setTimeout(() => setPitchText(""), 500);
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
          {/* Header with animation */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-2xl font-bold text-foreground">APEX Arena</Text>
                <Text className="text-sm text-muted italic">
                  "Stop pitching. Start closing."
                </Text>
              </View>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <View className="bg-primary px-4 py-2 rounded-full">
                  <Text className="text-white font-semibold">
                    {profileQuery.isLoading ? "…" : `${tokens} tokens`}
                  </Text>
                </View>
              </motion.div>
            </View>
          </motion.div>

          {/* Value Proposition Card */}
          <AnimatedCard delay={0.1} variant="slideUp">
            <View className="bg-surface border border-border rounded-lg p-4 mb-2">
              <Text className="text-sm font-bold text-primary mb-1">THE APEX EDGE</Text>
              <Text className="text-xs text-muted leading-relaxed">
                APEX isn't just an AI. It's a high-stakes simulator built on the frameworks of 
                Oren Klaff, Chris Voss, and Y-Combinator. We don't just fix your grammar; 
                we fix your frame.
              </Text>
            </View>
          </AnimatedCard>

          {/* Pitch Input */}
          <AnimatedCard delay={0.2} variant="slideUp">
            <View className="gap-2">
              <View className="flex-row justify-between items-end">
                <Text className="text-sm font-semibold text-foreground">The Pitch Lab</Text>
                <Text className="text-xs text-muted">Level {level}: {levelName}</Text>
              </View>
              <motion.div
                animate={{ borderColor: pitchText.length > 0 ? "#3b82f6" : "#e5e7eb" }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
              <motion.div
                animate={{ opacity: pitchText.length > 0 ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Text className="text-xs text-muted text-right">{pitchText.length} characters</Text>
              </motion.div>
            </View>
          </AnimatedCard>

          {/* Voice Integration Options */}
          <AnimatedCard delay={0.3} variant="slideUp">
            <motion.div
              className="flex-row gap-2"
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
            >
              {[
                { icon: "🎙️", label: "VOICE-TO-TEXT", desc: "Dictate your pitch" },
                { icon: "🎭", label: "ROLEPLAY", desc: "Live AI feedback" },
                { icon: "📈", label: "TONE ANALYSER", desc: "Emotion mapping" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <View className="bg-surface border border-border rounded-lg p-3 items-center">
                    <Text className="text-xl mb-1">{item.icon}</Text>
                    <Text className="text-[10px] font-bold text-foreground text-center">{item.label}</Text>
                    <Text className="text-[9px] text-muted text-center mt-1">{item.desc}</Text>
                  </View>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedCard>

          {/* Analyse Button */}
          <AnimatedCard delay={0.4} variant="slideUp">
            <motion.div
              whileHover={!loading && pitchText.trim().length > 0 ? { scale: 1.02 } : {}}
              whileTap={!loading && pitchText.trim().length > 0 ? { scale: 0.98 } : {}}
            >
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
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <ActivityIndicator color="#fff" />
                  </motion.div>
                ) : (
                  <Text className="text-white font-bold text-lg">
                    RUN SIMULATION (5 tokens)
                  </Text>
                )}
              </TouchableOpacity>
            </motion.div>
          </AnimatedCard>

          {/* Feedback Display */}
          <AnimatePresence>
            {feedback && showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.6, type: "spring" }}
              >
                <View className="bg-surface border border-border rounded-lg p-4 gap-4">
                  {/* Verdict */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <View className="gap-2">
                      <Text className="text-lg font-bold text-foreground">The Verdict</Text>
                      <Text className="text-base text-foreground italic leading-relaxed">"{feedback.verdict}"</Text>
                    </View>
                  </motion.div>

                  {/* APEX Scoring System */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <View className="gap-2">
                      <Text className="text-lg font-bold text-foreground">APEX Metrics</Text>
                      <View className="gap-2">
                        {Object.entries(feedback.scores).map(([key, value]: [string, any], idx) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                          >
                            <View className="flex-row items-center justify-between gap-2">
                              <View className="flex-1">
                                <Text className="text-xs font-bold text-foreground capitalize">{key}</Text>
                              </View>
                              <View className="flex-row items-center gap-2 flex-1">
                                <motion.div
                                  className="flex-1 h-2 bg-border rounded-full overflow-hidden"
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ delay: 0.3 + idx * 0.05, duration: 0.5 }}
                                >
                                  <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(value / 10) * 100}%` }}
                                    transition={{ delay: 0.4 + idx * 0.05, duration: 0.6 }}
                                  />
                                </motion.div>
                                <Text className="text-sm font-bold text-foreground w-8">
                                  {value}/10
                                </Text>
                              </View>
                            </View>
                          </motion.div>
                        ))}
                      </View>
                    </View>
                  </motion.div>

                  {/* Overall Score */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="items-center py-4 border-y border-border my-2"
                  >
                    <ScoreRing score={feedback.overallScore} />
                  </motion.div>

                  {/* Drill */}
                  <AnimatedCard delay={0.5} variant="slideUp">
                    <View className="gap-2 bg-primary bg-opacity-10 p-4 rounded-lg border-l-4 border-primary">
                      <Text className="text-sm font-bold text-primary uppercase">The Drill</Text>
                      <Text className="text-sm text-foreground leading-relaxed">{feedback.drill}</Text>
                    </View>
                  </AnimatedCard>

                  {/* Rewrite */}
                  <AnimatedCard delay={0.6} variant="slideUp">
                    <View className="gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                      <Text className="text-sm font-bold text-yellow-700 dark:text-yellow-300 uppercase">
                        Elite Rewrite
                      </Text>
                      <Text className="text-sm text-yellow-900 dark:text-yellow-100 leading-relaxed italic">
                        "{feedback.rewrite}"
                      </Text>
                    </View>
                  </AnimatedCard>

                  {/* Next Level */}
                  <AnimatedCard delay={0.7} variant="slideUp">
                    <View className="gap-2 bg-success bg-opacity-10 p-4 rounded-lg border-l-4 border-success">
                      <Text className="text-sm font-bold text-success uppercase">The Journey</Text>
                      <Text className="text-sm text-foreground leading-relaxed">{feedback.nextLevel}</Text>
                    </View>
                  </AnimatedCard>
                </View>
              </motion.div>
            )}
          </AnimatePresence>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
