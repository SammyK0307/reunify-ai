import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import FaceScanner from '../components/FaceScanner';
import MatchCard from '../components/MatchCard';
import { uploadAndSearch } from '../lib/api';
import { Search, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

type Status = 'idle' | 'processing' | 'done' | 'error';

export default function UploadPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  const STEPS = ['Uploading image...', 'Detecting face...', 'Generating embedding...', 'Searching database...'];

  const handleSearch = async () => {
    if (!file) return;
    setStatus('processing');
    setError('');
    setStep(0);

    // Animate steps
    const stepInterval = setInterval(() => {
      setStep(s => {
        if (s >= STEPS.length - 1) { clearInterval(stepInterval); return s; }
        return s + 1;
      });
    }, 800);

    try {
      const data = await uploadAndSearch(file);
      clearInterval(stepInterval);
      setResult(data);
      setStatus('done');
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || 'Search failed. Please try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setStatus('idle');
    setResult(null);
    setError('');
    setStep(0);
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Face Match Search</h1>
          <p className="text-sm text-text-dim mt-1">
            Upload an image to search against the missing children database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload */}
          <div className="space-y-4">
            <div className="bg-panel border border-border rounded-2xl p-5">
              <div className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
                <Search size={15} className="text-accent" />
                Image Input
              </div>

              <FaceScanner
                onImageSelect={(f, p) => { setFile(f); setPreview(p); setStatus('idle'); setResult(null); }}
                processing={status === 'processing'}
              />

              {file && status !== 'processing' && status !== 'done' && (
                <button onClick={handleSearch}
                  className="mt-4 w-full py-3 bg-accent rounded-xl text-white text-sm font-bold
                    hover:bg-accent/90 transition-all glow flex items-center justify-center gap-2">
                  <Search size={16} />
                  Run Face Match
                </button>
              )}

              {status === 'done' && (
                <button onClick={reset}
                  className="mt-4 w-full py-3 bg-panel border border-border rounded-xl text-text-dim text-sm font-semibold
                    hover:border-accent/50 hover:text-text transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={14} />
                  New Search
                </button>
              )}
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Processing */}
            {status === 'processing' && (
              <div className="bg-panel border border-accent/30 rounded-2xl p-5 space-y-4">
                <div className="text-sm font-semibold text-accent flex items-center gap-2">
                  <span className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                  AI Pipeline Active
                </div>
                <div className="space-y-3">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${i < step ? 'bg-success border-success' : i === step ? 'border-accent animate-pulse' : 'border-border'}`}>
                        {i < step && <span className="text-white text-[10px]">✓</span>}
                        {i === step && <span className="w-2 h-2 bg-accent rounded-full" />}
                      </div>
                      <span className={`text-sm font-mono transition-colors
                        ${i < step ? 'text-success line-through opacity-60' : i === step ? 'text-accent' : 'text-text-dim'}`}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {status === 'error' && (
              <div className="bg-danger/10 border border-danger/30 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-danger">Search Failed</div>
                  <div className="text-xs text-text-dim mt-1">{error}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {status === 'done' && result && (
              <div className="space-y-4 fade-in-up">
                <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/30 rounded-xl">
                  <CheckCircle2 size={16} className="text-success" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-success">
                      {result.matches_found} match{result.matches_found !== 1 ? 'es' : ''} found
                    </span>
                    <p className="text-[11px] text-text-dim">{result.privacy_note}</p>
                  </div>
                </div>

                {result.matches_found === 0 ? (
                  <div className="text-center py-10 text-text-dim">
                    <Search size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No matching records in database</p>
                  </div>
                ) : (
                  result.matches.map((m: any, i: number) => (
                    <MatchCard key={m.child_id} match={m} rank={i} delay={i * 150} />
                  ))
                )}
              </div>
            )}

            {/* Idle state */}
            {status === 'idle' && !file && (
              <div className="bg-panel border border-border/50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-text-dim opacity-50" />
                </div>
                <p className="text-sm text-text-dim">
                  Upload an image on the left to begin face matching
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
