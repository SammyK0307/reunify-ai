import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { getChildren, updateChildStatus } from '../lib/api';
import { Users, Search, Filter, MapPin, Calendar, Hash } from 'lucide-react';

export default function CasesPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'found'>('all');
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getChildren().then(setCases).catch(() => {}).finally(() => setFetching(false));
  }, [isAuthenticated]);

  const filtered = cases.filter(c => {
    const matchStatus = filter === 'all' || c.case_status === filter;
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_seen_location.toLowerCase().includes(search.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const markFound = async (childId: string) => {
    try {
      await updateChildStatus(childId, 'found');
      setCases(prev => prev.map(c => c.child_id === childId ? { ...c, case_status: 'found' } : c));
    } catch {}
  };

  if (loading) return null;

  return (
    <Layout>
      <div className="max-w-5xl space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-text">Case Files</h1>
            <p className="text-sm text-text-dim mt-0.5">{cases.length} total records</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input type="text" placeholder="Search by name, location, case #..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-panel border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text
                focus:outline-none focus:border-accent transition-all" />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'found'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all capitalize
                  ${filter === f ? 'bg-accent text-white' : 'bg-panel border border-border text-text-dim hover:text-text'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Cases grid */}
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-panel border border-border rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-dim">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No cases found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <div key={c.child_id} className="bg-panel border border-border rounded-xl p-4 space-y-3 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-text text-sm">{c.name}</div>
                      <div className="text-xs text-text-dim">Age {c.age} · {c.gender}</div>
                    </div>
                  </div>
                  <div className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0
                    ${c.case_status === 'active' ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}>
                    {c.case_status}
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-text-dim">
                  <div className="flex items-center gap-2">
                    <MapPin size={11} className="text-accent shrink-0" />
                    <span className="truncate">{c.last_seen_location}</span>
                  </div>
                  {c.last_seen_date && (
                    <div className="flex items-center gap-2">
                      <Calendar size={11} className="text-accent shrink-0" />
                      <span>{c.last_seen_date}</span>
                    </div>
                  )}
                  {c.case_number && (
                    <div className="flex items-center gap-2">
                      <Hash size={11} className="text-accent shrink-0" />
                      <span className="font-mono">{c.case_number}</span>
                    </div>
                  )}
                </div>
                {user?.role === 'admin' && c.case_status === 'active' && (
                  <button onClick={() => markFound(c.child_id)}
                    className="w-full py-1.5 text-xs rounded-lg bg-success/10 text-success border border-success/20
                      hover:bg-success/20 transition-all font-semibold">
                    ✓ Mark as Found
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
