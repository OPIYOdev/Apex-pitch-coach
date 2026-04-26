import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenContainer } from "@/components/screen-container";
import { AnimatedCard } from "@/components/animated-card";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to APEX",
    description: "The high-stakes simulator where founders become elite closers. We don't fix grammar; we fix your frame.",
    icon: "🦅",
  },
  {
    title: "The APEX Index",
    description: "Every pitch is measured against the pillars of Frame, Hook, Logic, and Urgency. Reach the Elite level to dominate any room.",
    icon: "📈",
  },
  {
    title: "Real-Time Coaching",
    description: "Powered by the frameworks of Oren Klaff and Chris Voss. Get brutal, actionable feedback in seconds.",
    icon: "🎙️",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const profileQuery = trpc.user.profile.useQuery();
  const user = profileQuery.data;

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await AsyncStorage.getItem("apex_onboarding_completed");
      setShowOnboarding(completed !== "true");
    };
    checkOnboarding();
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem("apex_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  if (showOnboarding === null) return null;

  if (showOnboarding) {
    return <OnboardingFlow steps={ONBOARDING_STEPS} onComplete={completeOnboarding} />;
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <View className="bg-primary p-8 rounded-3xl items-center gap-4 shadow-xl overflow-hidden">
              <View className="absolute top-0 right-0 opacity-10">
                <Text style={{ fontSize: 120 }}>🦅</Text>
              </View>
              <Text className="text-white text-xs font-black uppercase tracking-widest opacity-80">
                Founder Status: {user?.levelName || "Rookie"}
              </Text>
              <Text className="text-white text-4xl font-black text-center uppercase tracking-tighter">
                Master Your Frame
              </Text>
              <TouchableOpacity 
                onPress={() => router.push("/arena")}
                className="bg-white px-8 py-4 rounded-2xl shadow-lg active:scale-95"
              >
                <Text className="text-primary font-black uppercase tracking-widest">Enter Arena</Text>
              </TouchableOpacity>
            </View>
          </motion.div>

          {/* Quick Stats */}
          <View className="flex-row gap-4">
            <AnimatedCard delay={0.1} variant="slideUp" className="flex-1">
              <View className="bg-surface border border-border p-4 rounded-2xl items-center gap-1">
                <Text className="text-2xl font-black text-foreground">{user?.tokens || 0}</Text>
                <Text className="text-[10px] font-bold text-muted uppercase">Tokens</Text>
              </View>
            </AnimatedCard>
            <AnimatedCard delay={0.2} variant="slideUp" className="flex-1">
              <View className="bg-surface border border-border p-4 rounded-2xl items-center gap-1">
                <Text className="text-2xl font-black text-foreground">{user?.xp || 0}</Text>
                <Text className="text-[10px] font-bold text-muted uppercase">Elite XP</Text>
              </View>
            </AnimatedCard>
            <AnimatedCard delay={0.3} variant="slideUp" className="flex-1">
              <View className="bg-surface border border-border p-4 rounded-2xl items-center gap-1">
                <Text className="text-2xl font-black text-foreground">{user?.level || 1}</Text>
                <Text className="text-[10px] font-bold text-muted uppercase">Level</Text>
              </View>
            </AnimatedCard>
          </View>

          {/* Modules Grid */}
          <View className="gap-4">
            <Text className="text-lg font-black text-foreground uppercase tracking-tight">Core Modules</Text>
            <View className="gap-3">
              {[
                { title: "Pitch Arena", desc: "High-stakes simulation & analysis", icon: "🎤", route: "/arena" },
                { title: "The Ascent", desc: "Track your path to elite status", icon: "📈", route: "/levels" },
                { title: "Token Vault", desc: "Fuel your pitch simulations", icon: "💎", route: "/tokens" },
              ].map((module, idx) => (
                <AnimatedCard key={idx} delay={0.4 + idx * 0.1} variant="slideUp">
                  <TouchableOpacity 
                    onPress={() => router.push(module.route as any)}
                    className="bg-surface border border-border p-5 rounded-2xl flex-row items-center gap-4"
                  >
                    <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center">
                      <Text style={{ fontSize: 24 }}>{module.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-black text-foreground uppercase tracking-tight">{module.title}</Text>
                      <Text className="text-xs text-muted">{module.desc}</Text>
                    </View>
                    <Text className="text-muted">→</Text>
                  </TouchableOpacity>
                </AnimatedCard>
              ))}
            </View>
          </View>

          {/* Daily Drill */}
          <AnimatedCard delay={0.7} variant="slideUp">
            <View className="bg-surface border border-border p-6 rounded-3xl gap-3 border-l-8 border-l-primary">
              <Text className="text-primary text-xs font-black uppercase tracking-widest">Daily Drill</Text>
              <Text className="text-foreground text-lg font-bold leading-tight">
                "Explain your startup's 'Hook' in under 15 seconds without using the word 'revolutionary'."
              </Text>
              <TouchableOpacity 
                onPress={() => router.push("/arena")}
                className="mt-2"
              >
                <Text className="text-primary font-bold text-sm">Start Drill →</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          <View className="h-8" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
