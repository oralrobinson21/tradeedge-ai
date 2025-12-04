import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1F2937",
    textSecondary: "#6B7280",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#00B87C",
    link: "#00B87C",
    primary: "#00B87C",
    secondary: "#5B6EFF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9FAFB",
    backgroundSecondary: "#F3F4F6",
    backgroundTertiary: "#E5E7EB",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    border: "#E5E7EB",
    funded: "#D1FAE5",
    fundedText: "#065F46",
    assigned: "#DBEAFE",
    assignedText: "#1E40AF",
    completed: "#F3F4F6",
    completedText: "#4B5563",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#98989F",
    buttonText: "#FFFFFF",
    tabIconDefault: "#98989F",
    tabIconSelected: "#00B87C",
    link: "#00B87C",
    primary: "#00B87C",
    secondary: "#5B6EFF",
    backgroundRoot: "#1C1C1E",
    backgroundDefault: "#2C2C2E",
    backgroundSecondary: "#3A3A3C",
    backgroundTertiary: "#48484A",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
    border: "#3A3A3C",
    funded: "#064E3B",
    fundedText: "#6EE7B7",
    assigned: "#1E3A8A",
    assignedText: "#93C5FD",
    completed: "#374151",
    completedText: "#9CA3AF",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  xxxl: 64,
  inputHeight: 48,
  buttonHeight: 52,
  fabSize: 64,
};

export const BorderRadius = {
  xs: 8,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 28,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
