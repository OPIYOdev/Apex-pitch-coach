import React from "react";
import { motion } from "framer-motion";
import { View, ViewProps } from "react-native";

interface GradientBgProps extends ViewProps {
  children: React.ReactNode;
  animated?: boolean;
  colors?: string[];
}

export const GradientBg: React.FC<GradientBgProps> = ({
  children,
  animated = true,
  colors = ["#0f172a", "#1e293b"],
  ...props
}) => {
  return (
    <View {...props}>
      {animated && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            background: `linear-gradient(135deg, ${colors.join(", ")})`,
            backgroundSize: "200% 200%",
          }}
        />
      )}
      <View className="relative z-10">{children}</View>
    </View>
  );
};
