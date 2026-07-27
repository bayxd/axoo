import "./globals.css";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ThemeStyleProvider } from "@/context/ThemeStyleContext";
import { Toaster } from "sonner";
import LiquidCursor from "@/components/ui/LiquidCursor";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-jb",
});

export default function RootLayout({children,}: {
  children: React.ReactNode;}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeStyleProvider>
            <Providers>
              <div className="flex-1 flex flex-col">
                {children}
              </div>
            </Providers>
            <LiquidCursor />
            <Toaster
              richColors
              position="top-right"
            />
          </ThemeStyleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}