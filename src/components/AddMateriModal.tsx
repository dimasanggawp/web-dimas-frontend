import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { fetchWithAuth } from "@/utils/apiWrapper";
import RichTextEditor from "./RichTextEditor";

interface AddMateriModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMateriModal({ isOpen, onClose, onSuccess }: AddMateriModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [rubrik, setRubrik] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [deadline, setDeadline] = useState("");
    const [passingGrade, setPassingGrade] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchWithAuth("/api/class-rooms")
                .then(res => res.json())
                .then(data => setClasses(data))
                .catch(err => console.error("Gagal mengambil data kelas", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('rubrik_penilaian', rubrik);
            if (deadline) {
                formData.append('deadline', deadline);
            }
            if (passingGrade) {
                formData.append('passing_grade', passingGrade);
            }
            selectedClasses.forEach(id => {
                formData.append('class_room_ids[]', id.toString());
            });
            if (image) {
                formData.append('image', image);
            }

            const res = await fetchWithAuth("/api/materi", {
                method: "POST",
                // Headers handled by wrapper, multipart handled by browser
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setTitle("");
                setContent("");
                setRubrik("");
                setImage(null);
                setDeadline("");
                setPassingGrade("");
                setSelectedClasses([]);
                onSuccess();
                onClose();
            } else {
                let errMsg = data.message || "Gagal membuat materi.";
                if (data.errors) {
                    const validationErrors = Object.values(data.errors).flat().join(", ");
                    errMsg = `Validasi: ${validationErrors}`;
                } else if (data.error) {
                    errMsg = `Error: ${data.error}`;
                }
                setError(errMsg);
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto w-full">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

                <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[95vw] sm:max-w-4xl text-left overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
                    <div className="flex-shrink-0 bg-white px-4 pt-5 pb-4 sm:px-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900">Buat Materi Baru</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-500 p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-white">
                        <form id="add-materi-form" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul Materi</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Konten</label>
                                <RichTextEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Tulis konten materi di sini..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rubrik Penilaian (Opsional)</label>
                                <RichTextEditor
                                    value={rubrik}
                                    onChange={setRubrik}
                                    placeholder="Tulis rubrik penilaian di sini..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nilai Minimum / KKM (Opsional)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={passingGrade}
                                        onChange={(e) => setPassingGrade(e.target.value)}
                                        placeholder="Misal: 75"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Batas nilai agar siswa dianggap lulus materi ini.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Deadline Pengumpulan (Opsional)</label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 text-primary font-bold">Berikan ke Kelas</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50">
                                    {classes.map((cls) => (
                                        <label key={cls.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedClasses.includes(cls.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedClasses([...selectedClasses, cls.id]);
                                                    } else {
                                                        setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span className="text-sm text-slate-700">{cls.name}</span>
                                        </label>
                                    ))}
                                    {classes.length === 0 && (
                                        <p className="text-xs text-slate-400 italic col-span-2">Tidak ada data kelas.</p>
                                    )}
                                </div>
                                <p className="mt-1 text-[10px] text-slate-500 italic">* Lewati jika materi ini ingin dibagikan ke seluruh siswa (publik).</p>
                            </div>

                            <div className="mt-8">
                                <label className="block text-sm font-medium text-gray-700">Gambar (Opsional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, GIF, WebP. Maks 2MB.</p>
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm">{error}</div>
                            )}
                        </form>
                    </div>

                    <div className="flex-shrink-0 bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="add-materi-form"
                            disabled={isLoading}
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
