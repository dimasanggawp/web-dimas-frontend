import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";

interface MateriProps {
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

export default function MateriCard({ materi }: { materi: MateriProps }) {
    // Truncate content for summary
    // Backend already sends truncated plain text
    const summary = materi.content;

    // Format date
    const date = new Date(materi.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group">
            <div className="h-48 bg-slate-200 relative overflow-hidden">
                {materi.image ? (
                    <img
                        src={materi.image?.startsWith('http') ? materi.image : `/storage/${materi.image}`}
                        alt={materi.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200">
                        <span className="text-6xl font-bold opacity-20">TKJ</span>
                    </div>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {date}
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {materi.user?.name}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">
                    <Link href={`/materi/${materi.slug}`}>
                        {materi.title}
                    </Link>
                </h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {summary}
                </p>
                <Link href={`/materi/${materi.slug}`} className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                    Baca Selengkapnya <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>
        </div>
    );
}
