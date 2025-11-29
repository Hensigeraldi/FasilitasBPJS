import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Digitalisasi Aset BPJS Ketenagakerjaan Manado",
  description: "Sistem Manajemen Aset Digital",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        <div className="admin-layout">
          <Sidebar />
          <main className="main-content">
            <div className="content-wrapper">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}