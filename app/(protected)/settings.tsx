import { Text } from "@/components/ui/text";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Settings() {
  return (
    <KeyboardAwareScrollView style={{ flex: 1, padding: 16 }}>
      <View style={styles.container}>
        <Text>Settings</Text>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
