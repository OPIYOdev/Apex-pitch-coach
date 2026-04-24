import React from "react";
import { motion } from "framer-motion";
import { View, ViewProps } from "react-native";

interface AnimatedCardProps extends ViewProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
  variant?: "fade" | "slideUp" | "slideDown" | "scaleIn" | "bounce";
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      }
    },
    exit: { opacity: 0, scale: 0.8 },
  },
};

export const AnimatedCard = React.forwardRef<View, AnimatedCardProps>(
  ({ delay = 0, duration = 0.5, children, variant = "slideUp", ...props }, ref) => {
    return (
      <motion.div
        ref={ref as any}
        initial={variants[variant].initial}
        animate={variants[variant].animate}
        exit={variants[variant].exit}
        transition={{
          delay,
          duration: variant === "bounce" ? 0 : duration,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";
