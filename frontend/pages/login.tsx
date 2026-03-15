import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('officer@reunify.ai');
  const [password, setPassword] = useState('demo1234');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 glow">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text">REUNIFY AI</h1>
          <p className="text-xs font-mono text-text-dim mt-1 uppercase tracking-widest">
            Law Enforcement Portal
          </p>
        </div>

        {/* Form */}
        <div className="bg-panel border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-text">Secure Sign In</h2>
            <p className="text-xs text-text-dim">Authorized personnel only</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/30 rounded-lg">
              <AlertTriangle size={14} className="text-danger shrink-0" />
              <span className="text-xs text-danger">{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-text-dim uppercase tracking-wider block mb-1.5">
                Badge Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text
                  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                placeholder="officer@agency.gov" />
            </div>

            <div>
              <label className="text-xs font-mono text-text-dim uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 pr-10 text-sm text-text
                    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-accent rounded-lg text-white text-sm font-semibold
                hover:bg-accent/90 transition-all glow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock size={14} />
                  Access Portal
                </span>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="border-t border-border pt-3">
            <p className="text-[10px] font-mono text-text-dim text-center">
              DEMO — officer@reunify.ai / demo1234
            </p>
            <p className="text-[10px] font-mono text-text-dim text-center">
              ADMIN — admin@reunify.ai / admin1234
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs text-text-dim hover:text-text">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
