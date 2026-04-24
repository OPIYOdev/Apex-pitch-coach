import React from "react";
import { motion } from "framer-motion";
import { View, Text } from "react-native";

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  maxScore = 10,
  size = 120,
  strokeWidth = 8,
  label = "APEX SCORE",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / maxScore) * circumference;
  
  // Color gradient based on score
  const getColor = (s: number) => {
    if (s >= 8) return "#10b981"; // green
    if (s >= 6) return "#f59e0b"; // amber
    if (s >= 4) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  return (
    <View className="items-center justify-center">
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
        />
      </motion.svg>

      {/* Score text */}
      <motion.div
        className="absolute items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Text className="text-4xl font-black text-foreground">
          {score.toFixed(1)}
        </Text>
        <Text className="text-xs font-bold text-muted uppercase tracking-widest mt-1">
          {label}
        </Text>
      </motion.div>
    </View>
  );
};
