import { MaxContentWidth, Spacing } from "@/constants/theme";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export default function AppTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Comercios", href: "/" },
    { name: "Promos", href: "/promociones" },
    { name: "Mapa", href: "/mapa" },
    { name: "Mi Cuenta", href: "/perfil" },
  ];

  return (
    <View style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" style={styles.brandText}>
          Directorio CCU
        </ThemedText>

        {tabs.map((tab) => {
          const isFocused = pathname === tab.href;
          return (
            <Pressable
              key={tab.href}
              onPress={() => router.push(tab.href as any)}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.pressed,
              ]}
            >
              <ThemedView
                type={isFocused ? "backgroundSelected" : "backgroundElement"}
                style={styles.tabButtonView}
              >
                <ThemedText
                  type="small"
                  themeColor={isFocused ? "text" : "textSecondary"}
                >
                  {tab.name}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    padding: Spacing.three,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    zIndex: 100,
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandText: {
    marginRight: "auto",
  },
  tabButton: {
    cursor: "pointer",
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
