"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, User as UserIcon, FileText, Upload, CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import FormattedFeedback from "@/components/FormattedFeedback";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/apiWrapper";
import { getAuth } from "@/utils/auth";

interface Materi {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    created_at: string;
    deadline?: string | null;
    passing_grade?: number | null;
    rubrik_penilaian?: string | null;
    user: {
        name: string;
    };
}

interface Submission {
    id: number;
    file_path: string;
    submitted_at: string;
    grade?: number | null;
    feedback?: string | null;
}

export default function DetailMateri() {
    const params = useParams();
    const [materi, setMateri] = useState<Materi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    useEffect(() => {
        if (params?.slug) {
            // Reset states for the new materi
            setLoading(true);
            setMateri(null);
            setSubmission(null);
            setUploadError("");
            setUploadSuccess(false);
            setUploadFile(null);
            setError(false);

            const { user: userData } = getAuth();
            setUser(userData);

            fetchWithAuth(`/api/materi/${params.slug}`)
                .then(res => {
                    if (!res.ok) throw new Error("Not found");
                    return res.json();
                })
                .then(data => {
                    setMateri(data);
                    if (data.my_submission) {
                        setSubmission(data.my_submission);
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError(true);
                    setLoading(false);
                });
        }
    }, [params?.slug]);

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !materi) return;

        setUploading(true);
        setUploadError("");
        setUploadSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);

            const res = await fetchWithAuth(`/api/materi/${materi.id}/submit`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setUploadSuccess(true);
                setSubmission(data.data);
                setUploadFile(null);
            } else {
                setUploadError(data.message || "Gagal mengunggah tugas.");
            }
        } catch (err) {
            setUploadError("Terjadi kesalahan koneksi.");
        } finally {
            setUploading(false);
        }
    };

    // Polling effect for AI Grading
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkSubmission = async () => {
            if (!materi) return;
            try {
                const res = await fetchWithAuth(`/api/materi/${materi.id}/my-submission`);
                if (res.ok) {
                    const data = await res.json();
                    // Update if grade or feedback is now available
                    if (data && (data.grade !== null || data.feedback)) {
                        setSubmission(data);
                        clearInterval(intervalId);
                    }
                }
            } catch (err) {
                console.error("Error polling submission status:", err);
            }
        };

        // Start polling only if user has a submission but it's not graded yet
        if (submission && submission.grade === null && !submission.feedback && materi) {
            intervalId = setInterval(checkSubmission, 2000); // Check every 2 seconds
        }

        // Also re-fetch on window focus (if student tabs away and comes back)
        const handleFocus = () => {
            if (submission && submission.grade === null && !submission.feedback && materi) {
                checkSubmission();
            }
        };
        window.addEventListener('focus', handleFocus);

        return () => {
            if (intervalId) clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
        };
    }, [submission?.grade, submission?.feedback, materi?.id]);


    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !materi) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Materi Tidak Ditemukan</h2>
                    <p className="text-slate-600 mb-8">Maaf, materi yang Anda cari tidak tersedia atau telah dihapus.</p>
                    <Link href="/materi" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Kembali ke Daftar Materi
                    </Link>
                </div>
            </div>
        );
    }

    const date = new Date(materi.created_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb / Back Navigation */}
                    <div className="mb-8">
                        <Link href="/materi" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Daftar Materi
                        </Link>
                    </div>

                    <article className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                        {/* Hero Image */}
                        {materi.image && (
                            <div className="aspect-w-16 aspect-h-9 w-full h-[400px] relative overflow-hidden bg-slate-200">
                                <img
                                    src={materi.image.startsWith('http') ? materi.image : `/storage/${materi.image}`}
                                    alt={materi.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8 md:p-12">
                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-6 text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-4 h-4" />
                                    Ditulis oleh <span className="font-medium text-slate-900">{materi.user?.name}</span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                                {materi.title}
                            </h1>

                            {/* Content */}
                            <div
                                className="prose md:prose-lg prose-slate max-w-none text-slate-700 leading-relaxed overflow-hidden hyphens-auto break-words [&_img]:!w-full [&_img]:!h-auto [&_img]:!object-contain [&_iframe]:!w-full [&_video]:!w-full [&_table]:!w-full [&_table]:block [&_table]:overflow-x-auto [&_*]:max-w-full"
                                dangerouslySetInnerHTML={{ __html: materi.content.replace(/&nbsp;/g, ' ') }}
                            />

                            {/* Rubrik Penilaian */}
                            {materi.rubrik_penilaian && (
                                <div className="mt-12 pt-8 border-t border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Rubrik Penilaian
                                    </h3>
                                    <div
                                        className="prose md:prose-lg prose-slate max-w-none text-slate-600 bg-slate-50 p-6 rounded-xl border border-slate-200"
                                        dangerouslySetInnerHTML={{ __html: materi.rubrik_penilaian.replace(/&nbsp;/g, ' ') }}
                                    />
                                </div>
                            )}
                        </div>
                    </article>

                    {/* Assignment Submission Section */}
                    {/* Show for logged in non-admin users, OR show login prompt for guests */}
                    {(!user || user?.role?.name !== 'admin') && (
                        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Pengumpulan Tugas
                                </h3>
                                <div className="flex items-center gap-3 flex-wrap justify-end">
                                    {materi.passing_grade != null && (
                                        <div className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-blue-100 text-blue-800">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            KKM: {materi.passing_grade}
                                        </div>
                                    )}
                                    {materi.deadline && (
                                        <div className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${new Date() > new Date(materi.deadline)
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            Deadline: {new Date(materi.deadline).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8">
                                {!user ? (
                                    <div className="text-center py-6">
                                        <p className="text-slate-600 mb-4">Silakan login untuk mengumpulkan tugas.</p>
                                        <Link href="/login" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Login Sekarang
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        {(() => {
                                            const submissionGrade = submission?.grade;
                                            const passingGrade = materi.passing_grade;
                                            const hasFailed = submission && submissionGrade !== undefined && submissionGrade !== null && passingGrade != null && submissionGrade < passingGrade;
                                            const bgClass = hasFailed ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-100';
                                            const iconBgClass = hasFailed ? 'bg-yellow-100' : 'bg-green-100';
                                            const textTitleClass = hasFailed ? 'text-yellow-900' : 'text-green-900';
                                            const textDescClass = hasFailed ? 'text-yellow-700' : 'text-green-700';
                                            const textLinkClass = hasFailed ? 'text-yellow-800' : 'text-green-800';
                                            const borderClass = hasFailed ? 'border-yellow-200' : 'border-green-200';
                                            const feedbackClass = hasFailed ? 'text-yellow-800 border-yellow-200 bg-yellow-50/50' : 'text-green-800 border-green-100 bg-white/50';

                                            return (
                                                <>
                                                    {submission && (
                                                        <div className={`${bgClass} border rounded-xl p-6 flex items-start gap-4 mb-6`}>
                                                            <div className={`${iconBgClass} p-2 rounded-full`}>
                                                                {hasFailed ? (
                                                                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                                                                ) : (
                                                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className={`font-bold ${textTitleClass} mb-1`}>
                                                                    {hasFailed ? 'Pekerjaan Anda Perlu Perbaikan' : 'Tugas Sudah Dikumpulkan'}
                                                                </h4>
                                                                <p className={`text-sm ${textDescClass} mb-4`}>
                                                                    {hasFailed ? (
                                                                        `Nilai Anda belum mencapai Nilai Minimum / KKM (${passingGrade}). Silakan perbaiki sesuai feedback dan kumpulkan revisi.`
                                                                    ) : (
                                                                        `Anda telah berhasil mengumpulkan tugas pada ${new Date(submission.submitted_at).toLocaleString('id-ID')}.`
                                                                    )}
                                                                </p>
                                                                <a
                                                                    href={submission.file_path ? (submission.file_path.startsWith('http') ? submission.file_path : `/storage/${submission.file_path}`) : '#'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={`inline-flex items-center text-sm font-medium ${textLinkClass} hover:underline gap-1.5`}
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    Lihat File Anda
                                                                </a>

                                                                {submissionGrade == null && !submission.feedback && (
                                                                    <div className={`mt-4 pt-4 border-t ${borderClass} flex items-center gap-2`}>
                                                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                                                        <p className="text-sm font-medium text-blue-700">Sedang dinilai oleh AI... Mohon tunggu sebentar.</p>
                                                                    </div>
                                                                )}

                                                                {(submissionGrade != null || submission.feedback) && (
                                                                    <div className={`mt-4 pt-4 border-t ${borderClass}`}>
                                                                        {submissionGrade != null && (
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <p className={`text-sm font-bold ${textTitleClass}`}>Nilai Akhir: {submissionGrade} / 100</p>
                                                                                {passingGrade != null && (
                                                                                    <p className="text-xs font-semibold px-2 py-1 rounded bg-slate-200 text-slate-700">KKM: {passingGrade}</p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {submission.feedback && (
                                                                            <div className={`mt-2 text-sm ${feedbackClass} p-3 rounded-lg border`}>
                                                                                <span className="font-semibold block mb-1">Feedback AI:</span>
                                                                                <FormattedFeedback feedback={submission.feedback} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(!submission || hasFailed) && (
                                                        <>
                                                            {materi.deadline && new Date() > new Date(materi.deadline) ? (
                                                                <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-start gap-4 mt-6">
                                                                    <div className="bg-red-100 p-2 rounded-full">
                                                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-red-900 mb-1">Waktu Sudah Habis</h4>
                                                                        <p className="text-sm text-red-700">
                                                                            Maaf, Anda tidak dapat mengumpulkan {submission ? 'revisi ' : ''}tugas karena batas waktu sudah lewat.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <form onSubmit={handleFileUpload} className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                                                            {submission ? 'Upload File Revisi (PDF atau DOCX)' : 'Upload Laporan (PDF atau DOCX)'}
                                                                        </label>
                                                                        <div className="flex items-center justify-center w-full">
                                                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                                                    <p className="text-sm text-slate-500">
                                                                                        {uploadFile ? (
                                                                                            <span className="font-semibold text-primary">{uploadFile.name}</span>
                                                                                        ) : (
                                                                                            "Klik untuk memilih file"
                                                                                        )}
                                                                                    </p>
                                                                                    <p className="text-xs text-slate-400 mt-1">
                                                                                        PDF atau DOCX (Max 10MB)
                                                                                    </p>
                                                                                </div>
                                                                                <input
                                                                                    type="file"
                                                                                    className="hidden"
                                                                                    accept=".pdf,.doc,.docx"
                                                                                    onChange={(e) => {
                                                                                        if (e.target.files && e.target.files[0]) {
                                                                                            const file = e.target.files[0];
                                                                                            if (file.size > 10 * 1024 * 1024) {
                                                                                                setUploadError("Ukuran file maksimal 10MB.");
                                                                                                setUploadFile(null);
                                                                                            } else {
                                                                                                setUploadError("");
                                                                                                setUploadFile(file);
                                                                                            }
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            </label>
                                                                        </div>
                                                                    </div>

                                                                    {uploadError && (
                                                                        <div className="text-red-600 text-sm flex items-center gap-1.5">
                                                                            <AlertCircle className="w-4 h-4" />
                                                                            {uploadError}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex justify-end">
                                                                        <button
                                                                            type="submit"
                                                                            disabled={uploading || !uploadFile}
                                                                            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                                                                        >
                                                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                                            {submission ? 'Perbaiki Tugas' : 'Kumpulkan Tugas'}
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                        </>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
