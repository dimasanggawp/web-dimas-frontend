"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Calendar } from "lucide-react";
import { getAuth } from "@/utils/auth";
import AddTahunAjaranModal from "./AddTahunAjaranModal";

interface TahunAjaran {
    id: number;
    tahun: string;
    is_active: boolean;
    created_at: string;
}

export default function TahunAjaranList() {
    const [data, setData] = useState<TahunAjaran[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<TahunAjaran | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { token } = getAuth();
            const res = await fetch("/api/tahun-ajaran", {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const result = await res.json();
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch tahun ajaran", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus tahun ajaran ini?")) return;

        try {
            const { token } = getAuth();
            const res = await fetch(`/api/tahun-ajaran/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchData();
            } else {
                alert("Gagal menghapus data");
            }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleEdit = (item: TahunAjaran) => {
        setSelectedData(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedData(null);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-slate-900">
                        Manajemen Tahun Ajaran
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Atur tahun pelajaran aktif untuk sistem.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Tahun Ajaran
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Tahun Pelajaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Dibuat Pada
                                    </th>
                                    <th className="relative px-6 py-3">
                                        <span className="sr-only">Aksi</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 text-slate-400 mr-3" />
                                                <span className="text-sm font-medium text-slate-900">{item.tahun}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.is_active ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                                                    Tidak Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(item.created_at).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(item)} className="text-primary hover:text-blue-900 mr-4">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                                            Belum ada data tahun ajaran.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddTahunAjaranModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                initialData={selectedData}
            />
        </div>
    );
}
