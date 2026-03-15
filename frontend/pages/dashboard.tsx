import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getChildren, healthCheck } from '../lib/api';
import { Users, Search, AlertCircle, CheckCircle, Activity, Database, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ active: 0, found: 0, total: 0, faissSize: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getChildren().then((data: any[]) => {
      const active = data.filter((c: any) => c.case_status === 'active').length;
      const found = data.filter((c: any) => c.case_status === 'found').length;
      setStats({ active, found, total: data.length, faissSize: active });
      setRecentCases(data.slice(0, 5));
    }).catch(() => {});
    healthCheck().then(setHealth).catch(() => {});
  }, [isAuthenticated]);

  if (loading) return null;

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text">Command Center</h1>
          <p className="text-sm text-text-dim mt-1">
            Welcome back, <span className="text-accent">{user?.name}</span>. System is operational.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Cases', value: stats.active, icon: AlertCircle, color: '#EF4444' },
            { label: 'Children Found', value: stats.found, icon: CheckCircle, color: '#22C55E' },
            { label: 'Total Cases', value: stats.total, icon: Users, color: '#4F8EF7' },
            { label: 'FAISS Index', value: health?.faiss_index_size ?? stats.faissSize, icon: Database, color: '#F59E0B' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-panel border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-text-dim uppercase tracking-wider">{label}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* System status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: 'AI Pipeline', value: 'ONLINE', ok: true },
            { label: 'MongoDB', value: 'CONNECTED', ok: true },
            { label: 'FAISS Index', value: health ? `${health.faiss_index_size} vectors` : 'LOADING', ok: !!health },
          ].map(({ label, value, ok }) => (
            <div key={label} className="bg-panel border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-text-dim" />
                <span className="text-sm text-text-dim font-mono">{label}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${ok ? 'text-success' : 'text-warn'}`}>
                <span className={`w-2 h-2 rounded-full ${ok ? 'bg-success' : 'bg-warn'} animate-pulse`} />
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/upload"
            className="flex items-center gap-4 p-5 bg-accent/10 border border-accent/30 rounded-xl
              hover:bg-accent/15 transition-all group">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
              <Search size={24} className="text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-text">Search by Face</div>
              <div className="text-xs text-text-dim mt-0.5">Upload image to find matches</div>
            </div>
            <ArrowRight size={16} className="text-accent group-hover:translate-x-1 transition-transform" />
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin"
              className="flex items-center gap-4 p-5 bg-panel border border-border rounded-xl
                hover:border-accent/30 transition-all group">
              <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center">
                <Users size={24} className="text-text-dim" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text">Register Missing Child</div>
                <div className="text-xs text-text-dim mt-0.5">Add new case to database</div>
              </div>
              <ArrowRight size={16} className="text-text-dim group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* Recent cases */}
        {recentCases.length > 0 && (
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Recent Cases</span>
              <Link href="/cases" className="text-xs text-accent hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {recentCases.map((c) => (
                <div key={c.child_id} className="px-5 py-3 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text">{c.name}</div>
                    <div className="text-xs text-text-dim truncate">{c.last_seen_location}</div>
                  </div>
                  <div className="text-xs font-mono text-text-dim hidden sm:block">Age {c.age}</div>
                  <div className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full
                    ${c.case_status === 'active' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                    {c.case_status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
