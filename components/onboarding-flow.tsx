import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View className="flex-1 bg-background">
      {/* Progress bar */}
      <motion.div
        className="h-1 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center items-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full items-center gap-4"
            >
              {/* Icon */}
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {step.icon}
              </motion.div>

              {/* Title */}
              <Text className="text-3xl font-black text-foreground text-center uppercase tracking-tight">
                {step.title}
              </Text>

              {/* Description */}
              <Text className="text-base text-muted text-center leading-relaxed max-w-sm">
                {step.description}
              </Text>

              {/* Custom action */}
              {step.action && (
                <TouchableOpacity
                  onPress={step.action.onPress}
                  className="mt-4 px-6 py-3 bg-primary rounded-lg"
                >
                  <Text className="text-white font-bold">{step.action.label}</Text>
                </TouchableOpacity>
              )}
            </motion.div>
          </AnimatePresence>
        </View>

        {/* Navigation */}
        <View className="flex-row gap-3 justify-between mt-8">
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentStep === 0}
            className={`flex-1 py-3 px-4 rounded-lg border border-border items-center ${
              currentStep === 0 ? "opacity-50" : ""
            }`}
          >
            <Text className="text-foreground font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="flex-1 py-3 px-4 rounded-lg bg-primary items-center"
          >
            <Text className="text-white font-semibold">
              {currentStep === steps.length - 1 ? "Start" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View className="flex-row justify-center gap-2 mt-6">
          {steps.map((_, idx) => (
            <motion.div
              key={idx}
              className={`h-2 rounded-full ${
                idx === currentStep ? "bg-primary w-6" : "bg-border w-2"
              }`}
              animate={{
                width: idx === currentStep ? 24 : 8,
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
