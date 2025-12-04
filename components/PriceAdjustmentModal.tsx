import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

interface PriceAdjustmentModalProps {
  visible: boolean;
  taskTitle: string;
  currentPrice: number;
  onAdjustPrice: (newPrice: number) => Promise<void>;
  onDismiss: () => void;
  onClose: () => void;
}

const MIN_PRICE = 7;

export function PriceAdjustmentModal({
  visible,
  taskTitle,
  currentPrice,
  onAdjustPrice,
  onDismiss,
  onClose,
}: PriceAdjustmentModalProps) {
  const { theme } = useTheme();
  const [newPrice, setNewPrice] = useState(currentPrice.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    setNewPrice(cleaned);
    setError(null);
  };

  const handleSavePrice = async () => {
    const priceNum = parseFloat(newPrice);
    
    if (isNaN(priceNum) || priceNum < MIN_PRICE) {
      setError(`Price must be at least $${MIN_PRICE}`);
      return;
    }

    setIsLoading(true);
    try {
      await onAdjustPrice(priceNum);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update price");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeepAsIs = () => {
    onDismiss();
    onClose();
  };

  const suggestedPrices = [
    Math.round(currentPrice * 1.15),
    Math.round(currentPrice * 1.25),
    Math.round(currentPrice * 1.5),
  ].filter(p => p > currentPrice);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={[styles.modalContent, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: theme.link + "20" }]}>
                <Feather name="trending-up" size={24} color={theme.link} />
              </View>
              <ThemedText type="h3" style={styles.title}>
                No helpers yet - increase your chances
              </ThemedText>
            </View>
            
            <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
              It's been 24 hours and no one has applied to your task. You can improve visibility by adjusting your price.
            </ThemedText>

            <View style={[styles.taskInfo, { backgroundColor: theme.backgroundTertiary }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>Task:</ThemedText>
              <ThemedText type="body" numberOfLines={2}>{taskTitle}</ThemedText>
            </View>

            <View style={styles.priceSection}>
              <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
                Current Price: ${currentPrice}
              </ThemedText>
              
              <View style={styles.inputContainer}>
                <ThemedText type="h3" style={styles.dollarSign}>$</ThemedText>
                <TextInput
                  style={[
                    styles.priceInput,
                    {
                      backgroundColor: theme.backgroundTertiary,
                      color: theme.text,
                      borderColor: error ? theme.error : theme.border,
                    },
                  ]}
                  value={newPrice}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  placeholder="Enter new price"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              
              {error ? (
                <ThemedText type="small" style={{ color: theme.error, marginTop: Spacing.xs }}>
                  {error}
                </ThemedText>
              ) : null}

              {suggestedPrices.length > 0 ? (
                <View style={styles.suggestions}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                    Quick suggestions:
                  </ThemedText>
                  <View style={styles.suggestionButtons}>
                    {suggestedPrices.map((price) => (
                      <Pressable
                        key={price}
                        style={[
                          styles.suggestionButton,
                          { backgroundColor: theme.backgroundTertiary },
                        ]}
                        onPress={() => setNewPrice(price.toString())}
                      >
                        <ThemedText type="small" style={{ color: theme.link }}>
                          ${price}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.smartSuggestion}>
              <Feather name="info" size={16} color={theme.link} />
              <ThemedText type="caption" style={{ color: theme.textSecondary, flex: 1, marginLeft: Spacing.sm }}>
                Most helpers complete similar tasks for higher prices. Consider adjusting yours to attract more interest.
              </ThemedText>
            </View>

            <View style={styles.buttons}>
              <Button onPress={handleSavePrice} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  "Save New Price"
                )}
              </Button>
              
              <Pressable style={styles.keepButton} onPress={handleKeepAsIs}>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  Keep It As Is
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  taskInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  priceSection: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dollarSign: {
    marginRight: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    borderWidth: 1,
  },
  suggestions: {
    marginTop: Spacing.md,
  },
  suggestionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  suggestionButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  smartSuggestion: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  buttons: {
    gap: Spacing.md,
  },
  keepButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
});
