import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiscoveryOS — Product Discovery",
  description: "AI-powered customer research and product discovery dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex h-screen w-full overflow-hidden bg-[#FAFAFC]">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
