import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "./globals.css";
import "./fix.css";
import "./landing.css";
import "./checkout.css";

export const metadata: Metadata = {
  title: { default: "Urban Krave | Mediterranean delivery in Seattle", template: "%s | Urban Krave" },
  description: "Mediterranean delivery in Seattle. Shawarma, falafel, mezze and catering, built to travel.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
