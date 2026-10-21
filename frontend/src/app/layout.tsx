import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NotificationBanner from "@/components/common/NotificationBanner";

export const metadata: Metadata = {
  title: "Dead-Man Switch — Digital Contingency Vault",
  description:
    "Institutional-grade decentralized contingency protocol and autonomous digital inheritance vault on Ethereum.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen text-on-surface antialiased selection:bg-primary selection:text-white">
        <Web3Provider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 md:pl-[230px] flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 pt-14 p-4 md:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
              <NotificationBanner />
            </div>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
