"use client";

import { useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { getAuth } from "@/utils/auth";

// Import ReactQuill secara dynamic untuk menghindari error SSR
const ReactQuill = dynamic(() => import("react-quill"), {
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
                    const { token } = getAuth();
                    const res = await fetch('/api/upload-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
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
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet',
        'link', 'image'
    ];

    return (
        <div className="bg-white">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-64 mb-12" // mb-12 untuk memberi ruang toolbar bottom jika ada overflow
            />
        </div>
    );
}
