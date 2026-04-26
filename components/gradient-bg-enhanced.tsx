import { motion } from "framer-motion";
import { View } from "react-native";

interface GradientBgEnhancedProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  animated?: boolean;
}

const GRADIENT_VARIANTS = {
  primary: {
    from: "#0f172a",
    to: "#1e3a8a",
    accent: "#3b82f6",
  },
  success: {
    from: "#064e3b",
    to: "#065f46",
    accent: "#10b981",
  },
  warning: {
    from: "#78350f",
    to: "#92400e",
    accent: "#f59e0b",
  },
  error: {
    from: "#7f1d1d",
    to: "#991b1b",
    accent: "#ef4444",
  },
  neutral: {
    from: "#1f2937",
    to: "#374151",
    accent: "#6b7280",
  },
};

export const GradientBgEnhanced: React.FC<GradientBgEnhancedProps> = ({
  children,
  variant = "primary",
  animated = true,
}) => {
  const colors = GRADIENT_VARIANTS[variant];

  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <View
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
        }}
      />
      
      {animated && (
        <>
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
            style={{
              background: colors.accent,
              filter: "blur(80px)",
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
            style={{
              background: colors.accent,
              filter: "blur(80px)",
            }}
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}

      <View className="relative z-10">
        {children}
      </View>
    </motion.div>
  );
};
