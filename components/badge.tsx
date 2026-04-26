import { motion } from "framer-motion";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  icon?: string;
}

const BADGE_COLORS = {
  primary: { bg: "#3b82f6", bgLight: "#dbeafe", text: "#1e40af" },
  success: { bg: "#10b981", bgLight: "#d1fae5", text: "#065f46" },
  warning: { bg: "#f59e0b", bgLight: "#fef3c7", text: "#92400e" },
  error: { bg: "#ef4444", bgLight: "#fee2e2", text: "#991b1b" },
  neutral: { bg: "#6b7280", bgLight: "#f3f4f6", text: "#374151" },
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "primary",
  size = "md",
  animated = false,
  icon,
}) => {
  const colors = BADGE_COLORS[variant];

  const sizeConfig = {
    sm: { px: 2, py: 1, textSize: 10 },
    md: { px: 3, py: 1.5, textSize: 12 },
    lg: { px: 4, py: 2, textSize: 14 },
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : {}}
      animate={animated ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 200 }}
      whileHover={animated ? { scale: 1.05 } : {}}
    >
      <View
        className="rounded-full flex-row items-center gap-1"
        style={{
          backgroundColor: colors.bgLight,
          paddingHorizontal: config.px * 4,
          paddingVertical: config.py * 4,
        }}
      >
        {icon && (
          <Text style={{ fontSize: config.textSize + 2 }}>
            {icon}
          </Text>
        )}
        <Text
          style={{
            fontSize: config.textSize,
            fontWeight: "bold",
            color: colors.text,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Text>
      </View>
    </motion.div>
  );
};
