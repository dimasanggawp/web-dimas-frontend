"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { LucideLayoutDashboard, LogOut, Plus, Users, BookOpen, Calendar, LayoutList, Settings } from "lucide-react";
import UserList from "@/components/UserList";
import MateriList from "@/components/MateriList";
import TahunAjaranList from "@/components/TahunAjaranList";
import ClassList from "@/components/ClassList";
import SettingsPanel from "@/components/SettingsPanel";
import RekapNilaiList from "@/components/RekapNilaiList";
import { getAuth } from "@/utils/auth";
import { fetchWithAuth } from "@/utils/apiWrapper";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'materi' | 'tahun-ajaran' | 'classes' | 'settings'
    const [stats, setStats] = useState({ total_materi: 0 });
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

    useEffect(() => {
        const { token, user: userData } = getAuth();

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        if (userData.role?.name !== 'admin') {
            router.push("/student-dashboard");
            return;
        }

        setUser(userData);
        setLoading(false);

        // Fetch simple stats
        fetchWithAuth("/api/materi")
            .then(res => res.json())
            .then(data => setStats({ total_materi: data.length }))
            .catch(err => console.error(err));

    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="flex flex-1 pt-16">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    isOpenMobile={isSidebarOpenMobile}
                    setIsOpenMobile={setIsSidebarOpenMobile}
                />

                <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-4 sm:p-6 lg:p-8`}>
                    <div className="max-w-7xl mx-auto">
                        {/* Mobile sidebar toggle button (visible only on mobile) */}
                        <div className="lg:hidden mb-6 flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpenMobile(true)}
                                className="p-2 -ml-2 rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                            >
                                <span className="sr-only">Open sidebar</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold leading-7 text-slate-900 truncate">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'materi' && 'Manajemen Materi'}
                                {activeTab === 'users' && 'Manajemen User'}
                                {activeTab === 'classes' && 'Manajemen Kelas'}
                                {activeTab === 'tahun-ajaran' && 'Tahun Ajaran'}
                                {activeTab === 'rekap-nilai' && 'Rekap Nilai Siswa'}
                                {activeTab === 'settings' && 'Pengaturan'}
                            </h2>
                        </div>

                        <div className="hidden lg:block mb-6">
                            <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'materi' && 'Manajemen Materi'}
                                {activeTab === 'users' && 'Manajemen User'}
                                {activeTab === 'classes' && 'Manajemen Kelas'}
                                {activeTab === 'tahun-ajaran' && 'Tahun Ajaran'}
                                {activeTab === 'rekap-nilai' && 'Rekap Nilai Siswa'}
                                {activeTab === 'settings' && 'Pengaturan'}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Selamat datang kembali, {user?.name}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[500px]">
                            {activeTab === "overview" && (
                                <>
                                    {/* Dashboard Stats or Content Placeholder */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {/* Card 1 */}
                                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                                                    <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 truncate">Total Materi</p>
                                                    <p className="text-2xl font-bold text-slate-900">{stats.total_materi}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-slate-200">
                                                <button onClick={() => setActiveTab("materi")} className="text-sm font-medium text-primary hover:underline">
                                                    Lihat detail &rarr;
                                                </button>
                                            </div>
                                        </div>
                                        {/* Add more cards as needed */}
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Aksi Cepat</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <button
                                                onClick={() => setActiveTab("materi")}
                                                type="button"
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 hover:shadow transition-all"
                                            >
                                                <Plus className="h-5 w-5" aria-hidden="true" />
                                                Buat Materi Baru
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("users")}
                                                type="button"
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:shadow transition-all"
                                            >
                                                <Users className="h-5 w-5 text-slate-400" aria-hidden="true" />
                                                Tambah User
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === "users" && <UserList />}
                            {activeTab === "materi" && <MateriList />}
                            {activeTab === "tahun-ajaran" && <TahunAjaranList />}
                            {activeTab === "classes" && <ClassList />}
                            {activeTab === "rekap-nilai" && <RekapNilaiList />}
                            {activeTab === "settings" && <SettingsPanel />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
