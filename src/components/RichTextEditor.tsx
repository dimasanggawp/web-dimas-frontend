"use client";

import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { fetchWithAuth } from "@/utils/apiWrapper";

// Import ReactQuill dynamically to avoid SSR errors and register attributors
const ReactQuill = dynamic(async () => {
    const { default: RQ, Quill } = await import("react-quill-new");

    // Register Style Attributors to use inline styles instead of classes
    // This improves compatibility with content pasted from Word/Google Docs
    const Align = Quill.import("attributors/style/align");
    const Direction = Quill.import("attributors/style/direction");
    const Background = Quill.import("attributors/style/background");
    const Color = Quill.import("attributors/style/color");
    const Size = Quill.import("attributors/style/size");
    const Font = Quill.import("attributors/style/font");

    Quill.register(Align as any, true);
    Quill.register(Direction as any, true);
    Quill.register(Background as any, true);
    Quill.register(Color as any, true);
    Quill.register(Size as any, true);
    Quill.register(Font as any, true);

    return RQ;
}, {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-md"></div>
}) as any;

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const res = await fetchWithAuth('/api/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();

                    if (res.ok) {
                        const quill = quillRef.current.getEditor();
                        const range = quill.getSelection(true);
                        // Insert image URL dari response backend
                        quill.insertEmbed(range.index, 'image', data.url);
                    } else {
                        alert(data.message || 'Gagal mengupload gambar.');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Terjadi kesalahan saat upload gambar.');
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        clipboard: {
            // Toggle to match visual representation better for lists
            matchVisual: false
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'color', 'background',
        'list', 'indent',
        'script',
        'align',
        'link', 'image'
    ];

    return (
        <div className="bg-white [&_.ql-container]:min-h-[200px] [&_.ql-container]:rounded-b-md [&_.ql-toolbar]:rounded-t-md [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:max-h-[400px]">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
