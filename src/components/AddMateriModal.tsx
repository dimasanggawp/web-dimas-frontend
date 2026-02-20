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
                setSelectedClasses([]);
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Gagal membuat materi.");
            }
        } catch (err) {
            setError("Terjadi kesalahan koneksi.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-10">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Buat Materi Baru</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deadline Pengumpulan (Opsional)</label>
                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
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
