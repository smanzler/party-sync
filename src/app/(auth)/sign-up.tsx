import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { supabase } from "@/src/lib/supabase";
import { useTheme } from "@/src/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

const SignUpPage = () => {
  const { colors } = useTheme();

  const [signUpLoading, setSignUpLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (username.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      Alert.alert(
        "Error",
        "Username can only contain letters, numbers, and underscores"
      );
      return;
    }

    setSignUpLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: "Create Account",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <View>
        <Text style={[styles.title, { color: colors.text }]}>
          Let&apos;s get started
        </Text>
        <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
          Create your account
        </Text>

        <View style={styles.form}>
          <Input
            label="Username"
            placeholder="Choose a username"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            containerStyle={{ marginBottom: 16 }}
            leftIcon={
              <Ionicons name="person-outline" size={20} color={colors.text} />
            }
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginBottom: 16 }}
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={colors.text} />
            }
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            containerStyle={{ marginBottom: 16 }}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
              />
            }
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.text}
              />
            }
          />
        </View>

        <Button
          title="Create Account"
          onPress={handleSignUp}
          loading={signUpLoading}
          style={{ marginVertical: 4 }}
        />
      </View>
    </View>
  );
};

export default SignUpPage;

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
});
