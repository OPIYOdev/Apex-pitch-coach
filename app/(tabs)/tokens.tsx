import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function TokensScreen() {
  // Live data from the server
  const profileQuery = trpc.user.profile.useQuery();
  const packagesQuery = trpc.user.tokenPackages.useQuery();
  const transactionsQuery = trpc.user.transactions.useQuery({ limit: 10 });

  const tokens = profileQuery.data?.tokens ?? 0;
  const packages = packagesQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];

  const handlePurchase = (pkg: { id: string; name: string | null; tokens: number | null; priceKES: string | null }) => {
    // M-Pesa STK Push is initiated server-side via /api/payment/initiate-mpesa.
    // The frontend will need a phone number input and a tRPC mutation once
    // the payment flow is fully wired. For now we surface a clear placeholder.
    Alert.alert(
      "Buy Tokens",
      `M-Pesa payment for "${pkg.name}" (${pkg.tokens} tokens, KES ${pkg.priceKES}) will be implemented in the next phase.`,
    );
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

          {/* Usage Breakdown */}
          <View className="gap-2">
            <Text className="text-lg font-bold text-foreground">Token Usage</Text>
            <View className="gap-2">
              {[
                { icon: "🎤", label: "Pitch Analysis", cost: "5 tokens per analysis", amount: 5 },
                { icon: "💬", label: "Coach Chat", cost: "1 token per message", amount: 1 },
                { icon: "🎙️", label: "Voice Session", cost: "3 tokens per session", amount: 3 },
              ].map((item) => (
                <View
                  key={item.label}
                  className="p-3 bg-surface border border-border rounded-lg flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg">{item.icon}</Text>
                    <View>
                      <Text className="text-sm font-semibold text-foreground">{item.label}</Text>
                      <Text className="text-xs text-muted">{item.cost}</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-bold text-foreground">{item.amount}</Text>
                </View>
              ))}
            </View>
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
                    <Text
                      className={`text-sm font-bold ${
                        tx.type === "purchase" ? "text-success" : "text-error"
                      }`}
                    >
                      {tx.type === "purchase" ? "+" : "-"}
                      {tx.amount}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Founder Note */}
          <View className="p-3 bg-primary bg-opacity-10 rounded-lg">
            <Text className="text-xs text-primary font-semibold mb-1">💡 Founder Access</Text>
            <Text className="text-xs text-foreground">
              Founders get unlimited free tokens. Configure M-Pesa credentials via environment
              variables to receive payments directly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
