"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, User as UserIcon } from "lucide-react";
import Link from "next/link";

interface Materi {
    id: number;
    title: string;
    slug: string;
    content: string;
    image: string | null;
    created_at: string;
    user: {
        name: string;
    };
}

export default function DetailMateri() {
    const params = useParams();
    const [materi, setMateri] = useState<Materi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Need to check if params.slug (or slug from unwrapped params) is available
        // In client component, useParams returns the object directly
        if (params?.slug) {
            fetch(`/api/materi/${params.slug}`)
                .then(res => {
                    if (!res.ok) throw new Error("Not found");
                    return res.json();
                })
                .then(data => {
                    setMateri(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError(true);
                    setLoading(false);
                });
        }
    }, [params]);

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
                                    src={materi.image}
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
                            <div className="prose prose-lg prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {materi.content}
                            </div>
                        </div>
                    </article>
                </div>
            </main>
        </div>
    );
}
