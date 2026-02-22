"use client";

import React, { useState } from "react";
import {
    LucideLayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    LayoutList,
    Settings,
    ChevronLeft,
    ChevronRight,
    Home,
    LogOut
} from "lucide-react";
import { logout } from "@/utils/auth";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpenMobile?: boolean;
    setIsOpenMobile?: (isOpen: boolean) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpenMobile, setIsOpenMobile, isCollapsed, setIsCollapsed }: SidebarProps) {



    const menuItems = [
        { id: "overview", label: "Overview", icon: LucideLayoutDashboard },
        { id: "materi", label: "Manajemen Materi", icon: BookOpen },
        { id: "users", label: "Manajemen User", icon: Users },
        { id: "classes", label: "Manajemen Kelas", icon: LayoutList },
        { id: "tahun-ajaran", label: "Tahun Ajaran", icon: Calendar },
        { id: "settings", label: "Pengaturan", icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpenMobile && setIsOpenMobile && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                    onClick={() => setIsOpenMobile(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-[60] flex flex-col ${isCollapsed ? "lg:w-20" : "lg:w-64"
                    } ${isOpenMobile ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"
                    }`}
            >



                {/* Header / Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
                        <div className="bg-primary rounded-lg p-1.5">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white truncate">Admin Panel</span>
                    </div>

                    {isCollapsed && (
                        <div className="flex-1 flex justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1 custom-scrollbar">

                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
                                    {item.label}
                                </span>

                                {/* Active indicator dot */}
                                {isActive && (
                                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                )}

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-14 bg-slate-900 text-white px-2.5 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
                                        {item.label}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 overflow-hidden">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group relative"
                    >

                        <Home className="w-5 h-5 group-hover:text-primary transition-colors" />
                        <span className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
                            Kembali Beranda
                        </span>
                        {isCollapsed && (
                            <div className="absolute left-14 bg-slate-900 text-white px-2.5 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Beranda
                            </div>
                        )}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors group relative"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"}`}>
                            Logout
                        </span>
                        {isCollapsed && (
                            <div className="absolute left-14 bg-slate-900 text-white px-2.5 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Logout
                            </div>
                        )}
                    </button>
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md hover:bg-primary hover:text-white transition-colors z-[70] hidden lg:block"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
            </aside>

        </>
    );
}
