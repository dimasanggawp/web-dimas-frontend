import React from 'react';

interface FormattedFeedbackProps {
    feedback: string | null | undefined;
    className?: string;
}

export default function FormattedFeedback({ feedback, className = "" }: FormattedFeedbackProps) {
    if (!feedback) return <span className="text-slate-400 italic">-</span>;

    // 1. Basic Markdown Cleanup (that the AI might still produce despite prompt instructions)
    const cleanText = (text: string) => {
        return text
            .replace(/\*\*/g, '')
            .replace(/###\s?/g, '')
            .replace(/##\s?/g, '')
            .replace(/#\s?/g, '');
    };

    // 2. Split into lines, keeping empty ones for spacing if needed
    // We normalize line endings first
    const normalizedFeedback = feedback.replace(/\r\n/g, '\n');
    const lines = normalizedFeedback.split('\n');

    return (
        <div className={`space-y-3 ${className}`}>
            {lines.map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine === '') return <div key={index} className="h-2" />;

                // Check for AI System info
                const isOriginLine = trimmedLine.toLowerCase().includes('sistem ai:') ||
                    (trimmedLine.includes('Model:') && trimmedLine.includes('Sistem'));

                if (isOriginLine) {
                    // Clean it up: remove *, (, ), and trim
                    const displayOrigin = trimmedLine
                        .replace(/\*/g, '')
                        .replace(/[()]/g, '')
                        .trim();

                    return (
                        <div key={index} className="mt-6 pt-3 border-t border-slate-200">
                            <p className="text-[11px] font-medium text-slate-400 italic flex items-center gap-2">
                                <span className="w-1 h-3 bg-slate-200 rounded-full" />
                                {displayOrigin}
                            </p>
                        </div>
                    );
                }

                // Check for lists
                const isListItem = /^\d+\.\s|^\s*[-*]\s/.test(trimmedLine);
                const displayPara = cleanText(trimmedLine);

                return (
                    <p
                        key={index}
                        className={`
                            ${isListItem ? 'pl-5 -indent-5 bg-slate-50/50 p-2 rounded-lg' : 'text-slate-700'} 
                            text-[13px] md:text-sm leading-relaxed
                        `}
                    >
                        {displayPara}
                    </p>
                );
            })}
        </div>
    );
}
