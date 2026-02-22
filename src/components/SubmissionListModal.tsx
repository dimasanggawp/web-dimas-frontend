import { useEffect, useState } from "react";
import { X, Loader2, Download, FileText, ExternalLink, User, Trash2 } from "lucide-react";
import { fetchWithAuth } from "@/utils/apiWrapper";
import FormattedFeedback from "./FormattedFeedback";

interface Submission {
    id: number;
    user_id: number;
    file_path: string;
    submitted_at: string;
    grade?: number | null;
    feedback?: string | null;
    user: {
        id: number;
        name: string;
        nisn: string;
    };
}

interface SubmissionListModalProps {
    isOpen: boolean;
    onClose: () => void;
    materi: any;
}

export default function SubmissionListModal({ isOpen, onClose, materi }: SubmissionListModalProps) {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && materi) {
            fetchSubmissions();
        }
    }, [isOpen, materi]);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetchWithAuth(`/api/materi/${materi.id}/submissions`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            } else {
                setError("Gagal mengambil daftar tugas.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmissionsQuietly = async () => {
        try {
            const res = await fetchWithAuth(`/api/materi/${materi.id}/submissions`);
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error("Error polling submissions quietly:", err);
        }
    };

    // Polling effect for AI Grading
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        // Check if there are any submissions currently being graded
        const hasUngradedSubmissions = submissions.some(sub => sub.grade === null && !sub.feedback);

        if (isOpen && materi && hasUngradedSubmissions) {
            intervalId = setInterval(() => {
                fetchSubmissionsQuietly();
            }, 3000); // Check every 3 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isOpen, materi, submissions]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus laporan ini? Status siswa akan dikembalikan menjadi 'Belum Mengerjakan'.")) {
            return;
        }

        setDeletingId(id);
        try {
            const res = await fetchWithAuth(`/api/submissions/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state to update UI instantly
                setSubmissions(prev => prev.filter(s => s.id !== id));
            } else {
                alert("Gagal menghapus laporan.");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi.");
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto w-full">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[95vw] sm:max-w-[90vw] text-left overflow-hidden transform transition-all flex flex-col h-[90vh]">
                    {/* Header - Fixed Component */}
                    <div className="flex-shrink-0 bg-white px-4 pt-5 pb-4 sm:px-6 border-b border-slate-100">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-primary" />
                                    Daftar Pengumpulan Tugas
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Materi: {materi?.title}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body - Scrollable Area */}
                    <div className="flex-1 overflow-y-auto bg-white p-4 sm:p-6 custom-scrollbar">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                                <p>Memuat daftar tugas...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center text-red-600">{error}</div>
                        ) : submissions.length === 0 ? (
                            <div className="py-20 text-center text-slate-500 italic flex flex-col items-center">
                                <FileText className="h-12 w-12 text-slate-300 mb-4" />
                                <p>Belum ada siswa yang mengumpulkan tugas.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Siswa</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">NISN</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Waktu Kumpul</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">File</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Nilai AI</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Feedback AI</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-100">
                                        {submissions.map((sub) => {
                                            const isLate = materi.deadline && new Date(sub.submitted_at) > new Date(materi.deadline);
                                            return (
                                                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                                <User className="h-4 w-4 text-slate-500" />
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-900">{sub.user.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                        {sub.user.nisn}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-medium text-slate-900">
                                                                {new Date(sub.submitted_at).toLocaleString('id-ID', {
                                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                })}
                                                            </span>
                                                            {isLate && (
                                                                <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider mt-0.5">TERLAMBAT</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <a href={`/storage/${sub.file_path}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 truncate max-w-[120px]" title={sub.file_path.split('/').pop()}>
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {sub.file_path.split('/').pop()}
                                                        </a>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {sub.grade !== null ? (
                                                            <span className="text-sm font-bold text-green-700">{sub.grade} / 100</span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1.5 w-full min-w-[100px]">
                                                                <div className="flex items-center text-xs font-bold text-blue-700">
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                                    Sedang diproses...
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-normal min-w-[300px]">
                                                        {sub.grade !== null ? (
                                                            <div className="text-sm text-slate-800 leading-relaxed max-w-[500px]">
                                                                <FormattedFeedback feedback={sub.feedback} />
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-400 italic">Menunggu penilaian AI...</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <button
                                                                onClick={() => handleDelete(sub.id)}
                                                                disabled={deletingId === sub.id}
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                                title="Hapus Laporan"
                                                            >
                                                                {deletingId === sub.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                            <a
                                                                href={`/storage/${sub.file_path}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                                Buka File
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
