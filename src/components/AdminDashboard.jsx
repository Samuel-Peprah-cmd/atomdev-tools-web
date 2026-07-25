import React, { useState, useEffect } from 'react';
import { Ticket, Users, BarChart, Activity, ShieldAlert, Plus, Loader2, X, Edit2, Save, Database, Cpu, HardDrive } from 'lucide-react';

export default function AdminDashboard({ isOpen, onClose, authSession }) {
  const [activeTab, setActiveTab] = useState('finance'); 
  
  // --- STATE ---
  const [couponCode, setCouponCode] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(10);
  const [daysValid, setDaysValid] = useState(7);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(null);

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
    if (isOpen && (activeTab === 'finance' || activeTab === 'logs') && authSession && !stats) fetchStats();
  }, [isOpen, activeTab, authSession]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_HEAVY_API_URL}/atomdev-api/admin/users`, {
        headers: {
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession.access_token}`
        }
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
        headers: {
          'X-API-Key': import.meta.env.VITE_ATOMDEV_API_KEY,
          'Authorization': `Bearer ${authSession.access_token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      setStats(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
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
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message });
    } finally {
      setCouponLoading(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-20">
          <X size={20} />
        </button>

        {/* Sidebar */}
        <aside className="w-72 bg-slate-900/50 border-r border-slate-800 p-8 flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-3 mb-10 text-cyan-400">
            <ShieldAlert size={32} />
            <h2 className="text-2xl font-bold tracking-widest uppercase">Admin HQ</h2>
          </div>
          <button onClick={() => setActiveTab('finance')} className={`flex items-center gap-4 p-4 rounded-xl transition-all font-semibold ${activeTab === 'finance' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <BarChart size={20} /> Command Center
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-4 p-4 rounded-xl transition-all font-semibold ${activeTab === 'users' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Users size={20} /> User Management
          </button>
          <button onClick={() => setActiveTab('coupons')} className={`flex items-center gap-4 p-4 rounded-xl transition-all font-semibold ${activeTab === 'coupons' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Ticket size={20} /> Promo Engine
          </button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-4 p-4 rounded-xl transition-all font-semibold ${activeTab === 'logs' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'hover:bg-slate-800/50 text-slate-400'}`}>
            <Activity size={20} /> System Logs
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
          
          {/* --- COMMAND CENTER (FINANCE) --- */}
          {activeTab === 'finance' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Command Center</h1>
                  <p className="text-slate-400 text-sm">Platform statistics and economic overview.</p>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-700">
                  Refresh Data
                </button>
              </div>

              {statsLoading && !stats ? (
                <div className="flex justify-center mt-20 text-cyan-500"><Loader2 className="animate-spin" size={32} /></div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <Users size={28} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</p>
                      <h3 className="text-3xl font-black text-white">{stats.total_users}</h3>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Cpu size={28} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Jobs Run</p>
                      <h3 className="text-3xl font-black text-white">{stats.total_jobs}</h3>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                      <Database size={28} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Credits in Wild</p>
                      <h3 className="text-3xl font-black text-white">{stats.total_credits_in_circulation}</h3>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* --- SYSTEM LOGS --- */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">System Logs</h1>
                  <p className="text-slate-400 text-sm">Real-time feed of the last 100 jobs processed by the engine.</p>
                </div>
                <button onClick={fetchStats} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-700">
                  Refresh Logs
                </button>
              </div>

              {statsLoading && !stats ? (
                 <div className="flex justify-center mt-20 text-cyan-500"><Loader2 className="animate-spin" size={32} /></div>
              ) : stats ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
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
            <div className="w-full">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">User Management</h1>
                  <p className="text-slate-400 text-sm">View, edit, and manage access for all registered accounts.</p>
                </div>
                <button onClick={fetchUsers} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-slate-700">
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
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

          {/* --- COUPONS TAB --- */}
          {activeTab === 'coupons' && (
            <div className="max-w-2xl mt-4">
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Coupon Generator</h1>
              <p className="text-slate-400 mb-10 text-sm">Issue highly secure promotional codes to grant compute credits to users.</p>

              <form onSubmit={handleCreateCoupon} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-xl">
                {couponMessage && (
                  <div className={`p-4 rounded-xl text-sm font-semibold border ${couponMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                    {couponMessage.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Coupon Code</label>
                  <div className="flex gap-3">
                    <input type="text" required value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. ATOM-FREE-50" className="flex-1 px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase font-mono tracking-wide" />
                    <button type="button" onClick={generateRandomCode} className="px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl transition-colors font-bold text-slate-200">Random</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Credits Value</label>
                    <input type="number" min="1" required value={creditsAmount} onChange={(e) => setCreditsAmount(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valid For (Days)</label>
                    <input type="number" min="1" required value={daysValid} onChange={(e) => setDaysValid(e.target.value)} className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono" />
                  </div>
                </div>

                <button type="submit" disabled={couponLoading} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                  {couponLoading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Deploy Coupon</>}
                </button>
              </form>
            </div>
          )}
        </main>

        {/* --- EDIT USER SLIDE-OVER MODAL --- */}
        {editingUser && (
          <div className="absolute inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl p-8 z-30 flex flex-col transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-8">
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