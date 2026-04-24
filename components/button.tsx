import React from "react";
import { motion } from "framer-motion";
import { TouchableOpacity, Text, ViewStyle } from "react-native";

interface ButtonProps {
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  style?: ViewStyle;
  loading?: boolean;
}

const variantClasses = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-foreground border border-border",
  ghost: "bg-transparent text-foreground",
  danger: "bg-error text-white",
};

const sizeClasses = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  onPress,
  disabled = false,
  variant = "primary",
  size = "md",
  children,
  style,
  loading = false,
}) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        className={`rounded-lg font-semibold uppercase tracking-wider items-center justify-center ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${
          disabled || loading ? "opacity-50" : ""
        }`}
        style={style}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Text className="text-white">⟳</Text>
          </motion.div>
        ) : (
          <Text className="font-bold">{children}</Text>
        )}
      </TouchableOpacity>
    </motion.div>
  );
};
