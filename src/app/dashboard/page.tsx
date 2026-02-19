"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { LucideLayoutDashboard, LogOut, Plus, Users, BookOpen, Calendar, LayoutList } from "lucide-react";
import UserList from "@/components/UserList";
import MateriList from "@/components/MateriList";
import TahunAjaranList from "@/components/TahunAjaranList";
import ClassList from "@/components/ClassList";
import { getAuth } from "@/utils/auth";
import { fetchWithAuth } from "@/utils/apiWrapper";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'materi' | 'tahun-ajaran' | 'classes'
    const [stats, setStats] = useState({ total_materi: 0 });

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
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
                <div className="lg:flex lg:items-center lg:justify-between mb-8">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            Dashboard
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Selamat datang kembali, {user?.name}
                        </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 lg:ml-4 lg:mt-0">
                        <button
                            type="button"
                            onClick={() => setActiveTab("materi")}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${activeTab === 'materi' ? 'bg-primary text-white focus-visible:outline-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <BookOpen className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Manajemen Materi
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("tahun-ajaran")}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${activeTab === 'tahun-ajaran' ? 'bg-primary text-white focus-visible:outline-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Calendar className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Tahun Ajaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("classes")}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${activeTab === 'classes' ? 'bg-primary text-white focus-visible:outline-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <LayoutList className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Manajemen Kelas
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("users")}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${activeTab === 'users' ? 'bg-primary text-white focus-visible:outline-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Users className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Manajemen User
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("overview")}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${activeTab === 'overview' ? 'bg-primary text-white focus-visible:outline-primary' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                            <LucideLayoutDashboard className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                            Overview
                        </button>
                    </div>
                </div>

                {activeTab === "overview" && (
                    <>
                        {/* Dashboard Stats or Content Placeholder */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Card 1 */}
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <LucideLayoutDashboard className="h-6 w-6 text-slate-400" aria-hidden="true" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-slate-500 truncate">Total Materi</dt>
                                                <dd>
                                                    <div className="text-lg font-medium text-slate-900">{stats.total_materi}</div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-5 py-3">
                                    <div className="text-sm">
                                        <button onClick={() => setActiveTab("materi")} className="font-medium text-primary hover:text-blue-900">
                                            Lihat semua
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* Add more cards as needed */}
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium leading-6 text-slate-900">Aksi Cepat</h3>
                            </div>

                            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
                                <button
                                    onClick={() => setActiveTab("materi")}
                                    type="button"
                                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                >
                                    <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Kelola Materi
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "users" && (
                    <UserList />
                )}

                {activeTab === "materi" && (
                    <MateriList />
                )}

                {activeTab === "tahun-ajaran" && (
                    <TahunAjaranList />
                )}

                {activeTab === "classes" && (
                    <ClassList />
                )}

            </main>
        </div>
    );
}
