import React, { useState, useEffect } from 'react';
import { Ticket, Users, BarChart, Activity, ShieldAlert, Plus, Loader2, X, Edit2, Save, Database, Cpu, Trash2, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard({ isOpen, onClose, authSession }) {
  const [activeTab, setActiveTab] = useState('finance'); 
  
  // --- STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(10);
  const [daysValid, setDaysValid] = useState(7);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);
  
  const [couponsList, setCouponsList] = useState([]);
  const [couponsListLoading, setCouponsListLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ credits: 0, role: 'user' });
  const [userMessage, setUserMessage] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // --- FETCH ROUTING ---
  useEffect(() => {
    if (isOpen && activeTab === 'users' && authSession) fetchUsers();
    if (isOpen && activeTab === 'coupons' && authSession) fetchCoupons();
    if (isOpen && (activeTab === 'finance' || activeTab === 'logs') && authSession && !stats) fetchStats();
  }, [isOpen, activeTab, authSession]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/users`, {
        headers: { 'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY, 'Authorization': `Bearer ${authSession.access_token}` }
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
        headers: { 'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY, 'Authorization': `Bearer ${authSession.access_token}` }
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
        headers: { 'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY, 'Authorization': `Bearer ${authSession.access_token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      setCouponsList(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setCouponsListLoading(false);
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
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession.access_token}`
        },
        body: JSON.stringify({ code: couponCode, amount: creditsAmount, expires_at: expiresAt.toISOString() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to create coupon');

      setCouponMessage({ type: 'success', text: `Success! Coupon ${couponCode} created.` });
      setCouponCode('');
      fetchCoupons(); // Refresh the list
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
        headers: { 'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY, 'Authorization': `Bearer ${authSession.access_token}` }
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
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession.access_token}`
        },
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

  if (!isOpen) return null;

  const now = new Date();

  return (
    // FIX: Removed padding on mobile (p-0) so the modal consumes 100dvh (Dynamic Viewport Height) natively without browser bar conflicts.
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
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex items-center gap-4 sm:gap-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">GH₵ {stats.total_revenue.toFixed(2)}</h3>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">User Management</h1>
                  <p className="text-slate-400 text-xs sm:text-sm">View, edit, and manage access for all registered accounts.</p>
                </div>
                <button onClick={fetchUsers} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-slate-700">
                  Refresh List
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
                        <th className="px-6 py-4">Credits</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-200">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-mono font-bold">{user.credits}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setEditingUser(user); setEditForm({ credits: user.credits, role: user.role }); }} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors inline-flex">
                              <Edit2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
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

              {/* Form Section */}
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

              {/* Active Coupons List */}
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
                          <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-sm">No promotional codes found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        {/* --- EDIT USER SLIDE-OVER MODAL (Responsive Width) --- */}
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