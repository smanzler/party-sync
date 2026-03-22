import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { router, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { colors } = useTheme();
  const themeData = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];
  const sizeData = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
  ];
  
  return (
    <SafeAreaView style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Stack.Screen
        options={{
          headerTitle: "Settings",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <View style={[styles.preview, { backgroundColor: colors.background, borderColor: colors.border }]}> 
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Sample Header</Text>
        <Text style={{ fontSize: 16, color: colors.text }}>This is a preview of your theme and size settings.</Text>
      </View>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.text }]}>Theme:</Text>
        <Dropdown
          style={[styles.dropdown, { borderColor: colors.border }]}
          data={themeData}
          labelField="label"
          valueField="value"
          placeholder="Select Theme"
          placeholderStyle={{ color: colors.text }}
          selectedTextStyle={{ color: colors.text }}
          onChange={() => {}}
        />
      </View>
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.text }]}>Size:</Text>
        <Dropdown
          style={[styles.dropdown, { borderColor: colors.border }]}
          data={sizeData}
          labelField="label"
          valueField="value"
          placeholder="Select Size"
          placeholderStyle={{ color: colors.text }}
          selectedTextStyle={{ color: colors.text }}
          onChange={() => {}}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button style={styles.button} onPress={() => router.back()} variant="outline">
          <Text style={{ color: colors.text }}>Save</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  preview: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 24, width: 300, alignItems: 'center'},
  container: { flexDirection: "row", alignItems: "center", margin: 10, width: 300 },
  label: { fontSize: 20 , marginRight: 30, textAlign: 'right', minWidth: 70 },
  dropdown: { height: 40, width: 200, borderWidth: 1, borderRadius: 5, paddingHorizontal: 8 },
  button: {borderRadius: 5, width: 130},
  buttonContainer: {position: 'absolute', bottom: 30, alignItems: 'center'}
});