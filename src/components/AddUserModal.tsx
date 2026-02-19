"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save } from "lucide-react";
import { getAuth } from "@/utils/auth";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddUserModal({ isOpen, onClose, onSuccess }: AddUserModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("2"); // Default to user (2), assuming 1 is admin
    const [classId, setClassId] = useState("");
    const [academicYearId, setAcademicYearId] = useState("");
    const [nisn, setNisn] = useState("");
    const [nomorHp, setNomorHp] = useState("");
    const [classes, setClasses] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchClasses = async () => {
        try {
            const { token } = getAuth();
            const res = await fetch("/api/class-rooms", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setClasses(await res.json());
        } catch (err) {
            console.error("Failed to fetch classes", err);
        }
    };

    const fetchAcademicYears = async () => {
        try {
            const { token } = getAuth();
            const res = await fetch("/api/tahun-ajaran", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) setAcademicYears(await res.json());
        } catch (err) {
            console.error("Failed to fetch academic years", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchClasses();
            fetchAcademicYears();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const { token } = getAuth();
            const res = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role_id: parseInt(roleId),
                    class_room_id: roleId === "2" ? classId : null,
                    tahun_ajaran_id: roleId === "2" ? academicYearId : null,
                    nisn: roleId === "2" ? nisn : null,
                    nomor_hp: roleId === "2" ? nomorHp : null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setName("");
                setEmail("");
                setPassword("");
                setRoleId("2");
                setClassId("");
                setAcademicYearId("");
                setNisn("");
                setNomorHp("");
                onSuccess();
                onClose();
            } else {
                setError(data.message || "Gagal membuat user.");
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Tambah User Baru</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password (Kosongkan = Gunakan No HP)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <select
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                >
                                    <option value="1">Admin</option>
                                    <option value="2">User</option>
                                </select>
                            </div>

                            {roleId === "2" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kelas</label>
                                        <select
                                            required
                                            value={classId}
                                            onChange={(e) => setClassId(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        >
                                            <option value="">Pilih Kelas</option>
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                                        <select
                                            required
                                            value={academicYearId}
                                            onChange={(e) => setAcademicYearId(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        >
                                            <option value="">Pilih Tahun Ajaran</option>
                                            {academicYears.map((ay) => (
                                                <option key={ay.id} value={ay.id}>{ay.tahun} {ay.is_active ? '(Aktif)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">NISN</label>
                                        <input
                                            type="text"
                                            value={nisn}
                                            onChange={(e) => setNisn(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="Opsional"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
                                        <input
                                            type="text"
                                            value={nomorHp}
                                            onChange={(e) => setNomorHp(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="Opsional"
                                        />
                                    </div>
                                </>
                            )}

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
