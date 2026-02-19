import { useEffect, useState } from "react";
import { X, Loader2, Download, FileText, ExternalLink, User } from "lucide-react";
import { fetchWithAuth } from "@/utils/apiWrapper";

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full relative z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-primary" />
                                    Daftar Pengumpulan Tugas
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Materi: {materi?.title}</p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

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
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">File</th>
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
                                                        <span className="text-xs text-slate-500 flex items-center gap-1.5 truncate max-w-[150px]">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {sub.file_path.split('/').pop()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
