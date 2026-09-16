import { Kanit, Noto_Sans_Thai } from "next/font/google";

// Shared by the locale layout and the 404 page, which renders outside any layout.
export const bodyFont = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-body", display: "swap" });
export const headingFont = Kanit({ subsets: ["thai", "latin"], weight: ["500", "700"], variable: "--font-heading", display: "swap" });
