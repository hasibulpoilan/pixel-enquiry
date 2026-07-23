import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminPanel.css';

function SubForm({ initial = {}, categories, onSave, onCancel }) {
    const [name, setName] = useState(initial.name || '');
    const [categoryId, setCategoryId] = useState(initial.categoryId || (categories[0]?.id || ''));

    return (
        <div className="inline-form">
            <div className="grid grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                    <label className="form-label">Subcategory Name</label>
                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. iPhones" autoFocus />
                </div>
                <div className="form-group">
                    <label className="form-label">Parent Category</label>
                    <select className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={() => name.trim() && onSave({ name: name.trim(), categoryId, enabled: true })}>Save</button>
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default function AdminSubcategories() {
    const { data, addSubcategory, updateSubcategory, deleteSubcategory } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [filterCatId, setFilterCatId] = useState('all');

    const filtered = filterCatId === 'all' ? data.subcategories : data.subcategories.filter(s => s.categoryId === filterCatId);
    const getCat = (id) => data.categories.find(c => c.id === id);

    return (
        <div className="admin-panel">
            <div className="panel-toolbar">
                <div>
                    <h3 className="panel-count">{data.subcategories.length} Subcategories</h3>
                    <p className="panel-sub">Nested under categories</p>
                </div>
                <div className="toolbar-actions">
                    <select className="form-control" style={{ width: 'auto' }} value={filterCatId} onChange={e => setFilterCatId(e.target.value)}>
                        <option value="all">All Categories</option>
                        {data.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Subcategory</button>}
                </div>
            </div>

            {showForm && (
                <div className="card mb-section">
                    <SubForm categories={data.categories} onSave={(s) => { addSubcategory(s); setShowForm(false); }} onCancel={() => setShowForm(false)} />
                </div>
            )}

            <div className="items-list">
                {filtered.map(sub => {
                    const cat = getCat(sub.categoryId);
                    return (
                        <div key={sub.id} className="list-item">
                            {editId === sub.id ? (
                                <SubForm initial={sub} categories={data.categories} onSave={s => { updateSubcategory(sub.id, s); setEditId(null); }} onCancel={() => setEditId(null)} />
                            ) : (
                                <>
                                    <div className="list-item-info">
                                        <p className="list-item-name">{sub.name}</p>
                                        {cat && <span className="badge badge-primary">{cat.icon} {cat.name}</span>}
                                    </div>
                                    <div className="list-item-actions">
                                        <label className="toggle">
                                            <input type="checkbox" checked={sub.enabled} onChange={e => updateSubcategory(sub.id, { enabled: e.target.checked })} />
                                            <span className="toggle-slider" />
                                        </label>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditId(sub.id)}>✏️</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete "${sub.name}"?`)) deleteSubcategory(sub.id); }}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && <div className="empty-state"><p>No subcategories found.</p></div>}
            </div>
        </div>
    );
}
