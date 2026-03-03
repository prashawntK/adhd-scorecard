import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TimerProvider } from "@/components/providers/TimerProvider";
import { Navigation } from "@/components/ui/Navigation";

export const metadata: Metadata = {
  title: "ADHD Scorecard",
  description: "Your daily dopamine-powered accountability companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TimerProvider>
            <div className="min-h-screen bg-surface-base text-gray-50">
              <Navigation />
              <main className="max-w-4xl mx-auto px-4 pb-28 pt-6">
                {children}
              </main>
            </div>
          </TimerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
