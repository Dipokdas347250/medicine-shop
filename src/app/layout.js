import { Noto_Sans_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import QuickView from "@/components/QuickView";
import Toaster from "@/components/Toaster";
import ThemeSync from "@/components/ThemeSync";

// Covers the ৳ (taka) sign, which the Latin font lacks.
const bengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "MediCare — Online Pharmacy",
    template: "%s | MediCare Pharmacy",
  },
  description: "Order genuine medicines, vitamins, baby care and medical devices online with fast home delivery.",
};

// Applies the saved theme before paint to avoid a light/dark flash.
const themeScript = `try{var s=JSON.parse(localStorage.getItem("medicare-store-v1")||"{}");if(s.theme==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${bengali.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeSync />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <QuickView />
        <Toaster />
      </body>
    </html>
  );
}
