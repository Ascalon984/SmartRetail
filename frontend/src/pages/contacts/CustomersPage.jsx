import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { fetchCustomers } from '../../services/dummyData';

export default function CustomersPage() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetchCustomers().then(d => { setList(d); setLoading(false); }); }, []);

    const filtered = search ? list.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : list;

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-400)', borderTopColor: 'transparent' }} /></div>;

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>Pelanggan</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{list.length} pelanggan</p>
                </div>
                <button className="btn-primary text-sm py-2.5 px-5"><Plus className="w-4 h-4" /> Tambah</button>
            </div>
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text-muted)' }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari..." className="input-field pl-12" /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(c => (
                    <div key={c.id} className="card p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>{c.name.charAt(0)}</div>
                                <div><p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{c.name}</p><span className="badge badge-info text-[10px]">{c.total_transactions} trx</span></div>
                            </div>
                            <div className="flex gap-1"><button className="p-1.5 rounded-lg" style={{ color: 'var(--color-warning)' }}><Edit3 className="w-3.5 h-3.5" /></button><button className="p-1.5 rounded-lg" style={{ color: 'var(--color-danger)' }}><Trash2 className="w-3.5 h-3.5" /></button></div>
                        </div>
                        <div className="space-y-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone}</p>
                            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</p>
                            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {c.address}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
