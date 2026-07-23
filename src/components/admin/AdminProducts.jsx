import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminPanel.css';

function ProductForm({ initial = {}, categories, subcategories, onSave, onCancel }) {
    const [name, setName] = useState(initial.name || '');
    const [price, setPrice] = useState(initial.price || '');
    const [categoryId, setCategoryId] = useState(initial.categoryId || (categories[0]?.id || ''));
    const [subcategoryId, setSubcategoryId] = useState(initial.subcategoryId || '');

    const filteredSubs = subcategories.filter(s => s.categoryId === categoryId);

    const handleCatChange = (id) => {
        setCategoryId(id);
        setSubcategoryId('');
    };

    return (
        <div className="inline-form">
            <div className="grid grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. iPhone 15 Pro" autoFocus />
                </div>
                <div className="form-group">
                    <label className="form-label">Price (optional)</label>
                    <input className="form-control" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. ₹79,900" />
                </div>
                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-control" value={categoryId} onChange={e => handleCatChange(e.target.value)}>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Subcategory (optional)</label>
                    <select className="form-control" value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)}>
                        <option value="">— None —</option>
                        {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={() => name.trim() && onSave({ name: name.trim(), price, categoryId, subcategoryId, enabled: true })}>Save</button>
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default function AdminProducts() {
    const { data, addProduct, updateProduct, deleteProduct } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [filterCatId, setFilterCatId] = useState('all');

    const filtered = filterCatId === 'all' ? data.products : data.products.filter(p => p.categoryId === filterCatId);
    const getCat = (id) => data.categories.find(c => c.id === id);
    const getSub = (id) => data.subcategories.find(s => s.id === id);

    return (
        <div className="admin-panel">
            <div className="panel-toolbar">
                <div>
                    <h3 className="panel-count">{data.products.length} Products</h3>
                    <p className="panel-sub">Items users can enquire about</p>
                </div>
                <div className="toolbar-actions">
                    <select className="form-control" style={{ width: 'auto' }} value={filterCatId} onChange={e => setFilterCatId(e.target.value)}>
                        <option value="all">All Categories</option>
                        {data.categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                    {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Product</button>}
                </div>
            </div>

            {showForm && (
                <div className="card mb-section">
                    <ProductForm categories={data.categories} subcategories={data.subcategories} onSave={p => { addProduct(p); setShowForm(false); }} onCancel={() => setShowForm(false)} />
                </div>
            )}

            <div className="items-list">
                {filtered.map(prod => {
                    const cat = getCat(prod.categoryId);
                    const sub = getSub(prod.subcategoryId);
                    return (
                        <div key={prod.id} className="list-item">
                            {editId === prod.id ? (
                                <ProductForm initial={prod} categories={data.categories} subcategories={data.subcategories} onSave={p => { updateProduct(prod.id, p); setEditId(null); }} onCancel={() => setEditId(null)} />
                            ) : (
                                <>
                                    <div className="list-item-info">
                                        <p className="list-item-name">{prod.name}</p>
                                        <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '4px' }}>
                                            {cat && <span className="badge badge-primary">{cat.icon} {cat.name}</span>}
                                            {sub && <span className="badge badge-success">{sub.name}</span>}
                                            {prod.price && <span className="price-tag">{prod.price}</span>}
                                        </div>
                                    </div>
                                    <div className="list-item-actions">
                                        <label className="toggle">
                                            <input type="checkbox" checked={prod.enabled} onChange={e => updateProduct(prod.id, { enabled: e.target.checked })} />
                                            <span className="toggle-slider" />
                                        </label>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setEditId(prod.id)}>✏️</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete "${prod.name}"?`)) deleteProduct(prod.id); }}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
                {filtered.length === 0 && <div className="empty-state"><p>No products found.</p></div>}
            </div>
        </div>
    );
}
