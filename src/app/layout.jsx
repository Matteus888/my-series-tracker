import "../styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { SearchProvider } from "@/context/SearchContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "my series tracker",
  description: "Follow your favorites shows",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SearchProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
