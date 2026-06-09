import "../styles/globals.css";
import { Outfit, Roboto, Rubik } from "next/font/google";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { APP_NAME } from "@/lib/constants/app.constants";
import NavigationProgress from "@/components/layout/NavigationProgress/NavigationProgress";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: APP_NAME,
    template: `%s - ${APP_NAME}`,
  },
  description: "Follow your favorites shows",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${roboto.variable} ${rubik.variable}`}>
        <Providers>
          <NavigationProgress />
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
