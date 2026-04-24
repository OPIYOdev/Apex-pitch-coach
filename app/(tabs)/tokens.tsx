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
            <Text className="text-2xl font-bold text-foreground">Token Balance</Text>
            <Text className="text-sm text-muted">Manage your APEX tokens</Text>
          </View>

          {/* Balance Card */}
          <View
            className="p-6 rounded-2xl items-center gap-2"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            {profileQuery.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-5xl font-bold text-white">{tokens}</Text>
                <Text className="text-white text-lg">Available Tokens</Text>
                <Text className="text-white text-xs opacity-80">
                  Analyse: 5 • Chat: 1 • Voice: 3
                </Text>
              </>
            )}
          </View>

          {/* Token Packages */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Buy Tokens</Text>
            {packagesQuery.isLoading ? (
              <ActivityIndicator />
            ) : packages.length === 0 ? (
              <Text className="text-sm text-muted">No packages available.</Text>
            ) : (
              packages.map((pkg) => (
                <TouchableOpacity
                  key={pkg.id}
                  onPress={() => handlePurchase(pkg)}
                  className="p-4 border border-border rounded-lg flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-base font-bold text-foreground">{pkg.name}</Text>
                    <Text className="text-sm text-muted">{pkg.tokens} tokens</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-primary">KES {pkg.priceKES}</Text>
                    <Text className="text-xs text-muted">via M-Pesa</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Transaction History */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Recent Activity</Text>
            {transactionsQuery.isLoading ? (
              <ActivityIndicator />
            ) : transactions.length === 0 ? (
              <Text className="text-sm text-muted">No transactions yet.</Text>
            ) : (
              <View className="gap-2">
                {transactions.map((tx) => (
                  <View
                    key={tx.id}
                    className="p-3 bg-surface border border-border rounded-lg flex-row items-center justify-between"
                  >
                    <View>
                      <Text className="text-sm font-semibold text-foreground capitalize">
                        {tx.reason?.replace(/_/g, " ") ?? tx.type}
                      </Text>
                      <Text className="text-xs text-muted">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : ""}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-sm font-bold ${
                          tx.type === "purchase" ? "text-success" : "text-error"
                        }`}
                      >
                        {tx.type === "purchase" ? "+" : "-"}
                        {tx.amount}
                      </Text>
                      <Text className="text-[10px] text-muted capitalize">{tx.mpesaStatus}</Text>
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
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 p-4">
          <View className="bg-surface w-full max-w-md p-6 rounded-2xl gap-4">
            <Text className="text-xl font-bold text-foreground">Confirm Payment</Text>
            <Text className="text-sm text-muted">
              You are buying {selectedPkg?.tokens} tokens for KES {selectedPkg?.priceKES}.
              Enter your M-Pesa number to receive the STK prompt.
            </Text>
            
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">M-Pesa Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="2547XXXXXXXX"
                keyboardType="phone-pad"
                className="border border-border rounded-lg p-3 text-foreground bg-background"
              />
            </View>

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 p-3 border border-border rounded-lg items-center"
              >
                <Text className="text-foreground font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmPayment}
                disabled={stkPushMutation.isPending}
                className="flex-1 p-3 bg-primary rounded-lg items-center"
              >
                {stkPushMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold">Pay Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
