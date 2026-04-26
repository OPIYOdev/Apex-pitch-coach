import { motion } from "framer-motion";
import { View, Text } from "react-native";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  unit,
  trend = "neutral",
  delay = 0,
}) => {
  const trendColor = {
    up: "#10b981",
    down: "#ef4444",
    neutral: "#6b7280",
  }[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="flex-1"
    >
      <View className="bg-surface border border-border rounded-2xl p-4 gap-2 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text style={{ fontSize: 24 }}>{icon}</Text>
          {trend !== "neutral" && (
            <Text style={{ color: trendColor, fontSize: 12, fontWeight: "bold" }}>
              {trend === "up" ? "↑" : "↓"}
            </Text>
          )}
        </View>
        
        <View className="gap-1">
          <Text className="text-[10px] font-bold text-muted uppercase tracking-widest">
            {label}
          </Text>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.2, type: "spring" }}
          >
            <View className="flex-row items-baseline gap-1">
              <Text className="text-2xl font-black text-foreground">
                {value}
              </Text>
              {unit && (
                <Text className="text-xs font-bold text-muted">
                  {unit}
                </Text>
              )}
            </View>
          </motion.div>
        </View>
      </View>
    </motion.div>
  );
};
