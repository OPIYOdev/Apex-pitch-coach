import { motion } from "framer-motion";
import { View, Text } from "react-native";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = true,
  color = "#3b82f6",
  size = "md",
  animated = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeConfig = {
    sm: { height: 4, containerPadding: 0 },
    md: { height: 8, containerPadding: 4 },
    lg: { height: 12, containerPadding: 6 },
  };

  const config = sizeConfig[size];

  return (
    <View className="gap-2">
      {(label || showPercentage) && (
        <View className="flex-row items-center justify-between">
          {label && (
            <Text className="text-xs font-bold text-muted uppercase tracking-widest">
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text className="text-xs font-bold text-foreground">
              {Math.round(percentage)}%
            </Text>
          )}
        </View>
      )}

      <View
        className="w-full bg-border rounded-full overflow-hidden"
        style={{ height: config.height + config.containerPadding * 2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        />
      </View>

      {animated && (
        <motion.div
          className="absolute h-1 rounded-full opacity-50"
          style={{
            backgroundColor: color,
            width: `${percentage}%`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </View>
  );
};
