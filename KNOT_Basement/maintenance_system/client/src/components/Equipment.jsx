import React, { useState, useEffect } from 'react';
import { Search, Filter, Wrench, AlertTriangle, CheckCircle2, History, MoreVertical } from 'lucide-react';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch('http://localhost:5003/api/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = equipment.filter(item => 
    (item.name.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory === '' || item.category === filterCategory)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin text-primary"><Wrench size={32} /></div>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-24 pt-8">
      <section className="py-2 mb-6">
        <h1 className="text-3xl font-bold leading-tight">Equipment & Tools</h1>
        <p className="text-sm text-slate-500 mt-2">Manage maintenance assets and inventory.</p>
      </section>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            className="w-full border border-slate-200 bg-white rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary shadow-sm outline-none transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="IT">IT</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger-fade-in">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group dark:bg-slate-800 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${
                item.status === 'Available' ? 'bg-green-50 text-green-500 dark:bg-green-500/10' :
                item.status === 'In Use' ? 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' :
                'bg-orange-50 text-orange-500 dark:bg-orange-500/10'
              }`}>
                <Wrench size={24} />
              </div>
              <button className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
                <MoreVertical size={20} />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-900 mb-1 dark:text-white">{item.name}</h3>
            <p className="text-xs text-slate-500 mb-4 dark:text-slate-400">{item.category} • Last used {item.last_used}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'Available' ? 'bg-green-500' :
                  item.status === 'In Use' ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{item.status}</span>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider">
                View History
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
          <AlertTriangle className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-bold">No equipment found</p>
        </div>
      )}
    </main>
  );
}
