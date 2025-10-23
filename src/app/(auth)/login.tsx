import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Text from "@/src/components/ui/text";
import { supabase } from "@/src/lib/supabase";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

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
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Login",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <View>
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
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginBottom: 16 }}
            leftIcon="mail-outline"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed-outline"
          />
        </View>

        <Button
          title="Login"
          onPress={handleLogin}
          style={{ marginVertical: 4 }}
        />
      </View>
    </View>
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
