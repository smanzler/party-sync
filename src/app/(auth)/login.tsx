import BackButton from "@/src/components/navigation/back-button";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Spinner from "@/src/components/ui/spinner";
import Text from "@/src/components/ui/text";
import { supabase } from "@/src/lib/supabase";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Stack } from "expo-router";
import { Lock, MailIcon } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const { colors } = useTheme();

  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoginLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Login",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <View style={{ marginBottom: 36 }}>
        <BackButton />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
        Sign in to your account
      </Text>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          onChangeText={setEmail}
          containerStyle={{ marginBottom: 16 }}
          leftIcon={<MailIcon size={20} color={colors.text} />}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          onChangeText={setPassword}
          leftIcon={<Lock size={20} color={colors.text} />}
        />
      </View>

      <Button
        onPress={handleLogin}
        style={{ marginVertical: 4 }}
        disabled={loginLoading}
      >
        {loginLoading && <Spinner color="black" size={20} />}
        Login
      </Button>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  btnPrimary: {
    marginVertical: 4,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
