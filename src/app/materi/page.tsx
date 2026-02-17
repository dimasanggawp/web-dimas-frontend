"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MateriCard from "@/components/MateriCard";
import { Loader2 } from "lucide-react";

interface Materi {
    id: number;
    title: string;
    slug: string;
    content: string;
    image?: string;
    created_at: string;
    user: {
        name: string;
    };
}

export default function MateriIndex() {
    const [materis, setMateris] = useState<Materi[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMateri() {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/materi');
                if (res.ok) {
                    const data = await res.json();
                    setMateris(data);
                }
            } catch (error) {
                console.error("Failed to fetch materi", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMateri();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Semua Materi</h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Jelajahi kumpulan materi pembelajaran lengkap untuk mendukung studimu.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {materis.map((materi) => (
                            <MateriCard key={materi.id} materi={materi} />
                        ))}
                        {materis.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-500">
                                Belum ada materi tersedia.
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
