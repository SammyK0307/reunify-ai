import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { registerChild } from '../lib/api';
import { Upload, UserPlus, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function AdminPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', age: '', gender: 'unknown', last_seen_location: '',
    last_seen_date: '', description: '', case_number: '', contact_info: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
    if (!loading && user?.role !== 'admin') router.push('/dashboard');
  }, [isAuthenticated, loading, user, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 1,
    onDrop: (files) => {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a reference photo'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      const res = await registerChild(fd);
      setSuccess(`✓ ${form.name} registered (ID: ${res.child_id})`);
      setForm({ name: '', age: '', gender: 'unknown', last_seen_location: '', last_seen_date: '', description: '', case_number: '', contact_info: '' });
      setFile(null); setPreview('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setSubmitting(false); }
  };

  const Field = ({ label, name, type = 'text', required = false, span = false }: any) => (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label className="text-[11px] font-mono text-text-dim uppercase tracking-wider block mb-1.5">
        {label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      <input type={type} value={(form as any)[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        required={required}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" />
    </div>
  );

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text">Register Missing Child</h1>
            <p className="text-sm text-text-dim mt-1">
              Add a new case to the facial recognition database
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-warn/10 border border-warn/30 rounded-lg">
            <ShieldAlert size={12} className="text-warn" />
            <span className="text-[10px] font-mono text-warn uppercase">Admin Only</span>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-xl">
            <CheckCircle2 size={18} className="text-success" />
            <span className="text-sm text-success">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/30 rounded-xl">
            <AlertTriangle size={18} className="text-danger" />
            <span className="text-sm text-danger">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-panel border border-border rounded-2xl p-6 space-y-6">
          {/* Photo upload */}
          <div>
            <label className="text-[11px] font-mono text-text-dim uppercase tracking-wider block mb-2">
              Reference Photo <span className="text-danger">*</span>
            </label>
            <div {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
                ${isDragActive ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'}`}
              style={{ height: 160 }}>
              <input {...getInputProps()} />
              {preview ? (
                <div className="relative w-full h-full">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-success/20 border border-success/40 rounded-full px-2 py-0.5">
                    <span className="text-[10px] font-mono text-success">PHOTO READY</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Upload size={24} className="text-text-dim" />
                  <span className="text-sm text-text-dim">Drop reference photo here</span>
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" name="name" required />
            <Field label="Age" name="age" type="number" required />
            <div>
              <label className="text-[11px] font-mono text-text-dim uppercase tracking-wider block mb-1.5">
                Gender
              </label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text
                  focus:outline-none focus:border-accent transition-all">
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <Field label="Case Number" name="case_number" />
            <Field label="Last Seen Location" name="last_seen_location" required span />
            <Field label="Last Seen Date" name="last_seen_date" type="date" />
            <Field label="Contact Info" name="contact_info" />
            <div className="sm:col-span-2">
              <label className="text-[11px] font-mono text-text-dim uppercase tracking-wider block mb-1.5">
                Description
              </label>
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text
                  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                placeholder="Physical description, clothing, distinguishing features..." />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-accent rounded-xl text-white text-sm font-bold
              hover:bg-accent/90 transition-all glow disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
              <><UserPlus size={16} /> Register Child</>
            )}
          </button>

          <p className="text-[11px] text-text-dim text-center font-mono">
            Reference photo will not be stored — only facial embedding is saved
          </p>
        </form>
      </div>
    </Layout>
  );
}
