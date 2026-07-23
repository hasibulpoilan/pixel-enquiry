import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './MainPage.css';
import { Camera, Send, CheckCircle2, Trash2, Edit2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, X, Phone, Mail, ImageOff, Plus, Settings } from 'lucide-react';


const INR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

/* ============================================================
   INLINE EDITABLE TEXT
   ============================================================ */
function InlineText({ value, onSave, className = '', placeholder = '' }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    if (!editing) return (
        <span className={className} onClick={() => setEditing(true)} title="Click to edit" style={{ cursor: 'pointer', borderBottom: '1px dashed #f90' }}>
            {value || placeholder}
        </span>
    );
    return (
        <input
            autoFocus
            className={`il-input ${className}`}
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => { onSave(val); setEditing(false); }}
            onKeyDown={e => {
                if (e.key === 'Enter') { onSave(val); setEditing(false); }
                if (e.key === 'Escape') { setVal(value); setEditing(false); }
            }}
        />
    );
}

/* ============================================================
   PRODUCT DETAIL MODAL
   ============================================================ */
function ProductDetailModal({ product, adminMode, onUpdate, onClose }) {
    const [imgIdx, setImgIdx] = useState(0);
    const fileRef = useRef();

    // All images: main image + extra images
    const allImages = [
        ...(product.image ? [product.image] : []),
        ...(product.images || []),
    ].filter(Boolean);

    const totalImgs = allImages.length;
    const handlePrev = () => setImgIdx(i => (i - 1 + totalImgs) % totalImgs);
    const handleNext = () => setImgIdx(i => (i + 1) % totalImgs);

    // Admin: add image
    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const newImages = [...(product.images || []), reader.result];
            // Also set main image if none
            if (!product.image) {
                onUpdate({ image: reader.result, images: newImages.slice(1) });
            } else {
                onUpdate({ images: newImages });
            }
        };
        reader.readAsDataURL(file);
    };

    // Admin: remove current image
    const handleRemoveImage = () => {
        const updated = allImages.filter((_, i) => i !== imgIdx);
        setImgIdx(Math.max(0, imgIdx - 1));
        onUpdate({
            image: updated[0] || '',
            images: updated.slice(1),
        });
    };

    // Admin: edit description line
    const updateDescLine = (idx, val) => {
        const desc = [...(product.description || [])];
        desc[idx] = val;
        onUpdate({ description: desc });
    };
    const addDescLine = () => onUpdate({ description: [...(product.description || []), ''] });
    const removeDescLine = (idx) => {
        const desc = (product.description || []).filter((_, i) => i !== idx);
        onUpdate({ description: desc });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="pm-header">
                    <h2 className="pm-title">{product.name}</h2>
                    <button className="pm-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="pm-body">
                    {/* LEFT: Image carousel */}
                    <div className="pm-images">
                        <div className="pm-carousel">
                            {allImages.length > 0 ? (
                                <>
                                    <img src={allImages[imgIdx]} alt={product.name} className="pm-img" />
                                    {allImages.length > 1 && (
                                        <>
                                            <button className="carousel-btn prev" onClick={handlePrev}><ChevronLeft size={24} /></button>
                                            <button className="carousel-btn next" onClick={handleNext}><ChevronRight size={24} /></button>
                                            <p className="carousel-count">{imgIdx + 1} / {totalImgs}</p>
                                        </>
                                    )}
                                    {adminMode && (
                                        <button className="pm-remove-img" onClick={handleRemoveImage} title="Remove this image"><Trash2 size={16} /></button>
                                    )}
                                </>
                            ) : (
                                <div className="pm-no-img">
                                    <ImageOff size={48} color="#ccc" />
                                    <p>No image</p>
                                </div>
                            )}
                        </div>
                        {adminMode && (
                            <>
                                <button className="pm-add-img-btn" onClick={() => fileRef.current.click()}><Plus size={16} style={{ marginRight: '4px', verticalAlign: '-3px' }} /> Add Image</button>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddImage} />
                            </>
                        )}
                    </div>

                    {/* RIGHT: Description */}
                    <div className="pm-desc">
                        <h3 className="pm-desc-title">Description</h3>
                        <div className="pm-price-badge">{INR(product.price)}</div>

                        <ol className="pm-desc-list">
                            {(product.description || []).map((line, i) => (
                                <li key={i} className="pm-desc-item">
                                    {adminMode ? (
                                        <div className="desc-edit-row">
                                            <input
                                                className="il-input desc-input"
                                                value={line}
                                                onChange={e => updateDescLine(i, e.target.value)}
                                                placeholder="Feature description..."
                                            />
                                            <button className="act-btn del" onClick={() => removeDescLine(i)}><Trash2 size={16} /></button>
                                        </div>
                                    ) : (
                                        <span>{line}</span>
                                    )}
                                </li>
                            ))}
                        </ol>

                        {adminMode && (
                            <button className="pm-add-desc-btn" onClick={addDescLine}><Plus size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Add feature</button>
                        )}

                        {(product.description || []).length === 0 && !adminMode && (
                            <p className="pm-no-desc">No description available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   PRODUCT ROW
   ============================================================ */
function ProductRow({ product, selected, onToggle, adminMode, onEdit, onDelete, onView }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: product.name,
        price: product.price,
        image: product.image,
        desc: (product.description || []).join('\n'),
    });
    const fileRef = useRef();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
        reader.readAsDataURL(file);
    };

    const parseDesc = (text) => text.split('\n').map(l => l.trim()).filter(Boolean);

    const handleSave = () => {
        onEdit({ name: form.name, price: Number(form.price), image: form.image, description: parseDesc(form.desc) });
        setEditing(false);
    };

    const thumb = product.image || (product.images && product.images[0]) || null;

    if (adminMode && editing) {
        return (
            <div className="product-row editing">
                <div className="edit-form">
                    <div className="edit-img-wrap">
                        <img src={form.image || `https://placehold.co/48x48/eee/999?text=${encodeURIComponent(form.name.charAt(0))}`} alt="" className="prod-img" />
                        <button className="img-upload-btn" onClick={() => fileRef.current.click()}><Camera size={12} /></button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>
                    <input className="il-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
                    <input className="il-input price-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" type="number" />
                </div>
                <textarea
                    className="il-input desc-textarea"
                    value={form.desc}
                    onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                    placeholder="Description (optional) — one feature per line"
                    rows={3}
                />
                <div className="apf-actions">
                    <button className="btn-save" onClick={handleSave}><Check size={16} style={{ marginRight: '4px', verticalAlign: '-3px' }} /> Save</button>
                    <button className="btn-cancel" onClick={() => setEditing(false)}><X size={16} style={{ marginRight: '4px', verticalAlign: '-3px' }} /> Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`product-row ${selected ? 'selected' : ''}`}>
            <input
                type="checkbox"
                className="prod-checkbox"
                checked={selected}
                onChange={() => !adminMode && onToggle(product.id)}
            />
            <img
                src={thumb || `https://placehold.co/48x48/eee/999?text=${encodeURIComponent(product.name.charAt(0))}`}
                alt={product.name}
                className="prod-img"
            />
            <span className="prod-name">{product.name}</span>
            <span className="prod-price">{INR(product.price)}</span>
            {adminMode ? (
                <div className="admin-row-actions">
                    <button className="view-btn" onClick={onView}>View</button>
                    <button className="act-btn edit" onClick={() => setEditing(true)} title="Edit row"><Edit2 size={16} /></button>
                    <button className="act-btn del" onClick={() => { if (confirm(`Delete "${product.name}"?`)) onDelete(); }} title="Delete"><Trash2 size={16} /></button>
                </div>
            ) : (
                <button className="view-btn" onClick={onView}>View</button>
            )}
        </div>
    );
}

/* ============================================================
   ADD PRODUCT FORM
   ============================================================ */
function AddProductForm({ categoryId, onAdd, onCancel }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [desc, setDesc] = useState('');
    const fileRef = useRef();

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setImage(reader.result);
        reader.readAsDataURL(file);
    };

    const parseDesc = (text) => text.split('\n').map(l => l.trim()).filter(Boolean);

    return (
        <div className="add-product-form add-product-form--expanded">
            <div className="apf-row">
                <div className="edit-img-wrap">
                    <img src={image || 'https://placehold.co/48x48/eee/999?text=+'} alt="" className="prod-img" />
                    <button className="img-upload-btn" onClick={() => fileRef.current.click()}><Camera size={12} /></button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>
                <input className="il-input" value={name} onChange={e => setName(e.target.value)} placeholder="Product name *" autoFocus />
                <input className="il-input price-input" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price (₹) *" type="number" />
            </div>
            <textarea
                className="il-input desc-textarea"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Description (optional) — one feature per line e.g.&#10;6 GB RAM | 128 GB Storage&#10;50 MP Camera"
                rows={3}
            />
            <div className="apf-actions">
                <button className="btn-save" onClick={() => { if (name && price) { onAdd({ categoryId, name, price: Number(price), image, images: [], description: parseDesc(desc) }); } }}><Check size={16} style={{ marginRight: '4px', verticalAlign: '-3px' }} /> Add Product</button>
                <button className="btn-cancel" onClick={onCancel}><X size={16} style={{ marginRight: '4px', verticalAlign: '-3px' }} /> Cancel</button>
            </div>
        </div>
    );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function MainPage({ adminMode }) {
    const { data, updateSettings, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct } = useApp();
    const { settings, categories, products } = data;

    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [filterPrice, setFilterPrice] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const toggleProduct = (id) => setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const [addingCat, setAddingCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [addingProductCat, setAddingProductCat] = useState(null);
    const [viewProduct, setViewProduct] = useState(null); // product being viewed in modal
    const logoRef = useRef(null);
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    const PRICE_RANGES = [
        { label: 'All Prices', value: 'all' },
        { label: '₹0 – ₹10,000', value: '0-10000' },
        { label: '₹10,000 – ₹25,000', value: '10000-25000' },
        { label: '₹25,000 – ₹50,000', value: '25000-50000' },
        { label: '₹50,000 – ₹1,00,000', value: '50000-100000' },
        { label: '₹1,00,000+', value: '100000-99999999' },
    ];

    const filteredProducts = useMemo(() => {
        let list = products.filter(p => p.enabled);
        if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        if (filterCat !== 'all') list = list.filter(p => p.categoryId === filterCat);
        if (filterPrice !== 'all') {
            const [min, max] = filterPrice.split('-').map(Number);
            list = list.filter(p => p.price >= min && p.price <= max);
        }
        return list;
    }, [products, search, filterCat, filterPrice]);

    const grouped = useMemo(() => {
        const map = {};
        categories.filter(c => c.enabled).forEach(cat => {
            const prods = filteredProducts.filter(p => p.categoryId === cat.id);
            if (adminMode || prods.length > 0 || filterCat === cat.id) map[cat.id] = { cat, prods };
        });
        return map;
    }, [categories, filteredProducts, filterCat, adminMode]);

    const selectedProducts = products.filter(p => selectedIds.includes(p.id));
    const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);

    const handleSubmit = () => {
        let errs = {};
        if (!form.name.trim()) errs.name = true;
        if (!form.phone.trim()) errs.phone = true;
        if (Object.keys(errs).length) {
            setErrors(errs);
            setDetailsExpanded(true); // Open details if there's an validation error
            return;
        }
        const lines = selectedProducts.map(p => `• ${p.name} — ${INR(p.price)}`).join('\n');
        const msg = `Hi! I'm interested in:\n${lines || 'General Enquiry'}\n\nTotal: ${INR(total)}\n\nName: ${form.name}\nPhone: ${form.phone}${form.email ? `\nEmail: ${form.email}` : ''}`;
        const num = settings.whatsappNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');

        // Reset selections
        setSelectedIds([]);
        setForm({ name: '', phone: '', email: '' });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => updateSettings({ logo: reader.result });
        reader.readAsDataURL(file);
    };

    // Keep modal product in sync when updated
    const handleModalUpdate = (id, updates) => {
        updateProduct(id, updates);
        setViewProduct(p => p ? { ...p, ...updates } : p);
    };

    return (
        <div className={`page-wrap ${!adminMode ? 'user-mode' : ''}`}>
            {/* ========== HEADER ========== */}
            <header className="site-header">
                <div className="header-left">
                    <div className="logo-wrap">
                        {settings.logo
                            ? <img src={settings.logo} alt="logo" className="site-logo" />
                            : <div className="logo-placeholder">📱</div>
                        }
                        {adminMode && (
                            <>
                                <button className="logo-edit-btn" onClick={() => logoRef.current.click()} title="Change logo"><Camera size={14} /></button>
                                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                            </>
                        )}
                    </div>
                    <div>
                        {adminMode
                            ? <InlineText value={settings.companyName} onSave={v => updateSettings({ companyName: v })} className="site-name" placeholder="Company Name" />
                            : <h1 className="site-name">{settings.companyName}</h1>
                        }
                        {adminMode
                            ? <InlineText value={settings.tagline} onSave={v => updateSettings({ tagline: v })} className="site-tagline" placeholder="Tagline" />
                            : <p className="site-tagline">{settings.tagline}</p>
                        }
                    </div>
                </div>
                {adminMode && (
                    <div className="admin-badge">
                        <Settings size={14} style={{ marginRight: '6px' }} />
                        Admin Mode
                        <a href="/" className="admin-exit-btn">← User View</a>
                    </div>
                )}
                {/* admin link removed — direct URL /admin only */}
            </header>

            <div className="divider" />

            {/* ========== BODY ========== */}
            <div className="body-wrap">
                {/* LEFT */}
                <aside className={`left-panel ${detailsExpanded ? 'details-expanded' : ''}`}>
                    <div className="panel-title-wrap" onClick={() => setDetailsExpanded(!detailsExpanded)}>
                        <h2 className="panel-title">YOUR DETAILS</h2>
                        <div className="details-toggle-icon">
                            {detailsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    <div className="details-content">
                        <div className="field-group">
                            <label className="field-label">FULL NAME <span className="req">*</span></label>
                            <input className={`field-input ${errors.name ? 'err' : ''}`} placeholder="e.g. Rahul Sharma" value={form.name}
                                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: false })); }} />
                        </div>

                        <div className="field-group">
                            <label className="field-label">MOBILE NUMBER <span className="req">*</span></label>
                            <input className={`field-input ${errors.phone ? 'err' : ''}`} placeholder="e.g. +91 98765 43210" value={form.phone} type="tel"
                                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: false })); }} />
                        </div>

                        <div className="field-group">
                            <label className="field-label">EMAIL ADDRESS <span className="opt">(optional)</span></label>
                            <input className="field-input" placeholder="e.g. ranu@company.com" value={form.email} type="email"
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>

                        <p className="form-note">
                            We'll email your enquiry and open <span className="wa-text">WhatsApp</span> with your selected phones &amp; total.
                        </p>

                        <button className="whatsapp-btn" onClick={handleSubmit}>
                            <Send size={16} fill="currentColor" style={{ marginRight: '6px', verticalAlign: '-3px' }} />
                            SEND ENQUIRY ON WHATSAPP
                        </button>
                    </div>
                </aside>

                {/* RIGHT */}
                <main className="right-panel">
                    <h2 className="panel-title">CHOOSE PRODUCT(S)</h2>

                    <div className="filters-row">
                        <input className="search-input" placeholder="Search phone name..." value={search} onChange={e => setSearch(e.target.value)} />
                        <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.filter(c => c.enabled).map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={filterPrice} onChange={e => setFilterPrice(e.target.value)}>
                            {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>

                    <div className="selection-bar">
                        <span>{selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} selected</span>
                        <span className="selection-total">{INR(total)}</span>
                    </div>

                    <div className="products-list">
                        {Object.values(grouped).map(({ cat, prods }) => (
                            <div key={cat.id} className="cat-section">
                                <div className="cat-header">
                                    {adminMode
                                        ? <InlineText value={cat.name} onSave={v => updateCategory(cat.id, { name: v })} className="cat-name" />
                                        : <span className="cat-name">{cat.name}</span>
                                    }
                                    {adminMode && (
                                        <button className="act-btn del" onClick={() => { if (confirm(`Delete category "${cat.name}" and all its products?`)) deleteCategory(cat.id); }}><Trash2 size={16} /></button>
                                    )}
                                </div>

                                {prods.map(prod => (
                                    <ProductRow
                                        key={prod.id}
                                        product={prod}
                                        selected={selectedIds.includes(prod.id)}
                                        onToggle={toggleProduct}
                                        adminMode={adminMode}
                                        onEdit={(updates) => updateProduct(prod.id, updates)}
                                        onDelete={() => deleteProduct(prod.id)}
                                        onView={() => setViewProduct(prod)}
                                    />
                                ))}

                                {adminMode && (
                                    addingProductCat === cat.id
                                        ? <AddProductForm categoryId={cat.id} onAdd={(p) => { addProduct(p); setAddingProductCat(null); }} onCancel={() => setAddingProductCat(null)} />
                                        : <button className="add-product-btn" onClick={() => setAddingProductCat(cat.id)}>+ Add product in {cat.name}</button>
                                )}
                            </div>
                        ))}

                        {Object.keys(grouped).length === 0 && (
                            <p className="empty-msg">No products match your filters.</p>
                        )}

                        {adminMode && (
                            <div className="add-cat-wrap">
                                {addingCat ? (
                                    <div className="add-cat-form">
                                        <input className="il-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name" autoFocus
                                            onKeyDown={e => { if (e.key === 'Enter' && newCatName.trim()) { addCategory(newCatName.trim()); setNewCatName(''); setAddingCat(false); } }} />
                                        <button className="btn-save" onClick={() => { if (newCatName.trim()) { addCategory(newCatName.trim()); setNewCatName(''); setAddingCat(false); } }}><Check size={16} /> Add</button>
                                        <button className="btn-cancel" onClick={() => setAddingCat(false)}><X size={16} /></button>
                                    </div>
                                ) : (
                                    <button className="add-cat-btn" onClick={() => setAddingCat(true)}>+ Add new category</button>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ========== FOOTER ========== */}
            <footer className="site-footer">
                <div className="footer-left">
                    {settings.phone && <a href={`tel:${settings.phone}`} className="footer-link"><Phone size={14} /> {settings.phone}</a>}
                    {settings.email && <a href={`mailto:${settings.email}`} className="footer-link"><Mail size={14} /> {settings.email}</a>}
                </div>
                <p className="footer-right">Your data is safe with us. No spam, ever.</p>
            </footer>

            {/* ========== PRODUCT DETAIL MODAL ========== */}
            {viewProduct && (
                <ProductDetailModal
                    product={viewProduct}
                    adminMode={adminMode}
                    onUpdate={(updates) => handleModalUpdate(viewProduct.id, updates)}
                    onClose={() => setViewProduct(null)}
                />
            )}
        </div>
    );
}

