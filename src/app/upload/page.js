'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  CloudUpload,
  Search,
  Download,
  FileText,
  FileImage,
  FileVideo,
  File as FileIcon,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function FileTypeIcon({ mimeType }) {
  if (!mimeType) return <FileIcon className="w-5 h-5 text-slate-400" />;
  if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-violet-500" />;
  if (mimeType.startsWith('video/')) return <FileVideo className="w-5 h-5 text-amber-500" />;
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text'))
    return <FileText className="w-5 h-5 text-blue-500" />;
  return <FileIcon className="w-5 h-5 text-slate-400" />;
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function UploadPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) router.push('/');
  }, [user, userLoading, router]);

  // form state
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // list state
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(true);

  // ── fetch files ────────────────────────────────────────────────────────────
  const fetchFiles = async (query = '') => {
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/files?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchFiles(search), 300); // debounce
    return () => clearTimeout(timer);
  }, [search]);

  // ── upload handler ─────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !name.trim()) {
      setUploadError('Please fill in both the file name and choose a file.');
      return;
    }
    setUploadError('');
    setUploading(true);
    setUploadSuccess(false);

    const form = new FormData();
    form.append('file', file);
    form.append('name', name.trim());

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Upload failed');
      }
      setName('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3500);
      fetchFiles(search);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── direct download ────────────────────────────────────────────────────────
  const handleDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // fallback: open in new tab so user can save manually
      window.open(url, '_blank');
    }
  };

  // ── loading screen ─────────────────────────────────────────────────────────
  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Page heading ───────────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            File Library
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload documents, images or any file — accessible to the whole team.
          </p>
        </div>

        {/* ── Upload card ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
            Upload a new file
          </h2>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* File name input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                File Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setUploadError(''); }}
                placeholder="e.g. Q2 Sales Report"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={uploading}
              />
            </div>

            {/* File picker */}
            <div>
              {/* Replace the entire drag-drop div with this */}
<label
  className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors px-4 py-6 cursor-pointer bg-slate-50 group"
>
  <input
    ref={fileInputRef}
    type="file"
    className="sr-only"  // ← screen-reader only, not opacity-0
    onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUploadError(''); }}
    disabled={uploading}
  />
  <div className="flex flex-col items-center gap-2">
    <CloudUpload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
    {file ? (
      <span className="text-sm font-medium text-blue-600">{file.name}</span>
    ) : (
      <span className="text-sm text-slate-500">
        Click to browse or drag a file here
      </span>
    )}
  </div>
</label>
            </div>

            {/* Error */}
            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                <X className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {/* Success */}
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                File uploaded successfully!
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold py-3 shadow-md shadow-blue-100 transition-all duration-200"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Search + file list ──────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* search header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search files by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* file rows */}
          {loadingFiles ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <FileIcon className="w-10 h-10 opacity-40" />
              <p className="text-sm font-medium">
                {search ? 'No files match your search.' : 'No files uploaded yet.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {files.map((f) => (
                <li
                  key={String(f._id)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  {/* icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors border border-slate-200">
                    <FileTypeIcon mimeType={f.mimeType} />
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatBytes(f.size)} · {formatDate(f.uploadedAt)}
                    </p>
                  </div>

                  {/* download */}
                  <button
                    onClick={() => handleDownload(f.cloudinaryUrl, f.originalName)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
