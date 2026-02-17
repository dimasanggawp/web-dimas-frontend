"use client";

import { useState } from "react";
import { X, Users } from "lucide-react";
import { getAuth } from "@/utils/auth";

interface UserData {
    id: number;
    name: string;
    email: string;
    role_id: number;
    class_room?: {
        id: number;
        name: string;
    };
    tahun_ajaran?: {
        id: number;
        tahun: string;
    };
}

interface BulkAssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedUsers: UserData[];
    classes: any[];
    academicYears: any[];
}

export default function BulkAssignModal({
    isOpen,
    onClose,
    onSuccess,
    selectedUsers,
    classes,
    academicYears
}: BulkAssignModalProps) {
    const [toClassId, setToClassId] = useState("");
    const [toAcademicYearId, setToAcademicYearId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!toClassId || !toAcademicYearId) {
            setError("Mohon lengkapi semua field");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { token } = getAuth();
            const res = await fetch("http://127.0.0.1:8000/api/users/bulk-assign", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_ids: selectedUsers.map(u => u.id),
                    to_class_id: toClassId,
                    to_tahun_ajaran_id: toAcademicYearId
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message || "Berhasil memindahkan siswa!");
                onSuccess();
                handleClose();
            } else {
                const error = await res.json();
                setError(error.error || "Gagal memindahkan siswa");
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setToClassId("");
        setToAcademicYearId("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Pindahkan {selectedUsers.length} Siswa
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Selected Students List */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Siswa yang dipilih:
                        </label>
                        <div className="border border-slate-200 rounded-md max-h-48 overflow-y-auto">
                            <ul className="divide-y divide-slate-200">
                                {selectedUsers.map(user => (
                                    <li key={user.id} className="px-4 py-2 hover:bg-slate-50 text-sm">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="font-medium text-slate-900">{user.name}</span>
                                                <span className="text-slate-500 ml-2">({user.email})</span>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {user.class_room?.name || '-'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Target Class */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Ke Kelas <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={toClassId}
                            onChange={(e) => setToClassId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isLoading}
                        >
                            <option value="">Pilih kelas tujuan</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tahun Pelajaran <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={toAcademicYearId}
                            onChange={(e) => setToAcademicYearId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isLoading}
                        >
                            <option value="">Pilih tahun pelajaran</option>
                            {academicYears.map(y => (
                                <option key={y.id} value={y.id}>{y.tahun}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                        <strong>Info:</strong> {selectedUsers.length} siswa yang dipilih akan dipindahkan ke kelas tujuan dengan tahun pelajaran yang dipilih.
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>Loading...</>
                        ) : (
                            <>
                                <Users className="h-4 w-4 mr-2" />
                                Pindahkan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
