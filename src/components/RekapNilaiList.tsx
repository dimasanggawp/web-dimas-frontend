import React, { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/apiWrapper";
import { Users, AlertCircle, FileSpreadsheet, RefreshCw } from "lucide-react";

interface Materi {
    id: number;
    title: string;
}

interface Student {
    id: number;
    name: string;
    nisn: string;
    grades: { [materiId: string]: number | null };
}

interface RekapData {
    class_room: { id: number; name: string };
    materis: Materi[];
    students: Student[];
}

export default function RekapNilaiList() {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [rekapData, setRekapData] = useState<RekapData | null>(null);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch list of classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetchWithAuth("/api/class-rooms");
                if (res.ok) {
                    const data = await res.json();
                    setClasses(data);
                    if (data.length > 0) {
                        setSelectedClassId(data[0].id.toString());
                    }
                } else {
                    setError("Gagal memuat daftar kelas.");
                }
            } catch (err) {
                setError("Terjadi kesalahan jaringan.");
            } finally {
                setLoadingClasses(false);
            }
        };

        fetchClasses();
    }, []);

    // Fetch rekap data whenever selectedClassId changes
    useEffect(() => {
        if (!selectedClassId) return;

        const fetchData = async () => {
            setLoadingData(true);
            setError(null);
            setRekapData(null);
            try {
                const res = await fetchWithAuth(`/api/rekap-nilai/${selectedClassId}`);
                if (res.ok) {
                    const data = await res.json();
                    setRekapData(data);
                } else {
                    const errData = await res.json();
                    setError(errData.message || "Gagal memuat rekap nilai.");
                }
            } catch (err) {
                setError("Terjadi kesalahan jaringan.");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [selectedClassId]);

    const handleExport = () => {
        // Implementasi sederhana Export ke CSV
        if (!rekapData) return;

        const headers = ["Nama Siswa", "NISN", ...rekapData.materis.map(m => m.title)];
        const rows = rekapData.students.map(student => {
            return [
                student.name,
                student.nisn || "-",
                ...rekapData.materis.map(m => student.grades[m.id.toString()] !== undefined && student.grades[m.id.toString()] !== null ? student.grades[m.id.toString()] : "Belum")
            ];
        });

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Rekap_Nilai_${rekapData.class_room.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loadingClasses) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="sm:flex-auto flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold leading-6 text-slate-900">Rekap Nilai Siswa</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pilih kelas di bawah ini untuk melihat daftar nilai dari seluruh materi yang telah dikerjakan.
                        </p>
                    </div>
                </div>

                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-4">
                    <div className="w-64">
                        <label htmlFor="class-select" className="sr-only">Pilih Kelas</label>
                        <select
                            id="class-select"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-slate-50"
                        >
                            {classes.length === 0 && <option value="">Tidak ada kelas</option>}
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={!rekapData || loadingData || rekapData.students.length === 0}
                        className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download CSV"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Terdapat Kesalahan</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loadingData ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-slate-500">Memuat data rekap nilai...</p>
                </div>
            ) : rekapData ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6 w-16 whitespace-nowrap sticky left-0 z-10 bg-slate-50 border-r border-slate-200">
                                        No
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 whitespace-nowrap sticky left-16 z-10 bg-slate-50 shadow-[1px_0_0_0_#e2e8f0]">
                                        Nama Siswa
                                    </th>

                                    {rekapData.materis.map((materi) => (
                                        <th key={materi.id} scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-900 min-w-[120px]">
                                            <div className="truncate max-w-[150px] mx-auto" title={materi.title}>
                                                {materi.title}
                                            </div>
                                        </th>
                                    ))}

                                    {rekapData.materis.length === 0 && (
                                        <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-slate-500 italic">
                                            Belum ada materi untuk kelas ini
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {rekapData.students.length > 0 ? (
                                    rekapData.students.map((student, index) => (
                                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 sticky left-0 z-10 bg-inherit border-r border-slate-200">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900 font-medium sticky left-16 z-10 bg-inherit shadow-[1px_0_0_0_#e2e8f0]">
                                                {student.name}
                                                <div className="text-xs text-slate-500 font-normal">{student.nisn || '-'}</div>
                                            </td>

                                            {rekapData.materis.map((materi) => {
                                                const grade = student.grades[materi.id.toString()];
                                                const isGraded = grade !== undefined && grade !== null;

                                                return (
                                                    <td key={materi.id} className="whitespace-nowrap px-3 py-4 text-sm text-center">
                                                        {isGraded ? (
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${grade >= 80 ? 'bg-green-100 text-green-800' :
                                                                    grade >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}

                                            {rekapData.materis.length === 0 && (
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-center text-slate-400">
                                                    -
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={rekapData.materis.length + 2} className="whitespace-nowrap px-3 py-8 text-sm text-center text-slate-500">
                                            <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                            Tidak ada siswa yang terdaftar di kelas ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
