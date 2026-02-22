"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/utils/apiWrapper";
import { Save, AlertCircle } from "lucide-react";

export default function SettingsPanel() {
    const [settings, setSettings] = useState<{ [key: string]: string }>({ ai_engine: "llama3", ai_model: "llama3.2:3b" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth("/api/settings");
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            } else {
                setMessage({ type: "error", text: "Gagal memuat pengaturan." });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setMessage({ type: "error", text: "Terjadi kesalahan saat memuat pengaturan." });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });
        setSaving(true);

        try {
            const response = await fetchWithAuth("/api/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ settings }),
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data.settings);
                setMessage({ type: "success", text: "Pengaturan berhasil disimpan." });
                // Optional: clear success message after 3 seconds
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: "Gagal menyimpan pengaturan." });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan pengaturan." });
        } finally {
            setSaving(false);
        }
    };

    const handleAIChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const [engine, model] = val.split("|");
        setSettings({ ...settings, ai_engine: engine, ai_model: model });
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentSelection = `${settings.ai_engine || "llama3"}|${settings.ai_model || (settings.ai_engine === "gemini" ? "gemma-3-12b-it" : (settings.ai_engine === "openai" ? "gpt-4o-mini" : "llama3.2:3b"))}`;

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Pengaturan Sistem</h3>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">Konfigurasi global untuk aplikasi.</p>
            </div>

            <div className="border-t border-slate-200">
                <form onSubmit={handleSave} className="p-6">
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-md flex items-center ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* AI Engine & Model Setting Combined */}
                        <div>
                            <label htmlFor="ai_combined" className="block text-sm font-medium text-slate-700 mb-1">
                                Pilih Agen AI untuk Penilaian
                            </label>
                            <select
                                id="ai_combined"
                                name="ai_combined"
                                value={currentSelection}
                                onChange={handleAIChange}
                                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                            >
                                <optgroup label="Google AI Studio">
                                    <option value="gemini|gemma-3-12b-it">Google Gemini (Gemma 3 12B IT)</option>
                                </optgroup>
                                <optgroup label="Ollama (Local)">
                                    <option value="llama3|llama3.2:3b">Llama 3 (Llama 3.2 3B)</option>
                                </optgroup>
                                <optgroup label="OpenAI (Cloud)">
                                    <option value="openai|gpt-4o-mini">OpenAI (GPT-4o Mini)</option>
                                    <option value="openai|gpt-4o">OpenAI (GPT-4o)</option>
                                    <option value="openai|gpt-3.5-turbo">OpenAI (GPT-3.5 Turbo)</option>
                                </optgroup>
                            </select>
                            <p className="mt-2 text-sm text-slate-500">
                                Pilih kombinasi mesin dan model AI yang akan digunakan untuk menilai tugas secara otomatis.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Menyimpan...
                                </span>
                            ) : (
                                <>
                                    <Save className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                    Simpan Pengaturan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
