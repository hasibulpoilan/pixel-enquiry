import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminPanel.css';

const ICONS = ['📱', '💻', '📟', '⌚', '🎮', '📷', '🎵', '📺', '🖨️', '🔌', '💡', '🏠', '🚗', '👗', '💄', '🍕', '🏥', '🏋️', '📚', '✈️'];

function CategoryForm({ initial = {}, onSave, onCancel }) {
    const [name, setName] = useState(initial.name || '');
    const [icon, setIcon] = useState(initial.icon || '📦');

    return (
        <div className="inline-form">
            <div className="form-group">
                <label className="form-label">Category Name</label>
                <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mobile Phones" autoFocus />
            </div>
            <div className="form-group">
                <label className="form-label">Icon</label>
                <div className="icon-picker">
                    {ICONS.map(ic => (
                        <button key={ic} type="button" className={`icon-btn ${icon === ic ? 'selected' : ''}`} onClick={() => setIcon(ic)}>{ic}</button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={() => name.trim() && onSave({ name: name.trim(), icon, enabled: true })}>Save</button>
                <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

export default function AdminCategories() {
    const { data, addCategory, updateCategory, deleteCategory } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleAdd = (cat) => { addCategory(cat); setShowForm(false); };
    const handleEdit = (cat, id) => { updateCategory(id, cat); setEditId(null); };

    return (
        <div className="admin-panel">
            <div className="panel-toolbar">
                <div>
                    <h3 className="panel-count">{data.categories.length} Categories</h3>
                    <p className="panel-sub">Main product/service groups</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Category</button>
                )}
            </div>

            {showForm && (
                <div className="card mb-section">
                    <CategoryForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
                </div>
            )}

            <div className="items-grid">
                {data.categories.map(cat => (
                    <div key={cat.id} className="item-card">
                        {editId === cat.id ? (
                            <CategoryForm initial={cat} onSave={c => handleEdit(c, cat.id)} onCancel={() => setEditId(null)} />
                        ) : (
                            <>
                                <div className="item-card-top">
                                    <span className="item-icon">{cat.icon}</span>
                                    <div className="item-info">
                                        <p className="item-name">{cat.name}</p>
                                        <p className="item-meta">
                                            {data.subcategories.filter(s => s.categoryId === cat.id).length} subcategories ·{' '}
                                            {data.products.filter(p => p.categoryId === cat.id).length} products
                                        </p>
                                    </div>
                                </div>
                                <div className="item-card-actions">
                                    <label className="toggle">
                                        <input type="checkbox" checked={cat.enabled} onChange={e => updateCategory(cat.id, { enabled: e.target.checked })} />
                                        <span className="toggle-slider" />
                                    </label>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(cat.id)}>✏️ Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => { if (confirm(`Delete "${cat.name}" and all its subcategories/products?`)) deleteCategory(cat.id); }}>🗑️</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {data.categories.length === 0 && (
                    <div className="empty-state"><p>No categories yet. Add your first one!</p></div>
                )}
            </div>
        </div>
    );
}
