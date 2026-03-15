import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Shield, Eye, Fingerprint, Lock, ArrowRight, Zap } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-ink grid-bg flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center glow-sm">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">REUNIFY AI</span>
        </div>
        <Link href="/login" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-all glow-sm">
          Officer Login <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-full mb-8">
          <Zap size={12} className="text-accent" />
          <span className="text-xs font-mono text-accent uppercase tracking-widest">AI-Powered · Privacy-First</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold leading-none mb-6" style={{ letterSpacing: '-2px' }}>
          Reunify<br />
          <span className="text-accent">Missing</span> Children
        </h1>

        <p className="text-lg text-text-dim max-w-xl mb-10 leading-relaxed">
          Advanced facial recognition for law enforcement. Identify missing children instantly while preserving every individual's privacy through embedding-only AI.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/login"
            className="flex items-center gap-2 px-6 py-3 bg-accent rounded-xl text-white font-semibold hover:bg-accent/90 transition-all glow text-sm">
            Law Enforcement Access
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full">
          {[
            { icon: Eye, title: 'MTCNN Detection', desc: 'Real-time face detection and alignment' },
            { icon: Fingerprint, title: 'FaceNet Embeddings', desc: '512-dimensional biometric encoding' },
            { icon: Lock, title: 'Zero Image Storage', desc: 'Photos deleted immediately after processing' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 bg-panel/60 border border-border rounded-xl text-left">
              <div className="w-9 h-9 bg-accent/15 rounded-lg flex items-center justify-center mb-3">
                <Icon size={18} className="text-accent" />
              </div>
              <div className="text-sm font-bold text-text mb-1">{title}</div>
              <div className="text-xs text-text-dim">{desc}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="px-8 py-4 border-t border-border/50 text-center">
        <p className="text-xs text-text-dim font-mono">REUNIFY AI v1.0 · FOR AUTHORIZED LAW ENFORCEMENT USE ONLY</p>
      </footer>
    </div>
  );
}
