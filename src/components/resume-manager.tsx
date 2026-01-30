'use client';

import { useState, useRef } from 'react';
import { FileText, Trash2, Upload, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadDocumentAction, deleteDocumentAction } from '@/app/services/actions';
import { useRouter } from 'next/navigation';

interface Document {
    id: string;
    fileName: string;
    filePath: string;
    createdAt: Date | null;
    size: number | null;
}

interface ResumeManagerProps {
    documents: Document[];
}

export function ResumeManager({ documents }: ResumeManagerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Validation
            const validTypes = ['.pdf', '.doc', '.docx'];
            const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!validTypes.includes(fileExt)) {
                toast.error("Invalid file type. Only PDF and Word documents are allowed.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large using 5MB limit.");
                return;
            }

            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            try {
                await uploadDocumentAction(formData);
                toast.success("Resume uploaded successfully!");
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to upload resume.");
            } finally {
                setIsUploading(false);
                if (inputRef.current) inputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (doc: Document) => {
        if (!confirm("Are you sure you want to delete this resume?")) return;

        setIsDeleting(doc.id);
        try {
            await deleteDocumentAction(doc.id, doc.filePath);
            toast.success("Resume deleted.");
            router.refresh();
        } catch (error: any) {
            toast.error("Failed to delete resume.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Your Resumes</h2>
                    <p className="text-slate-500 text-sm">Manage the resumes you use for analysis.</p>
                </div>
                <Button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Upload New
                </Button>
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                />
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No resumes uploaded yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 text-slate-500">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{doc.fileName}</p>
                                    <p className="text-xs text-slate-400">
                                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'} • {(doc.size ? (doc.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(doc)}
                                disabled={isDeleting === doc.id}
                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                            >
                                {isDeleting === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
