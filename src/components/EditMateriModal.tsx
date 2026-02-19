import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getAuth } from "@/utils/auth";
import RichTextEditor from "./RichTextEditor";

interface EditMateriModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    materi: any; // Type should be defined properly but 'any' is fine for now
}

export default function EditMateriModal({ isOpen, onClose, onSuccess, materi }: EditMateriModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [existingImage, setExistingImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (materi) {
            setTitle(materi.title);
            setContent(materi.content);
            setExistingImage(materi.image);
            setImage(null);
            setError("");
        }
    }, [materi]);

    if (!isOpen || !materi) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { token } = getAuth();

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('_method', 'PUT'); // Method spoofing for Laravel

            if (image) {
                formData.append('image', image);
            }

            const res = await fetch(`/api/materi/${materi.id}`, {
                method: "POST", // Use POST for FormData with method spoofing
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Gagal mengupdate materi.");
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Materi</h3>
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
                                    placeholder="Edit konten materi..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar</label>

                                {existingImage && !image && (
                                    <div className="mt-2 mb-2">
                                        <p className="text-xs text-slate-500 mb-1">Gambar saat ini:</p>
                                        <img
                                            src={`/storage/${existingImage}`}
                                            alt="Current"
                                            className="h-20 w-auto object-cover rounded border"
                                        />
                                    </div>
                                )}

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
                                <p className="mt-1 text-xs text-gray-500">
                                    Format: JPG, PNG, GIF, WebP. Maks 2MB.
                                    {existingImage ? " Biarkan kosong jika tidak ingin mengubah gambar." : ""}
                                </p>
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
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
