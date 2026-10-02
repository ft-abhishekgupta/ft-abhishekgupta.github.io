import { Bricolage_Grotesque, JetBrains_Mono, Press_Start_2P } from "next/font/google";

// Variable display grotesque: the opsz/wdth axes let headlines stretch and
// tighten under motion while body copy stays on the same family.
export const fontSans = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Only the Games loading scene uses this; not preloaded so other pages never
// pay for it.
export const fontPixel = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
  preload: false,
});