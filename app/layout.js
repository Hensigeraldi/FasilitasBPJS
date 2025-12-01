'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Menu, Package } from 'lucide-react';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // 🔥 TAMBAHKAN INI: Cek apakah halaman login
  const isLoginPage = pathname === '/login';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar when clicking on overlay (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && window.innerWidth <= 1024) {
        const sidebar = document.querySelector('.sidebar');
        const mobileHeader = document.querySelector('.mobile-header');
        
        if (sidebar && !sidebar.contains(event.target) && 
            mobileHeader && !mobileHeader.contains(event.target)) {
          closeSidebar();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // 🔥 UBAH RETURN: Conditional rendering untuk login page
  return (
    <html lang="id">
      <body className={inter.variable}>
        {isLoginPage ? (
          // ✅ Halaman Login: Tanpa sidebar dan layout
          children
        ) : (
          // ✅ Halaman Lain: Dengan sidebar dan layout
          <div className="admin-layout">
            <Sidebar isMobileOpen={isSidebarOpen} onClose={closeSidebar} />
            
            <div className="main-content">
              {/* Mobile Header */}
              <header className="mobile-header">
                <div className="mobile-header-content">
                  <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                    <span>Menu</span>
                  </button>
                  <div className="sidebar-logo">
                    <Package size={24} />
                    <span>BPJS Asset</span>
                  </div>
                  <div style={{ width: '72px' }}></div>
                </div>
              </header>

              {/* Main Content */}
              <div className="content-wrapper">
                {children}
              </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
              <div 
                className="mobile-overlay"
                onClick={closeSidebar}
              />
            )}
          </div>
        )}
      </body>
    </html>
  );
}