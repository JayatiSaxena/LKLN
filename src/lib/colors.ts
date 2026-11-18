const COLORS: Record<string, string> = {
  black: "#111111", white: "#FFFFFF", grey: "#9CA3AF", gray: "#9CA3AF", charcoal: "#36454F", cream: "#F5F0E1",
  amber: "#F28C28", lilac: "#C8A2C8", butter: "#F6E27A", blue: "#3B82F6", "light blue": "#A7C7E7", navy: "#1F2A44",
  "blue floral": "#8FB3D9", "light wash": "#A9C1DB", "mid indigo": "#3F5F8F", "dark indigo": "#1F2F4F",
  "black pinstripe": "#1A1A1A", "red check": "#B22222", "navy check": "#1F2A44", red: "#DC2626", mocha: "#6B4F3A",
  olive: "#6B6B3A", sand: "#D8C3A5", sage: "#9CAF88", "forest green": "#1E4D3A", "grey melange": "#B8B8B8",
};

/** Maps a colour name to a hex value for swatches (falls back to the last word, then neutral grey). */
export const colorHex = (name: string): string => {
  const n = name.trim().toLowerCase();
  return COLORS[n] ?? COLORS[n.split(" ").pop() || ""] ?? "#9CA3AF";
};
