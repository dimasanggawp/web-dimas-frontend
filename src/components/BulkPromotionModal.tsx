"use client";

import { useState } from "react";
import { X, ArrowRightCircle } from "lucide-react";
import { getAuth } from "@/utils/auth";

interface BulkPromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classes: any[];
    academicYears: any[];
}

export default function BulkPromotionModal({
    isOpen,
    onClose,
    onSuccess,
    classes,
    academicYears
}: BulkPromotionModalProps) {
    const [fromClassId, setFromClassId] = useState("");
    const [toClassId, setToClassId] = useState("");
    const [toAcademicYearId, setToAcademicYearId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!fromClassId || !toClassId || !toAcademicYearId) {
            setError("Mohon lengkapi semua field");
            return;
        }

        if (fromClassId === toClassId) {
            setError("Kelas asal dan tujuan tidak boleh sama");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const { token } = getAuth();
            const res = await fetch("http://127.0.0.1:8000/api/users/bulk-promote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    from_class_id: fromClassId,
                    to_class_id: toClassId,
                    to_tahun_ajaran_id: toAcademicYearId
                })
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message || "Kenaikan kelas berhasil!");
                onSuccess();
                handleClose();
            } else {
                const error = await res.json();
                setError(error.error || "Gagal menaikkan kelas");
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFromClassId("");
        setToClassId("");
        setToAcademicYearId("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Kenaikan Kelas Massal
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Dari Kelas <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={fromClassId}
                            onChange={(e) => setFromClassId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={isLoading}
                        >
                            <option value="">Pilih kelas asal</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-center text-slate-400">
                        <ArrowRightCircle className="h-6 w-6" />
                    </div>

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

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tahun Pelajaran Baru <span className="text-red-500">*</span>
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
                        <strong>Info:</strong> Semua siswa di kelas asal akan dipindahkan ke kelas tujuan dengan tahun pelajaran baru.
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
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
                                <ArrowRightCircle className="h-4 w-4 mr-2" />
                                Naikkan Kelas
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
