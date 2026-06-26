import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'veltora-gold': "var(--veltora-gold)",
        'veltora-gold-light': "var(--veltora-gold-light)",
        'veltora-obsidian': "var(--veltora-obsidian)",
        'veltora-charcoal': "var(--veltora-charcoal)",
        'veltora-steel': "var(--veltora-steel)",
        'veltora-cream': "var(--veltora-cream)",
        'veltora-titanium': "var(--veltora-titanium)",
      },
    },
  },
  plugins: [],
};
export default config;
