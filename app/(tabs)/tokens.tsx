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
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

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
      // Start polling for transaction status or just refresh after a delay
      setTimeout(() => {
        transactionsQuery.refetch();
        profileQuery.refetch();
      }, 15000); // Wait 15s for callback processing
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
          <View className="mb-2">
            <Text className="text-2xl font-bold text-foreground">Fuel Your Growth</Text>
            <Text className="text-sm text-muted italic">"Investment is the first step to authority."</Text>
          </View>

          {/* Balance Card */}
          <View
            className="p-6 rounded-2xl items-center gap-2 border-b-4 border-primary"
            style={{ backgroundColor: "#0f172a" }}
          >
            {profileQuery.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-xs font-bold text-primary uppercase tracking-widest">CURRENT RESERVES</Text>
                <Text className="text-6xl font-black text-white">{tokens}</Text>
                <Text className="text-white text-sm font-medium opacity-80 uppercase">APEX TOKENS</Text>
                <View className="flex-row gap-4 mt-2 border-t border-white/10 pt-3 w-full justify-center">
                  <View className="items-center">
                    <Text className="text-white font-bold text-xs">5</Text>
                    <Text className="text-white/60 text-[8px]">SIMULATION</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white font-bold text-xs">1</Text>
                    <Text className="text-white/60 text-[8px]">CHAT</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-white font-bold text-xs">3</Text>
                    <Text className="text-white/60 text-[8px]">VOICE</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Token Packages */}
          <View className="gap-3">
            <Text className="text-lg font-bold text-foreground">Select Your Plan</Text>
            {packagesQuery.isLoading ? (
              <ActivityIndicator />
            ) : packages.length === 0 ? (
              <View className="p-8 border border-dashed border-border rounded-xl items-center">
                <Text className="text-sm text-muted">No active plans found.</Text>
              </View>
            ) : (
              packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  onPress={() => handlePurchase(pkg)}
                  className="p-4 bg-surface border border-border rounded-xl flex-row items-center justify-between shadow-sm"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-black text-foreground uppercase">{pkg.name}</Text>
                      {pkg.tokens >= 500 && (
                        <View className="bg-primary/10 px-2 py-0.5 rounded">
                          <Text className="text-[8px] font-bold text-primary">BEST VALUE</Text>
                        </View>
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
                      <Text className="text-[10px] font-bold text-success">M-PESA PUSH</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Transaction History */}
          <View className="gap-2 mt-2">
            <Text className="text-lg font-bold text-foreground">Mission History</Text>
            {transactionsQuery.isLoading ? (
              <ActivityIndicator />
            ) : transactions.length === 0 ? (
              <Text className="text-sm text-muted italic">No missions recorded yet.</Text>
            ) : (
              <View className="gap-2">
                {transactions.map((tx) => (
                  <View
                    key={tx.id}
                    className="p-3 bg-surface border border-border rounded-lg flex-row items-center justify-between"
                  >
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
                ))}
              </View>
            )}
          </View>
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
          <View className="bg-surface w-full max-w-md p-8 rounded-3xl gap-6 shadow-2xl">
            <View className="items-center">
              <Text className="text-3xl mb-2">💳</Text>
              <Text className="text-2xl font-black text-foreground uppercase tracking-tight">Secure Checkout</Text>
              <Text className="text-sm text-muted text-center mt-2">
                Initiating M-Pesa STK Push for <Text className="font-bold text-foreground">{selectedPkg?.name}</Text>.
              </Text>
            </View>
            
            <View className="gap-2">
              <Text className="text-xs font-bold text-muted uppercase tracking-widest">M-PESA PHONE NUMBER</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="2547XXXXXXXX"
                keyboardType="phone-pad"
                className="border-2 border-border rounded-xl p-4 text-lg font-bold text-foreground bg-background focus:border-primary"
              />
              <Text className="text-[10px] text-muted italic">Format: 254712345678</Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 p-4 border border-border rounded-xl items-center"
              >
                <Text className="text-foreground font-bold uppercase">Abort</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPayment}
                disabled={stkPushMutation.isPending}
                className="flex-2 p-4 bg-primary rounded-xl items-center"
              >
                {stkPushMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-black uppercase">Confirm & Pay</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
