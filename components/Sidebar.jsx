'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Package, X, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import { useState } from 'react';

export default function Sidebar({ isMobileOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard 
    },
    { 
      href: '/lantai/1', 
      label: 'Lantai 1', 
      icon: Building2 
    },
    { 
      href: '/lantai/2', 
      label: 'Lantai 2', 
      icon: Building2 
    },
    { 
      href: '/lantai/3', 
      label: 'Lantai 3', 
      icon: Building2 
    },
  ];

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
  const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
  
    if (confirmLogout) {
      setIsLoggingOut(true);
      Cookies.remove('user');
      
      setTimeout(() => {
        router.push('/login');
        setIsLoggingOut(false);
      }, 500);
    }
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Package size={28} />
          <span>BPJS Asset</span>
        </div>
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="sidebar-footer">
        <button 
          onClick={handleLogout}
          className="logout-button"
          disabled={isLoggingOut}
        >
          <LogOut size={20} />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}