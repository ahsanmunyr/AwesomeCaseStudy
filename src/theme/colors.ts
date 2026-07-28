export const colors = {
  background: "#0F1220",
  surface: "#1A1F35",
  surfaceAlt: "#232942",
  border: "#2E3653",
  text: "#F2F4FF",
  textMuted: "#9AA3C7",
  accent: "#F2B01E",
  accentText: "#1A1300",
  danger: "#FF6B6B",
} as const;

export const rarityColors: Record<string, string> = {
  free: "#B9C0D9",
  common: "#B9C0D9",
  rare: "#4A9BFF",
  epic: "#C56BFF",
  legendary: "#FF9F1C",
};

export default colors;
