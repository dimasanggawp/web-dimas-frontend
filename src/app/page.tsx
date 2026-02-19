"use client";

// Force update
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MateriCard from "@/components/MateriCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

export default function Home() {
  const [materis, setMateris] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMateri() {
      try {
        const res = await fetch('/api/materi');
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            Portal Belajar <span className="text-primary">SMK TKJ</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Temukan materi pembelajaran Teknik Komputer dan Jaringan terlengkap dan terupdate, disusun oleh pengajar profesional.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/materi" className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
              Mulai Belajar
            </Link>
            <Link href="/profil" className="px-8 py-3 border border-slate-200 text-slate-600 bg-white rounded-full font-medium hover:border-primary hover:text-primary transition-colors">
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Materials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Materi Terbaru</h2>
            <p className="text-slate-600">Update wawasan teknologimu dengan artikel terbaru.</p>
          </div>
          <Link href="/materi" className="text-primary font-medium hover:text-blue-700 flex items-center gap-1 transition-colors">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 h-96 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {materis.slice(0, 6).map((materi) => (
              <MateriCard key={materi.id} materi={materi} />
            ))}
          </div>
        )}
      </section>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <p>&copy; 2026 SMK TKJ. All rights reserved.</p>
          <p className="mt-2 text-sm">Created by Dimas Angga Wahyu Putra</p>
        </div>
      </footer>
    </div>
  );
}
