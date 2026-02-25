"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { getAuth } from "@/utils/auth";
import { fetchWithAuth } from "@/utils/apiWrapper";
import Link from "next/link";

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [allMateris, setAllMateris] = useState<any[]>([]);

    useEffect(() => {
        const { token, user: userData } = getAuth();

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        // Redirect admin back to admin dashboard
        if (userData.role?.name === 'admin') {
            router.push("/dashboard");
            return;
        }

        setUser(userData);
        fetchPendingTasks();
        fetchAllMateris();
        setLoading(false);
    }, [router]);

    const fetchPendingTasks = async () => {
        try {
            const res = await fetchWithAuth("/api/materi/pending-tasks");
            if (res.ok) {
                const data = await res.json();
                console.log("PENDING TASKS API RESPONSE:", data);
                setPendingTasks(data);
            }
        } catch (err) {
            console.error("Gagal mengambil tugas tertunda", err);
        }
    };

    const fetchAllMateris = async () => {
        try {
            const res = await fetchWithAuth("/api/materi");
            if (res.ok) {
                const data = await res.json();
                // Take only top 5 for dashboard
                setAllMateris(data.slice(0, 5));
            }
        } catch (err) {
            console.error("Gagal mengambil semua materi", err);
        }
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
                            Dashboard Siswa
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Selamat datang kembali, {user?.name}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Materi Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">Materi Pembelajaran</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-slate-900">Akses Materi</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-5 py-3">
                            <div className="text-sm">
                                <Link href="/materi" className="font-medium text-primary hover:text-blue-900">
                                    Lihat semua materi &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Class Info Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <GraduationCap className="h-6 w-6 text-green-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">Kelas</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-slate-900">{user.class_room?.name || '-'}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Year Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                    <Calendar className="h-6 w-6 text-purple-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">Tahun Ajaran</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-slate-900">{user.tahun_ajaran?.tahun || '-'}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Tasks Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow border-l-4 border-red-500">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                    <Clock className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-slate-500 truncate">Tugas Belum Dikerjakan</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-slate-900">{pendingTasks.length} Tugas</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Tasks List */}
                {pendingTasks.length > 0 && (
                    <div className="mt-8 bg-white shadow sm:rounded-lg overflow-hidden border border-red-100">
                        <div className="px-4 py-5 sm:px-6 bg-red-50 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-red-600" />
                            <h3 className="text-lg font-bold text-red-900">
                                Daftar Tugas Belum Dikerjakan
                            </h3>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {pendingTasks.map((task) => (
                                <li key={task.id} className="hover:bg-slate-50 transition-colors">
                                    <Link href={`/materi/${task.slug}`} className="block px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {task.title}
                                                </p>
                                                <div className="mt-1 flex items-center gap-3">
                                                    {task.passing_grade != null && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                            KKM: {task.passing_grade}
                                                        </span>
                                                    )}
                                                    <p className="text-xs text-slate-500">
                                                        {task.deadline ? (
                                                            <>Deadline: {new Date(task.deadline).toLocaleString('id-ID', {
                                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}</>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Tidak ada tenggat waktu</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Kerjakan Sekarang
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Materi Terbaru List */}
                <div className="mt-8 bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 bg-blue-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h3 className="text-lg font-bold text-slate-900">
                                Materi Pembelajaran Terbaru
                            </h3>
                        </div>
                        <Link href="/materi" className="text-sm font-medium text-primary hover:text-blue-800">
                            Lihat Semua &rarr;
                        </Link>
                    </div>
                    {allMateris.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {allMateris.map((m) => (
                                <li key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <Link href={`/materi/${m.slug}`} className="block px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                    {m.title}
                                                </p>
                                                <div className="mt-1 flex items-center gap-4">
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(m.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                    {m.passing_grade != null && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                                            KKM: {m.passing_grade}
                                                        </span>
                                                    )}
                                                    {m.deadline && (
                                                        <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                                                            <Calendar className="h-3 w-3" />
                                                            Deadline: {new Date(m.deadline).toLocaleString('id-ID', {
                                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex items-center gap-3">
                                                {m.needs_improvement ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Perlu Perbaikan
                                                    </span>
                                                ) : m.is_submitted ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Selesai
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        Belum Dikerjakan
                                                    </span>
                                                )}
                                                <span className="text-primary text-sm font-medium">Buka Materi &rarr;</span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-6 py-10 text-center text-slate-500 italic">
                            Belum ada materi pembelajaran yang tersedia untuk kelas Anda.
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-slate-900">
                            Informasi Siswa
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Detail data diri Anda.
                        </p>
                    </div>
                    <div className="border-t border-slate-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-slate-200">
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-slate-500">Nama Lengkap</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-slate-500">NISN</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.nisn || '-'}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-slate-500">Email</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-slate-500">Nomor HP</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">{user.nomor_hp || '-'}</dd>
                            </div>
                            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-slate-500">Status</dt>
                                <dd className="mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'aktif' ? 'bg-green-100 text-green-800' :
                                        user.status === 'tidak_aktif' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.status === 'aktif' ? 'Aktif' : user.status === 'tidak_aktif' ? 'Tidak Aktif' : user.status}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </main>
        </div>
    );
}
