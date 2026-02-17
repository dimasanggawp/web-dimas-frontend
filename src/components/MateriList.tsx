"use client";

import { useEffect, useState } from "react";
import { BookOpen, Edit, Trash2, Plus } from "lucide-react";
import AddMateriModal from "./AddMateriModal";
import { getAuth } from "@/utils/auth";

interface Materi {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    created_at: string;
    user: {
        name: string;
    };
}

export default function MateriList() {
    const [materis, setMateris] = useState<Materi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchMateri = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/materi");
            if (res.ok) {
                const data = await res.json();
                setMateris(data);
            }
        } catch (error) {
            console.error("Failed to fetch materi", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMateri();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus materi ini?")) return;

        try {
            const { token } = getAuth();
            const res = await fetch(`http://127.0.0.1:8000/api/materi/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchMateri();
            } else {
                alert("Gagal menghapus materi.");
            }
        } catch (error) {
            alert("Terjadi kesalahan.");
        }
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-900">
                        Manajemen Materi
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Daftar materi pembelajaran.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Tambah Materi
                </button>
            </div>

            <div className="border-t border-slate-200">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Memuat data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Judul
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Penulis
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Tanggal Dibuat
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {materis.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-slate-500 italic">
                                            Belum ada materi.
                                        </td>
                                    </tr>
                                ) : (
                                    materis.map((materi) => (
                                        <tr key={materi.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-primary">
                                                            <BookOpen className="h-6 w-6" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900">{materi.title}</div>
                                                        <div className="text-sm text-slate-500 truncate max-w-xs">{materi.slug}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900">{materi.user?.name || 'Unknown'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {new Date(materi.created_at).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {/* <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    <Edit className="h-5 w-5" />
                                                </button> */}
                                                <button
                                                    onClick={() => handleDelete(materi.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddMateriModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchMateri}
            />
        </div>
    );
}
