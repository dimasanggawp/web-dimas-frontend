"use client";

import { useState, useRef } from "react";
import { X, Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getAuth } from "@/utils/auth";

interface ImportUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ImportResult {
    imported: number;
    skipped: number;
    errors: string[];
}

export default function ImportUserModal({ isOpen, onClose, onSuccess }: ImportUserModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const { token } = getAuth();
            const res = await fetch("/api/users/import-template", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Gagal mendownload template");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "template_import_user_v2.xlsx"; // Default filename
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            setError("Gagal mendownload template.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Silakan pilih file Excel terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const { token } = getAuth();
            const res = await fetch("/api/users/import", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                // Don't close immediately so user can see the result
                // onSuccess(); // Refresh parent list
            } else {
                setError(data.message || "Gagal mengimport data.");
                if (data.errors) {
                    setResult({ imported: 0, skipped: 0, errors: data.errors });
                }
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (result && result.imported > 0) {
            onSuccess(); // Refresh only when closing if success occurred
        }
        setFile(null);
        setResult(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Import User dari Excel</h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {!result ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-md border border-blue-100 mb-4">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Petunjuk Import
                                    </h4>
                                    <ul className="list-disc list-inside text-xs text-blue-700 space-y-1 ml-1">
                                        <li>Gunakan template yang disediakan.</li>
                                        <li>Kolom wajib: <strong>Nama, Email, Password, Kelas (Optional), Tahun Ajaran (Optional), NISN (Optional), No HP (Optional)</strong>.</li>
                                        <li>Role user otomatis diset sebagai <strong>User (Siswa)</strong>.</li>
                                        <li>Email duplikat akan dilewati (skipped).</li>
                                    </ul>
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="mt-3 flex items-center text-xs font-medium text-blue-700 hover:text-blue-900 underline"
                                    >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download Template Excel
                                    </button>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
                                    <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-2" />
                                    <div className="mt-2 flex text-sm text-gray-600">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none">
                                            <span>Upload file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                accept=".xlsx, .xls"
                                                className="sr-only"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">atau drag & drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">Excel file (.xlsx, .xls) up to 2MB</p>
                                    {file && (
                                        <p className="mt-2 text-sm font-medium text-gray-900">
                                            Selected: {file.name}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="text-red-600 text-sm">{error}</div>
                                )}

                                <div className="mt-5 sm:mt-6 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !file}
                                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                Mengimport...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5 mr-2" />
                                                Mulai Import
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-md border ${result.errors && result.errors.length > 0 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                                    <div className="flex items-center mb-2">
                                        <CheckCircle className={`h-5 w-5 mr-2 ${result.errors && result.errors.length > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                                        <h4 className={`text-sm font-medium ${result.errors && result.errors.length > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                                            Proses Import Selesai
                                        </h4>
                                    </div>
                                    <ul className="list-disc list-inside text-sm space-y-1 ml-1 text-gray-700">
                                        <li>Berhasil diimport: <strong>{result.imported}</strong> user</li>
                                        <li>Dilewati (Duplikat/Error): <strong>{result.skipped}</strong> user</li>
                                    </ul>
                                </div>

                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-medium text-red-800 mb-2">Detail Error:</h5>
                                        <div className="bg-red-50 border border-red-100 rounded-md p-3 max-h-40 overflow-y-auto">
                                            <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                                                {result.errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5 sm:mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
