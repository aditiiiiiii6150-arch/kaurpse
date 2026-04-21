import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "BASERA — Find rooms in Srinagar Garhwal",
  description:
    "A calm, classy way to discover rooms, PGs and shared accommodation in Srinagar (Garhwal). Verified listings, direct contact.",
};

export default function RootLayout({ children }) {
  // Read auth on the server so the navbar is correct on first paint
  let initialUser = null;
  try { initialUser = getCurrentUser(); } catch {}

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider initialUser={initialUser}>
          <ToastProvider>
            <HeaderNav />
            <main id="main-content" className="container-page flex-1 py-8 md:py-12">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
