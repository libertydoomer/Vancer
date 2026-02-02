'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, X, Loader2, Sparkles, Search, Save, ChevronRight, AlertCircle, Trash2, Library } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { analyzeResumeAction, getAnalysisHistory, saveAnalysisAction, getUserDocuments, analyzeStoredDocumentAction, deleteAnalysisAction } from '@/app/services/actions';
import Link from 'next/link';
import { SavedReportPanel } from './saved-report-panel';

interface AnalysisResult {
    jobTitles: string[];
    searchQueries: string[];
    critique: string[];
    legend: string;
}

export function ResumeUpload() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
    const [activeSavedReport, setActiveSavedReport] = useState<any | null>(null);
    const [hasSaved, setHasSaved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const loadData = useCallback(async () => {
        try {
            const hist = await getAnalysisHistory();
            const docs = await getUserDocuments();
            setHistory(hist);
            setDocuments(docs);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a PDF or Word document.');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('File is too large. Maximum size is 5MB.');
            return false;
        }
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
                setResult(null); // Reset result on new file
                toast.success(`File "${droppedFile.name}" selected!`);
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
                setResult(null); // Reset result on new file
                toast.success(`File "${selectedFile.name}" selected!`);
            }
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setSelectedDoc(null);
        setResult(null);
        setHasSaved(false);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleAnalyze = async () => {
        if (!file && !selectedDoc) return;

        setIsAnalyzing(true);
        setHasSaved(false);

        try {
            let data;
            if (selectedDoc) {
                // Analyze stored document
                data = await analyzeStoredDocumentAction(selectedDoc.id);
            } else if (file) {
                // Analyze uploaded file (Legacy/Direct mode)
                const formData = new FormData();
                formData.append('file', file);
                data = await analyzeResumeAction(formData);
            }

            setResult(data);
            // await loadData();
            toast.success("Resume analysis complete!");
        } catch (error) {
            toast.error("Failed to analyze resume. Please try again.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        const fileName = file?.name || selectedDoc?.fileName;
        if (!fileName) return;

        try {
            await saveAnalysisAction(result, fileName);
            await loadData();
            setHasSaved(true);
            toast.success("Report saved successfully!");
        } catch (error) {
            toast.error("Failed to save report.");
        }
    };

    const handleDeleteAnalysis = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this report?")) return;

        try {
            await deleteAnalysisAction(id);
            await loadData();
            if (activeSavedReport?.id === id) {
                setActiveSavedReport(null);
            }
            toast.success("Report deleted successfully");
        } catch (error) {
            toast.error("Failed to delete report");
            console.error(error);
        }
    };

    if (activeSavedReport) {
        return <SavedReportPanel report={activeSavedReport} onClose={() => setActiveSavedReport(null)} />;
    }

    return (
        <div className="w-full space-y-8">
            {/* Library Section */}
            {documents.length > 0 && !result && (
                <div className="mb-2">
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center">
                        <Library className="w-4 h-4 mr-2" />
                        Select from your resumes or upload new
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {documents.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => {
                                    setSelectedDoc(doc);
                                    setFile(null);
                                    if (inputRef.current) inputRef.current.value = '';
                                }}
                                className={`
                                    p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                                    ${selectedDoc?.id === doc.id
                                        ? 'border-green-500 bg-green-50 ring-1 ring-green-500 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                    }
                                `}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedDoc?.id === doc.id ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-xs font-semibold truncate ${selectedDoc?.id === doc.id ? 'text-green-900' : 'text-slate-900'}`}>
                                        {doc.fileName}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {!selectedDoc && !result && (
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ease-in-out cursor-pointer group
          ${isDragging
                            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                        }
          ${file ? 'border-solid border-emerald-500 bg-emerald-50/10' : ''}
        `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    {file && (
                        <button
                            onClick={removeFile}
                            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all z-30 shadow-sm border border-slate-100"
                            title="Remove file"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                        {file ? (
                            <>
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                    <FileText className="w-8 h-8 text-emerald-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-slate-900 line-clamp-1 break-all max-w-[300px]">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-4 z-20">
                                    <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                        <CheckCircle className="w-4 h-4 mr-1.5" />
                                        Ready
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-2 transition-colors
                ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
              `}>
                                    <Upload className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">
                                        Upload a new resume
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Drag & drop or click to browse (PDF, DOCX)
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {selectedDoc && !result && (
                <div className="relative border-2 border-solid border-emerald-500 bg-emerald-50/10 rounded-2xl p-8 text-center">
                    <button
                        onClick={() => setSelectedDoc(null)}
                        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-400 transition-all z-30 shadow-sm border border-slate-100"
                        title="Deselect"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <FileText className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-semibold text-slate-900 line-clamp-1 break-all max-w-[300px]">
                                {selectedDoc.fileName}
                            </p>
                            <p className="text-sm text-slate-500">
                                {selectedDoc.size ? (selectedDoc.size / 1024 / 1024).toFixed(2) + ' MB' : 'Stored Document'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 z-20">
                            <span className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                                <CheckCircle className="w-4 h-4 mr-1.5" />
                                Ready to Analyze
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Analyze Button */}
            {(file || selectedDoc) && !result && (
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all text-lg"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                Analyzing Resume...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6 mr-2 text-yellow-300 fill-current" />
                                Analyze Resume with AI
                            </>
                        )}
                    </Button>
                </div>
            )}

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8 relative">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{file?.name || selectedDoc?.fileName || 'Resume Analysis'}</h3>
                                <p className="text-xs text-slate-500 font-medium">AI-Powered Overview</p>
                            </div>
                        </div>
                        <button
                            onClick={removeFile}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-200 transition-all group"
                            title="Close Analysis"
                        >
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Close Report</span>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Roles & Search Terms - Unified Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 w-full">
                            {/* Best Fit Roles */}
                            <div className="p-6 sm:p-8 w-full min-w-0">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    Best Fit Roles
                                </h3>
                                <div className="flex flex-wrap gap-2 w-full">
                                    {result.jobTitles.map((title, i) => (
                                        <Link href={`/?q=${encodeURIComponent(title)}`} key={i} className="max-w-full min-w-0 shrink-1">
                                            <span className="px-4 py-2 bg-slate-50 text-slate-900 rounded-xl text-sm font-bold border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer flex items-center group/role whitespace-normal break-words h-auto min-h-[40px] w-full">
                                                <span className="flex-1 min-w-0 break-words">{title}</span>
                                                <ChevronRight className="w-3.5 h-3.5 ml-1.5 shrink-0 opacity-0 -translate-x-2 group-hover/role:opacity-40 group-hover/role:translate-x-0 transition-all" />
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Search Terms */}
                            <div className="p-6 sm:p-8 bg-slate-50/30 w-full min-w-0">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Search className="w-4 h-4 text-blue-500" />
                                    Search Terms
                                </h3>
                                <div className="space-y-2">
                                    {result.searchQueries.map((q, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-sm font-semibold text-slate-700 hover:border-blue-200 transition-all group/item min-w-0">
                                            <span className="truncate mr-2 flex-1 min-w-0">{q}</span>
                                            <Link href={`/?q=${encodeURIComponent(q)}`} className="shrink-0">
                                                <Button size="sm" variant="ghost" className="h-8 px-3 text-blue-600 font-bold opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    Search
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Improvement Points */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                            Ways to Improve
                        </h3>
                        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-4">
                            {result.critique.map((point, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-600 leading-relaxed font-semibold group">
                                    <div className="mr-3 mt-1.5 w-1.5 h-1.5 bg-amber-400 rounded-full group-hover:scale-150 transition-transform" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Career Legend */}
                    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 rounded-[2rem] p-1 sm:p-1.5 border border-indigo-100 shadow-xl shadow-indigo-500/5">
                        <div className="bg-white rounded-[1.8rem] border border-white/50 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-indigo-900 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    Resume Narrative
                                </h3>
                                <div className="h-px flex-1 mx-8 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                            </div>
                            <div className="p-8 sm:p-16">
                                <div className="max-w-4xl mx-auto text-base sm:text-lg font-medium leading-relaxed text-slate-700 text-justify">
                                    <span className="text-indigo-600/20 text-6xl absolute -mt-4 -ml-8 leading-none">“</span>
                                    {result.legend || (result as any).improvedResume || 'Analysis narrative not available.'}
                                    <span className="text-indigo-600/20 text-6xl absolute -mt-4 leading-none ml-2">”</span>
                                </div>
                                <div className="mt-16 flex flex-col items-center gap-4">
                                    <div className="w-12 h-0.5 bg-indigo-100 rounded-full" />
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                                        Use this summary for your introduction
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Save Actions Bar */}
            {result && !hasSaved && (
                <div className="flex justify-center pt-8 border-t border-slate-100">
                    <Button
                        size="lg"
                        onClick={handleSave}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-6 px-12 rounded-2xl shadow-xl shadow-emerald-600/20 active:scale-95 transition-all text-lg"
                    >
                        <Save className="w-6 h-6 mr-3" />
                        Save Report
                    </Button>
                </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
                <div className="border-t border-slate-200 pt-8 mt-12">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-slate-500" />
                        Saved Reports
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setActiveSavedReport(item);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative block"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => handleDeleteAnalysis(e, item.id)}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-slate-400"
                                            title="Delete analysis"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-semibold text-slate-900 line-clamp-1 mb-1 truncate pr-8" title={item.fileName}>
                                    {item.fileName}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2">
                                    Matched: {item.jobTitles?.[0]}{item.jobTitles?.[1] ? `, ${item.jobTitles[1]}` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
