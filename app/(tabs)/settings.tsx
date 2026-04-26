import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import { motion } from "framer-motion";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { AnimatedCard } from "@/components/animated-card";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const profileQuery = trpc.user.profile.useQuery();
  const user = profileQuery.data as any;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      Alert.alert("Logout Failed", "Please try again.");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <View className="mb-2">
              <Text className="text-2xl font-bold text-foreground uppercase tracking-tighter">Command Center</Text>
              <Text className="text-sm text-muted italic">"Control your frame. Control your future."</Text>
            </View>
          </motion.div>

          {/* Profile Section */}
          <AnimatedCard delay={0.1} variant="slideUp">
            <View className="bg-surface border border-border rounded-2xl p-6 gap-4">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-primary items-center justify-center">
                  <Text className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0) || "F"}
                  </Text>
                </View>
                <View>
                  <Text className="text-xl font-black text-foreground uppercase tracking-tight">
                    {user?.name || "Founder"}
                  </Text>
                  <Text className="text-xs font-bold text-muted uppercase tracking-widest">
                    {user?.role || "Elite Member"}
                  </Text>
                </View>
              </View>
              
              <View className="h-px bg-border" />
              
              <View className="gap-2">
                <Text className="text-[10px] font-bold text-muted uppercase tracking-widest">Account Email</Text>
                <Text className="text-sm text-foreground font-medium">{user?.email || "founder@apex.ai"}</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Preferences */}
          <AnimatedCard delay={0.2} variant="slideUp">
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">Preferences</Text>
              {[
                { label: "Voice Feedback", value: "Enabled", icon: "🎙️" },
                { label: "Dark Mode", value: "System", icon: "🌙" },
                { label: "Notifications", value: "Critical Only", icon: "🔔" },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  className="p-4 bg-surface border border-border rounded-xl flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg">{item.icon}</Text>
                    <Text className="text-sm font-bold text-foreground uppercase tracking-tight">{item.label}</Text>
                  </View>
                  <Text className="text-xs font-bold text-primary uppercase">{item.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          {/* Support & Legal */}
          <AnimatedCard delay={0.3} variant="slideUp">
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">Support</Text>
              {[
                { label: "Help Center", icon: "❓" },
                { label: "Privacy Policy", icon: "🛡️" },
                { label: "Terms of Service", icon: "📜" },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  className="p-4 bg-surface border border-border rounded-xl flex-row items-center gap-3"
                >
                  <Text className="text-lg">{item.icon}</Text>
                  <Text className="text-sm font-bold text-foreground uppercase tracking-tight">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          {/* Logout */}
          <AnimatedCard delay={0.4} variant="slideUp">
            <TouchableOpacity
              onPress={handleLogout}
              className="p-4 bg-error/10 border border-error/20 rounded-xl items-center"
            >
              <Text className="text-error font-black uppercase tracking-widest">Terminate Session</Text>
            </TouchableOpacity>
          </AnimatedCard>

          <View className="items-center py-6">
            <Text className="text-[10px] font-bold text-muted uppercase tracking-widest">APEX v1.0.0 Pro Max</Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
