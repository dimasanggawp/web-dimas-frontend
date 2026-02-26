"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Home, User, Menu, X, LogOut, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { getAuth, logout } from "@/utils/auth";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const { token } = getAuth();
        setIsLoggedIn(!!token);
    }, []);

    const closeMenu = () => setIsOpen(false);

    const ThemeToggleButton = ({ className = "" }: { className?: string }) => (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg transition-colors ${theme === "dark"
                ? "bg-slate-700 text-yellow-400 hover:bg-slate-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                } ${className}`}
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );

    return (
        <nav className="navbar-glass fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2" onClick={closeMenu}>
                            <BookOpen className="w-8 h-8" />
                            <span>SMK TKJ</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex space-x-1">
                        {[
                            { name: 'Home', href: '/', icon: Home, show: true },
                            { name: 'Materi', href: '/materi', icon: BookOpen, show: true },
                            { name: 'Profil', href: '/', icon: User, show: true },
                            { name: 'Dashboard Admin', href: '/dashboard', icon: BookOpen, show: isLoggedIn && getAuth().user?.role?.name === 'admin' },
                            { name: 'Dashboard Siswa', href: '/student-dashboard', icon: BookOpen, show: isLoggedIn && getAuth().user?.role?.name !== 'admin' },
                        ].map((item) => {
                            if (!item.show) return null;
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                                        ${isActive ? 'text-primary bg-primary/5' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-t-full"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden lg:flex items-center space-x-3">
                        {/* Theme Toggle */}
                        <ThemeToggleButton className="ring-1 ring-slate-200 shadow-sm" />

                        {isLoggedIn ? (
                            <button onClick={() => {
                                logout();
                                window.location.href = '/login';
                            }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors shadow-sm flex items-center gap-2 border border-red-100">
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <Link href="/login" className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-blue-600 rounded-lg hover:from-blue-600 hover:to-primary transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                Masuk / Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile: theme toggle + hamburger */}
                    <div className="lg:hidden flex items-center gap-2">
                        <ThemeToggleButton />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 hover:text-primary focus:outline-none p-2"
                        >
                            {isOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/' ? 'text-primary bg-blue-50' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                <span>Home</span>
                            </div>
                        </Link>
                        <Link
                            href="/materi"
                            onClick={closeMenu}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/materi' ? 'text-primary bg-blue-50' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                <span>Materi</span>
                            </div>
                        </Link>
                        <Link
                            href="/profil"
                            onClick={closeMenu}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/profil' ? 'text-primary bg-blue-50' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Profil</span>
                            </div>
                        </Link>

                        {isLoggedIn && getAuth().user?.role?.name === 'admin' && (
                            <Link
                                href="/dashboard"
                                onClick={closeMenu}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/dashboard' ? 'text-primary bg-blue-50' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </div>
                            </Link>
                        )}
                        {isLoggedIn && getAuth().user?.role?.name !== 'admin' && (
                            <Link
                                href="/student-dashboard"
                                onClick={closeMenu}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/student-dashboard' ? 'text-primary bg-blue-50' : 'text-slate-600 hover:text-primary hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </div>
                            </Link>
                        )}

                        <div className="pt-4 mt-2 border-t border-slate-100">
                            {isLoggedIn ? (
                                <button
                                    onClick={() => {
                                        closeMenu();
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 shadow-sm"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
