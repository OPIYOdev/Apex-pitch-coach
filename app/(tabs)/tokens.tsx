import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { AnimatedCard } from "@/components/animated-card";

export default function TokensScreen() {
  const [phoneNumber, setPhoneNumber] = useState("254");
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Live data from the server
  const profileQuery = trpc.user.profile.useQuery();
  const packagesQuery = trpc.user.tokenPackages.useQuery();
  const transactionsQuery = trpc.user.transactions.useQuery({ limit: 10 });

  const stkPushMutation = trpc.mpesa.initiateStkPush.useMutation({
    onSuccess: (data) => {
      setModalVisible(false);
      Alert.alert("STK Push Sent", data.message);
      setTimeout(() => {
        transactionsQuery.refetch();
        profileQuery.refetch();
      }, 15000);
    },
    onError: (err) => {
      Alert.alert("Payment Failed", err.message);
    },
  });

  const tokens = profileQuery.data?.tokens ?? 0;
  const packages = packagesQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const handlePurchase = (pkg: any) => {
    setSelectedPkg(pkg);
    setModalVisible(true);
  };

  const confirmPayment = () => {
    if (!phoneNumber.match(/^254\d{9}$/)) {
      Alert.alert("Invalid Number", "Please enter a valid phone number in format 2547XXXXXXXX");
      return;
    }
    stkPushMutation.mutate({
      packageId: selectedPkg.id,
      phoneNumber,
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <View className="mb-2">
              <Text className="text-2xl font-bold text-foreground">Fuel Your Growth</Text>
              <Text className="text-sm text-muted italic">"Investment is the first step to authority."</Text>
            </View>
          </motion.div>

          {/* Balance Card with animation */}
          <AnimatedCard delay={0.1} variant="bounce">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <View
                className="p-6 rounded-2xl items-center gap-2 border-b-4 border-primary"
                style={{ backgroundColor: "#0f172a" }}
              >
                {profileQuery.isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-xs font-bold text-primary uppercase tracking-widest">Current Reserves</Text>
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      <Text className="text-6xl font-black text-white">{tokens}</Text>
                    </motion.div>
                    <Text className="text-white text-sm font-medium opacity-80 uppercase">APEX Tokens</Text>
                    <View className="flex-row gap-4 mt-2 border-t border-white/10 pt-3 w-full justify-center">
                      {[
                        { label: "SIMULATION", value: "5" },
                        { label: "CHAT", value: "1" },
                        { label: "VOICE", value: "3" },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + idx * 0.1 }}
                          className="items-center"
                        >
                          <Text className="text-white font-bold text-xs">{item.value}</Text>
                          <Text className="text-white/60 text-[8px]">{item.label}</Text>
                        </motion.div>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </motion.div>
          </AnimatedCard>

          {/* Token Packages */}
          <AnimatedCard delay={0.2} variant="slideUp">
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">Select Your Plan</Text>
              {packagesQuery.isLoading ? (
                <ActivityIndicator />
              ) : packages.length === 0 ? (
                <View className="p-8 border border-dashed border-border rounded-xl items-center">
                  <Text className="text-sm text-muted">No active plans found.</Text>
                </View>
              ) : (
                <motion.div
                  className="gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  {packages.map((pkg, idx) => (
                    <motion.div
                      key={pkg.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <TouchableOpacity
                        onPress={() => handlePurchase(pkg)}
                        className="p-4 bg-surface border border-border rounded-xl flex-row items-center justify-between shadow-sm"
                      >
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-base font-black text-foreground uppercase">{pkg.name}</Text>
                            {pkg.tokens >= 500 && (
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="bg-primary/10 px-2 py-0.5 rounded"
                              >
                                <Text className="text-[8px] font-bold text-primary">BEST VALUE</Text>
                              </motion.div>
                            )}
                          </View>
                          <Text className="text-xs text-muted mt-1 leading-tight">
                            {pkg.description || `${pkg.tokens} tokens for elite pitch simulations.`}
                          </Text>
                          <Text className="text-sm font-bold text-primary mt-2">{pkg.tokens} TOKENS</Text>
                        </View>
                        <View className="items-end ml-4">
                          <Text className="text-xl font-black text-foreground">KES {pkg.priceKES}</Text>
                          <View className="bg-success/10 px-2 py-1 rounded mt-1">
                            <Text className="text-[10px] font-bold text-success">M-PESA</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </View>
          </AnimatedCard>

          {/* Transaction History */}
          <AnimatedCard delay={0.3} variant="slideUp">
            <View className="gap-2 mt-2">
              <Text className="text-lg font-bold text-foreground">Mission History</Text>
              {transactionsQuery.isLoading ? (
                <ActivityIndicator />
              ) : transactions.length === 0 ? (
                <Text className="text-sm text-muted italic">No missions recorded yet.</Text>
              ) : (
                <motion.div
                  className="gap-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                      },
                    },
                  }}
                >
                  {transactions.map((tx, idx) => (
                    <motion.div
                      key={tx.id}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      whileHover={{ x: 4 }}
                    >
                      <View className="p-3 bg-surface border border-border rounded-lg flex-row items-center justify-between">
                        <View>
                          <Text className="text-xs font-bold text-foreground uppercase">
                            {tx.reason?.replace(/_/g, " ") ?? tx.type}
                          </Text>
                          <Text className="text-[10px] text-muted">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ""}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text
                            className={`text-sm font-black ${
                              tx.type === "purchase" ? "text-success" : "text-error"
                            }`}
                          >
                            {tx.type === "purchase" ? "+" : "-"}
                            {tx.amount}
                          </Text>
                          <Text className="text-[8px] font-bold text-muted uppercase">{tx.mpesaStatus || 'COMPLETED'}</Text>
                        </View>
                      </View>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </View>
          </AnimatedCard>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <AnimatePresence>
            {modalVisible && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <View className="bg-surface w-full max-w-md p-8 rounded-3xl gap-6 shadow-2xl">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="items-center"
                  >
                    <Text className="text-3xl mb-2">💳</Text>
                    <Text className="text-2xl font-black text-foreground uppercase tracking-tight">Secure Checkout</Text>
                    <Text className="text-sm text-muted text-center mt-2">
                      Initiating M-Pesa STK Push for <Text className="font-bold text-foreground">{selectedPkg?.name}</Text>.
                    </Text>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="gap-2"
                  >
                    <Text className="text-xs font-bold text-muted uppercase tracking-widest">M-Pesa Phone Number</Text>
                    <TextInput
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="2547XXXXXXXX"
                      keyboardType="phone-pad"
                      className="border-2 border-border rounded-xl p-4 text-lg font-bold text-foreground bg-background"
                    />
                    <Text className="text-[10px] text-muted italic">Format: 254712345678</Text>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex-row gap-3"
                  >
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="flex-1 p-4 border border-border rounded-xl items-center"
                    >
                      <Text className="text-foreground font-bold uppercase">Abort</Text>
                    </TouchableOpacity>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <TouchableOpacity
                        onPress={confirmPayment}
                        disabled={stkPushMutation.isPending}
                        className="p-4 bg-primary rounded-xl items-center"
                      >
                        {stkPushMutation.isPending ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text className="text-white font-black uppercase">Confirm & Pay</Text>
                        )}
                      </TouchableOpacity>
                    </motion.div>
                  </motion.div>
                </View>
              </motion.div>
            )}
          </AnimatePresence>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
