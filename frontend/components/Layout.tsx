import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Shield, Search, Users, Upload, LogOut, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/upload', label: 'Search', icon: Search },
  { href: '/admin', label: 'Admin', icon: Upload, adminOnly: true },
  { href: '/cases', label: 'Cases', icon: Users },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink grid-bg flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col
        transform transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center glow-sm">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-text text-sm tracking-wide">REUNIFY AI</div>
            <div className="text-[10px] text-text-dim font-mono uppercase tracking-widest">
              Law Enforcement Portal
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, adminOnly }) => {
            if (adminOnly && user?.role !== 'admin') return null;
            const active = router.pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-text-dim hover:text-text hover:bg-panel'}`}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {user && (
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                <span className="text-accent text-xs font-bold">{user.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text truncate">{user.name}</div>
                <div className="text-[10px] text-text-dim uppercase tracking-wider">{user.role}</div>
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-dim hover:text-danger hover:bg-danger/10 transition-all">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur border-b border-border px-6 py-3 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden text-text-dim hover:text-text">
            <Menu size={20} />
          </button>
          <div className="flex-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-text-dim">SYSTEM ONLINE</span>
          </div>
          <div className="text-xs font-mono text-text-dim hidden sm:block">
            {new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
