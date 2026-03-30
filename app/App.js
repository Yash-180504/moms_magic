import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AuthContext, AuthProvider } from "./src/context/AuthContext";
import api from "./src/lib/api";

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1, backgroundColor: "white" },
  scrollViewContent: { padding: 20, minHeight: "100%" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#EA580C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  smallButton: {
    backgroundColor: "#EA580C",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  smallButtonText: { color: "white", fontWeight: "bold", fontSize: 12 },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  text: { fontSize: 14, textAlign: "center", marginVertical: 10 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingBottom: 0,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabActive: { borderTopWidth: 3, borderTopColor: "#EA580C" },
  tabText: { fontSize: 11, fontWeight: "bold", color: "#666", marginTop: 4 },
  tabTextActive: { color: "#EA580C" },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 5,
  },
  cardName: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  cardDesc: { fontSize: 13, color: "#666", marginBottom: 8 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  navContainer: { flex: 1 },
  topBar: {
    backgroundColor: "#EA580C",
    padding: 15,
    paddingTop: 40,
    alignItems: "center",
  },
  topBarText: { color: "white", fontSize: 18, fontWeight: "bold" },
  backButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  backButtonText: { color: "#EA580C", fontWeight: "bold" },
});

function LoginScreen() {
  const [email, setEmail] = React.useState("customer@test.com");
  const [password, setPassword] = React.useState("password123");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const { login } = useContext(AuthContext);

  async function handleLogin() {
    if (!email || !password) {
      setError("Enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err?.message || "Login failed");
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.heading}>Moms Magic</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />
        <Pressable
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>
        <Text style={styles.text}>Demo: customer@test.com / password123</Text>
      </ScrollView>
    </View>
  );
}

function ProvidersListScreen({ onSelectProvider }) {
  const [providers, setProviders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    try {
      const response = await api.get("/api/providers");
      setProviders(response.data);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return (
    <FlatList
      data={providers}
      contentContainerStyle={{ padding: 10 }}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <Pressable
            style={styles.smallButton}
            onPress={() => onSelectProvider(item.id)}
          >
            <Text style={styles.smallButtonText}>View Menu</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

function ProviderDetailScreen({ providerId, onBack }) {
  const [provider, setProvider] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchProvider();
  }, [providerId]);

  async function fetchProvider() {
    try {
      const response = await api.get(`/api/providers/${providerId}`);
      setProvider(response.data);
    } catch (err) {
      console.error("Failed to fetch provider:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.loading}>
        <Text>Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>
      <Text style={styles.heading}>{provider.name}</Text>
      <Text style={styles.text}>{provider.description}</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Order Now</Text>
      </Pressable>
    </ScrollView>
  );
}

function ProfileScreen({ user, onLogout }) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.card}>
          <Text style={styles.cardName}>Name: {user?.name}</Text>
          <Text style={styles.cardDesc}>Email: {user?.email}</Text>
          <Text style={styles.cardDesc}>Role: {user?.role}</Text>
        </View>
        <Pressable style={styles.button} onPress={onLogout}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function MainApp() {
  const { logout, user } = useContext(AuthContext);
  const [screen, setScreen] = React.useState("home");
  const [selectedProviderId, setSelectedProviderId] = React.useState(null);

  return (
    <View style={styles.navContainer}>
      <StatusBar style="dark" />
      {screen === "home" && selectedProviderId === null && (
        <ProvidersListScreen
          onSelectProvider={(id) => setSelectedProviderId(id)}
        />
      )}
      {screen === "home" && selectedProviderId !== null && (
        <ProviderDetailScreen
          providerId={selectedProviderId}
          onBack={() => setSelectedProviderId(null)}
        />
      )}
      {screen === "profile" && <ProfileScreen user={user} onLogout={logout} />}

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, screen === "home" && styles.tabActive]}
          onPress={() => {
            setScreen("home");
            setSelectedProviderId(null);
          }}
        >
          <Text style={[styles.tabText, screen === "home" && styles.tabTextActive]}>
            🏠 Home
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, screen === "profile" && styles.tabActive]}
          onPress={() => setScreen("profile")}
        >
          <Text style={[styles.tabText, screen === "profile" && styles.tabTextActive]}>
            👤 Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return isAuthenticated ? <MainApp /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
