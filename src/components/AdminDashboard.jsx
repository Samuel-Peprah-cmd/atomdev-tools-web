import React, { useState, useEffect } from 'react';
import { Ticket, Users, BarChart, Activity, ShieldAlert, Plus, Loader2, X, Edit2, Save, Database, Cpu, Trash2, DollarSign, Search, Ban, ShieldCheck, AlertTriangle, Server, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ isOpen, onClose, authSession }) {
  const [activeTab, setActiveTab] = useState('finance');

  // --- COUPON STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(10);
  const [daysValid, setDaysValid] = useState(7);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  const [couponsList, setCouponsList] = useState([]);
  const [couponsListLoading, setCouponsListLoading] = useState(false);

  // --- USER MANAGEMENT STATE ---
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ credits: 0, role: 'user' });
  const [userMessage, setUserMessage] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [banningUserId, setBanningUserId] = useState(null);

  // --- FINANCE / STATS STATE ---
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // --- SYSTEM HEALTH STATE ---
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [auditLogLoading, setAuditLogLoading] = useState(false);

  // --- FETCH ROUTING ---
  useEffect(() => {
    if (isOpen && activeTab === 'users' && authSession) fetchUsers();
    if (isOpen && activeTab === 'coupons' && authSession) fetchCoupons();
    if (isOpen && (activeTab === 'finance' || activeTab === 'logs') && authSession && !stats) fetchStats();
    if (isOpen && activeTab === 'health' && authSession) { fetchHealth(); fetchAuditLog(); }
  }, [isOpen, activeTab, authSession]);

  const authHeaders = () => ({
    'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
    'Authorization': `Bearer ${authSession.access_token}`
  });

  const fetchUsers = async (search = searchInput, role = roleFilter) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (role) params.set('role', role);
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/users?${params.toString()}`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      setUsers(await response.json());
    } catch (err) {
      setUserMessage({ type: 'error', text: 'Could not load users.' });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/stats`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      setStats(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsListLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/coupons`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      setCouponsList(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setCouponsListLoading(false);
    }
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/system-health`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch system health');
      setHealth(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchAuditLog = async () => {
    setAuditLogLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/audit-log`, {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch audit log');
      setAuditLog(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLogLoading(false);
    }
  };

  // --- COUPON LOGIC ---
  const generateRandomCode = () => {
    setCouponCode(`ATOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!authSession) return;
    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(daysValid));

      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ code: couponCode, amount: creditsAmount, expires_at: expiresAt.toISOString() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to create coupon');

      setCouponMessage({ type: 'success', text: `Success! Coupon ${couponCode} created.` });
      setCouponCode('');
      fetchCoupons();
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRevokeCoupon = async (code) => {
    if (!window.confirm(`Are you sure you want to revoke ${code}?`)) return;
    try {
      await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      fetchCoupons();
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  // --- USER UPDATE LOGIC ---
  const handleSaveUser = async () => {
    setUserMessage(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error('Failed to update user');

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, credits: editForm.credits, role: editForm.role } : u));
      setEditingUser(null);
      setUserMessage({ type: 'success', text: 'User successfully updated.' });
      setTimeout(() => setUserMessage(null), 3000);
    } catch (err) {
      setUserMessage({ type: 'error', text: err.message });
    }
  };

  const handleBanToggle = async (user) => {
    const action = user.is_banned ? 'unban' : 'ban';
    if (action === 'ban' && !window.confirm(`Suspend ${user.email}? They will be unable to submit jobs until unbanned.`)) return;

    setBanningUserId(user.id);
    try {
      const body = action === 'ban' ? JSON.stringify({ reason: 'Suspended via Admin HQ' }) : undefined;
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/users/${user.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body
      });
      if (!response.ok) throw new Error(`Failed to ${action} user`);

      setUsers(users.map(u => u.id === user.id ? { ...u, is_banned: action === 'ban' } : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setBanningUserId(null);
    }
  };

  if (!isOpen) return null;

  const now = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 transition-all duration-300">
      <div className="bg-slate-950 border-0 sm:border border-slate-800 w-full max-w-6xl h-[100dvh] sm:h-[90vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">

        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-30">
          <X size={20} />
        </button>

        {/* Responsive Sidebar */}
        <aside className="w-full md:w-72 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-6 md:p-8 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="hidden md:flex items-center gap-3 mb-10 text-cyan-400">
            <ShieldAlert size={32} />
            <h2 className="text-2xl font-bold tracking-widest uppercase">Admin HQ</h2>
          </div>

          <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all font-semibold whitespace-nowrap text-xs md:text-sm ${activeTab === 'finance' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <BarChart size={18} /> Command Center
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all font-semibold whitespace-nowrap text-xs md:text-sm ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Users size={18} /> User Management
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all font-semibold whitespace-nowrap text-xs md:text-sm ${activeTab === 'coupons' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Ticket size={18} /> Promo Engine
          </button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all font-semibold whitespace-nowrap text-xs md:text-sm ${activeTab === 'logs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Activity size={18} /> System Logs
          </button>
          <button onClick={() => setActiveTab('health')} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl transition-all font-semibold whitespace-nowrap text-xs md:text-sm ${activeTab === 'health' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Server size={18} /> System Health
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto custom-scrollbar relative pb-24">

          {/* --- COMMAND CENTER (FINANCE) --- */}
          {activeTab === 'finance' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Command Center</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">Platform statistics and economic overview.</p>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-700">
                  Refresh Data
                </button>
              </div>

              {statsLoading && !stats ? (
                <div className="flex justify-center mt-20 text-cyan-500"><Loader2 className="animate-spin" size={32} /></div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Stats Row 1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">GH₵ {stats.total_revenue.toFixed(2)}</h3>
                        {stats.wow_growth_percent !== null && stats.wow_growth_percent !== undefined && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 ${stats.wow_growth_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stats.wow_growth_percent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(stats.wow_growth_percent)}% week-over-week
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Registered Users</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.total_users}</h3>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <Cpu size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Total Jobs Run</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.total_jobs}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row 2 — new */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border ${stats.success_rate >= 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : stats.success_rate >= 70 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Job Success Rate</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">{stats.success_rate}%</h3>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Avg Processing Time</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">
                          {stats.avg_processing_seconds !== null ? `${stats.avg_processing_seconds}s` : '—'}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl mt-6">
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Timeline (GHS)</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chart_data}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `GH₵${value}`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tool Usage Chart — new */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Tool Usage Breakdown</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RBarChart data={stats.tool_usage} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="tool" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 11}} tickLine={false} axisLine={false} width={140} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                            itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                          />
                          <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                        </RBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* --- SYSTEM LOGS --- */}
          {activeTab === 'logs' && (
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">System Logs</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">Real-time feed of the last 100 jobs processed by the engine.</p>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-700">
                  Refresh Logs
                </button>
              </div>

              {statsLoading && !stats ? (
                 <div className="flex justify-center mt-20 text-cyan-500"><Loader2 className="animate-spin" size={32} /></div>
              ) : stats ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Job ID</th>
                        <th className="px-6 py-4">Tool Used</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {stats.recent_jobs.map(job => (
                        <tr key={job.job_id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-mono text-slate-400 text-xs">{job.job_id.split('-')[0]}...</td>
                          <td className="px-6 py-4 text-slate-200 font-semibold">{job.tool_used}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${job.status === 'done' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : job.status === 'failed' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(job.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'users' && (
            <div className="w-full animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">User Management</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">View, search, and manage access for all registered accounts.</p>
                </div>
                <button onClick={() => fetchUsers()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-700">
                  Refresh List
                </button>
              </div>

              {/* Search + filter bar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(searchInput, roleFilter); }}
                    placeholder="Search by email..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(searchInput, e.target.value); }}
                  className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="user">Standard Users</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admins</option>
                </select>
                <button onClick={() => fetchUsers(searchInput, roleFilter)} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors">
                  Search
                </button>
              </div>

              {userMessage && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${userMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                  {userMessage.text}
                </div>
              )}

              {usersLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-cyan-500">
                  <Loader2 className="animate-spin mb-4" size={32} />
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Account Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Credits</th>
                        <th className="px-6 py-4">Total Spent</th>
                        <th className="px-6 py-4">Last Active</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {users.map(user => (
                        <tr key={user.id} className={`hover:bg-slate-800/20 transition-colors ${user.is_banned ? 'opacity-60' : ''}`}>
                          <td className="px-6 py-4 font-medium text-slate-200">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : user.role === 'staff' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.is_banned ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">Suspended</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-mono font-bold">{user.credits}</td>
                          <td className="px-6 py-4 text-slate-300 font-mono">GH₵{user.total_spent_ghs?.toFixed(2) ?? '0.00'}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button onClick={() => { setEditingUser(user); setEditForm({ credits: user.credits, role: user.role }); }} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors inline-flex" title="Edit user">
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleBanToggle(user)}
                              disabled={banningUserId === user.id}
                              className={`p-2 rounded-lg transition-colors inline-flex ml-1 ${user.is_banned ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'}`}
                              title={user.is_banned ? 'Restore account' : 'Suspend account'}
                            >
                              {banningUserId === user.id ? <Loader2 className="animate-spin" size={16} /> : (user.is_banned ? <ShieldCheck size={16} /> : <Ban size={16} />)}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center text-slate-500 text-sm">No users match your search.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* --- PROMO ENGINE (COUPONS TAB) --- */}
          {activeTab === 'coupons' && (
            <div className="w-full animate-fade-in">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Promo Engine</h1>
              <p className="text-slate-400 mb-8 sm:mb-10 text-xs sm:text-sm">Issue and manage secure promotional codes for compute credits.</p>

              <form onSubmit={handleCreateCoupon} className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl mb-10 max-w-3xl">
                {couponMessage && (
                  <div className={`p-4 rounded-xl text-sm font-semibold border flex items-center gap-2 ${couponMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                    {couponMessage.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coupon Code</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" required value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. ATOM-FREE-50" className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase font-mono tracking-wide" />
                    <button type="button" onClick={generateRandomCode} className="px-6 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-colors font-bold text-slate-200">Random</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Credits Value</label>
                    <input type="number" min="1" required value={creditsAmount} onChange={(e) => setCreditsAmount(e.target.value)} className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valid For (Days)</label>
                    <input type="number" min="1" required value={daysValid} onChange={(e) => setDaysValid(e.target.value)} className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
                  </div>
                </div>

                <button type="submit" disabled={couponLoading} className="w-full py-3.5 sm:py-4 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                  {couponLoading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Deploy Coupon</>}
                </button>
              </form>

              <h3 className="text-xl font-bold text-white mb-4">Active Campaigns</h3>
              {couponsListLoading ? (
                <div className="flex justify-center py-10 text-cyan-500"><Loader2 className="animate-spin" size={24} /></div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl custom-scrollbar">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Promo Code</th>
                        <th className="px-6 py-4">Value</th>
                        <th className="px-6 py-4">Redemptions</th>
                        <th className="px-6 py-4">Credits Given Out</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Expires</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {couponsList.map(coupon => {
                        const isExpired = new Date(coupon.expires_at) <= now;
                        return (
                          <tr key={coupon.id} className={`hover:bg-slate-800/20 transition-colors ${isExpired ? 'opacity-50' : ''}`}>
                            <td className="px-6 py-4 font-mono font-bold text-slate-200">{coupon.code}</td>
                            <td className="px-6 py-4 text-cyan-400 font-bold">+{coupon.credits_amount}</td>
                            <td className="px-6 py-4 text-slate-300 font-mono">{coupon.redemptions ?? 0}</td>
                            <td className="px-6 py-4 text-slate-300 font-mono">{coupon.credits_distributed ?? 0}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${isExpired ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{new Date(coupon.expires_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleRevokeCoupon(coupon.code)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors inline-flex" title="Delete Promo">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {couponsList.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-slate-500 text-sm">No promotional codes found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* --- SYSTEM HEALTH TAB --- */}
          {activeTab === 'health' && (
            <div className="w-full animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">System Health</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">Server load, stuck jobs, recent failures, and admin activity.</p>
                </div>
                <button onClick={() => { fetchHealth(); fetchAuditLog(); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-700">
                  Refresh
                </button>
              </div>

              {healthLoading && !health ? (
                <div className="flex justify-center mt-20 text-cyan-500"><Loader2 className="animate-spin" size={32} /></div>
              ) : health ? (
                <div className="space-y-6">
                  {/* Load + memory cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl sm:rounded-3xl shadow-xl">
                      <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">Server Load Average</p>
                      <div className="flex gap-6">
                        <div><span className="text-2xl font-black text-white">{health.load_avg['1min']}</span><p className="text-[10px] text-slate-500 mt-1">1 min</p></div>
                        <div><span className="text-2xl font-black text-white">{health.load_avg['5min']}</span><p className="text-[10px] text-slate-500 mt-1">5 min</p></div>
                        <div><span className="text-2xl font-black text-white">{health.load_avg['15min']}</span><p className="text-[10px] text-slate-500 mt-1">15 min</p></div>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl sm:rounded-3xl shadow-xl">
                      <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">Memory Usage</p>
                      <div className="flex items-center gap-4">
                        <span className={`text-3xl font-black ${health.memory.used_percent > 85 ? 'text-rose-400' : health.memory.used_percent > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {health.memory.used_percent ?? '—'}%
                        </span>
                        <p className="text-xs text-slate-500">{health.memory.available_mb ?? '—'} MB free of {health.memory.total_mb ?? '—'} MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Stuck jobs */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-6 pb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-400" />
                      <h3 className="text-lg font-bold text-white">Stuck Jobs ({health.stuck_jobs.length})</h3>
                      <span className="text-xs text-slate-500 ml-1">— processing for over 30 minutes</span>
                    </div>
                    {health.stuck_jobs.length > 0 ? (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                            <tr><th className="px-6 py-3">Job ID</th><th className="px-6 py-3">Tool</th><th className="px-6 py-3">Started</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {health.stuck_jobs.map(j => (
                              <tr key={j.job_id}>
                                <td className="px-6 py-3 font-mono text-xs text-slate-400">{j.job_id.split('-')[0]}...</td>
                                <td className="px-6 py-3 text-slate-200">{j.tool_used}</td>
                                <td className="px-6 py-3 text-slate-500 text-xs">{new Date(j.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="px-6 pb-6 text-sm text-slate-500">No stuck jobs — everything's flowing normally.</p>
                    )}
                  </div>

                  {/* Recent failures */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-6 pb-4">
                      <h3 className="text-lg font-bold text-white">Recent Failures</h3>
                    </div>
                    {health.recent_failures.length > 0 ? (
                      <div className="overflow-x-auto custom-scrollbar max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                            <tr><th className="px-6 py-3">Job ID</th><th className="px-6 py-3">Tool</th><th className="px-6 py-3">Error</th><th className="px-6 py-3">When</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {health.recent_failures.map(j => (
                              <tr key={j.job_id}>
                                <td className="px-6 py-3 font-mono text-xs text-slate-400">{j.job_id.split('-')[0]}...</td>
                                <td className="px-6 py-3 text-slate-200">{j.tool_used}</td>
                                <td className="px-6 py-3 text-rose-400 text-xs max-w-xs truncate" title={j.error_message}>{j.error_message || '—'}</td>
                                <td className="px-6 py-3 text-slate-500 text-xs">{new Date(j.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="px-6 pb-6 text-sm text-slate-500">No recent failures.</p>
                    )}
                  </div>

                  {/* Admin audit log */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-6 pb-4">
                      <h3 className="text-lg font-bold text-white">Admin Activity Log</h3>
                    </div>
                    {auditLogLoading ? (
                      <div className="flex justify-center py-8 text-cyan-500"><Loader2 className="animate-spin" size={20} /></div>
                    ) : auditLog.length > 0 ? (
                      <div className="overflow-x-auto custom-scrollbar max-h-72 overflow-y-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                          <thead className="bg-slate-950/50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
                            <tr><th className="px-6 py-3">Admin</th><th className="px-6 py-3">Action</th><th className="px-6 py-3">Target</th><th className="px-6 py-3">When</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {auditLog.map(log => (
                              <tr key={log.id}>
                                <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.admin_id.split('-')[0]}...</td>
                                <td className="px-6 py-3 text-slate-200 font-semibold">{log.action}</td>
                                <td className="px-6 py-3 font-mono text-xs text-slate-400">{log.target_user_id ? `${log.target_user_id.split('-')[0]}...` : '—'}</td>
                                <td className="px-6 py-3 text-slate-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="px-6 pb-6 text-sm text-slate-500">No admin actions recorded yet.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </main>

        {/* --- EDIT USER SLIDE-OVER MODAL --- */}
        {editingUser && (
          <div className="absolute inset-y-0 right-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-6 sm:p-8 z-30 flex flex-col transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Account</p>
              <p className="text-sm font-mono text-slate-300 break-all">{editingUser.email}</p>
            </div>
            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Credit Balance</label>
                <input type="number" value={editForm.credits} onChange={(e) => setEditForm({...editForm, credits: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Access Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-500 appearance-none cursor-pointer">
                  <option value="user">Standard User</option>
                  <option value="staff">Staff (credit immunity)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <button onClick={handleSaveUser} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors mt-auto shadow-lg shadow-cyan-900/50">
              <Save size={18} /> Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}