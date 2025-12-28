import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import ErrorBoundary from "@/components/error-boundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mimariproje.com - Türkiye'nin Mimarlık Platformu",
  description:
    "Türkiye'nin mimarlık firmalarını ve serbest çalışan mimarları bir araya getiren, online mimarlık hizmetleri sunan platform.",
  keywords:
    "mimarlık, mimar, proje, inşaat, türkiye, freelance, iş ilanı, portföy",
  authors: [{ name: "Mimariproje.com" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              <AuthProvider>
                <ErrorBoundary>
                  <ToastProvider>
                    <div className="flex flex-col min-h-screen">
                      <ErrorBoundary>
                        <Header />
                      </ErrorBoundary>
                      <main className="flex-1">
                        <ErrorBoundary>{children}</ErrorBoundary>
                      </main>
                      <ErrorBoundary>
                        <Footer />
                      </ErrorBoundary>
                    </div>
                  </ToastProvider>
                </ErrorBoundary>
              </AuthProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
