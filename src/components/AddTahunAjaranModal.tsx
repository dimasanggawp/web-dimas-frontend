"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getAuth } from "@/utils/auth";

interface TahunAjaran {
    id?: number;
    tahun: string;
    is_active: boolean;
}

interface AddTahunAjaranModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: TahunAjaran | null;
}

export default function AddTahunAjaranModal({ isOpen, onClose, onSuccess, initialData }: AddTahunAjaranModalProps) {
    const [tahun, setTahun] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialData) {
            setTahun(initialData.tahun);
            setIsActive(initialData.is_active);
        } else {
            setTahun("");
            setIsActive(false);
        }
        setError("");
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { token } = getAuth();
            const url = initialData
                ? `/api/tahun-ajaran/${initialData.id}`
                : "/api/tahun-ajaran";

            const res = await fetch(url, {
                method: initialData ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    tahun,
                    is_active: isActive ? 1 : 0
                }),
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Gagal menyimpan tahun ajaran.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {initialData ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun Pelajaran</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: 2024/2025"
                                    value={tahun}
                                    onChange={(e) => setTahun(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                    Set sebagai Aktif
                                </label>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm">{error}</div>
                            )}

                            <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
