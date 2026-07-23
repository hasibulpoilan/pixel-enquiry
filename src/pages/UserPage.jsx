import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import './UserPage.css';

const INITIAL_FORM = { name: '', phone: '', email: '', message: '', categoryId: '', subcategoryId: '', productId: '' };
const INITIAL_ERRORS = {};

export default function UserPage() {
    const { data, addEnquiry } = useApp();
    const s = data.settings;
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState(INITIAL_ERRORS);
    const [step, setStep] = useState('form'); // 'form' | 'success'
    const [submitting, setSubmitting] = useState(false);

    const enabledCategories = useMemo(() => data.categories.filter(c => c.enabled), [data.categories]);
    const enabledSubs = useMemo(() => data.subcategories.filter(s => s.enabled && s.categoryId === form.categoryId), [data.subcategories, form.categoryId]);
    const enabledProducts = useMemo(() => data.products.filter(p => {
        if (!p.enabled) return false;
        if (form.categoryId && p.categoryId !== form.categoryId) return false;
        if (form.subcategoryId && p.subcategoryId && p.subcategoryId !== form.subcategoryId) return false;
        return true;
    }), [data.products, form.categoryId, form.subcategoryId]);

    const selectedCat = useMemo(() => enabledCategories.find(c => c.id === form.categoryId), [enabledCategories, form.categoryId]);
    const selectedSub = useMemo(() => enabledSubs.find(s => s.id === form.subcategoryId), [enabledSubs, form.subcategoryId]);
    const selectedProd = useMemo(() => enabledProducts.find(p => p.id === form.productId), [enabledProducts, form.productId]);

    const update = (key, val) => {
        setErrors(e => { const ne = { ...e }; delete ne[key]; return ne; });
        if (key === 'categoryId') {
            setForm(f => ({ ...f, categoryId: val, subcategoryId: '', productId: '' }));
        } else if (key === 'subcategoryId') {
            setForm(f => ({ ...f, subcategoryId: val, productId: '' }));
        } else {
            setForm(f => ({ ...f, [key]: val }));
        }
    };

    const validate = () => {
        const errs = {};
        const fields = s.formFields;
        if (fields.name?.enabled && fields.name?.required && !form.name.trim()) errs.name = 'Name is required';
        if (fields.phone?.enabled && fields.phone?.required && !form.phone.trim()) errs.phone = 'Phone is required';
        if (fields.email?.enabled && fields.email?.required && !form.email.trim()) errs.email = 'Email is required';
        if (fields.email?.enabled && form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
        return errs;
    };

    const buildWhatsAppMessage = () => {
        let msg = s.whatsappMessage || '';
        msg = msg.replace('{name}', form.name);
        msg = msg.replace('{phone}', form.phone);
        msg = msg.replace('{email}', form.email);
        msg = msg.replace('{category}', selectedCat?.name || '');
        msg = msg.replace('{subcategory}', selectedSub?.name || '');
        msg = msg.replace('{product}', selectedProd?.name || '');
        msg = msg.replace('{message}', form.message);
        return msg;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setSubmitting(true);

        const enquiry = {
            name: form.name,
            phone: form.phone,
            email: form.email,
            message: form.message,
            category: selectedCat?.name || '',
            subcategory: selectedSub?.name || '',
            product: selectedProd?.name || '',
        };
        addEnquiry(enquiry);

        setTimeout(() => {
            setSubmitting(false);
            setStep('success');
        }, 800);
    };

    const handleWhatsApp = () => {
        const num = s.whatsappNumber.replace(/\D/g, '');
        const msg = encodeURIComponent(buildWhatsAppMessage());
        window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    };

    const handleReset = () => { setForm(INITIAL_FORM); setErrors({}); setStep('form'); };

    const ff = s.formFields;

    return (
        <div className="user-page">
            {/* Background */}
            <div className="user-bg-orb orb-1" />
            <div className="user-bg-orb orb-2" />

            {/* Header */}
            <header className="user-header">
                <div className="user-header-inner">
                    {s.logo
                        ? <img src={s.logo} alt="Logo" className="user-logo-img" />
                        : <div className="user-logo-icon">✨</div>
                    }
                    <div>
                        <h1 className="user-brand">{s.companyName}</h1>
                        <p className="user-tagline">{s.tagline}</p>
                    </div>
                </div>
                <a href="/admin" className="admin-link-btn" title="Admin">🔐</a>
            </header>

            <main className="user-main">
                {step === 'form' ? (
                    <div className="form-card">
                        <div className="form-card-header">
                            <h2 className="form-card-title">Send an Enquiry</h2>
                            <p className="form-card-sub">Fill in the details below and we'll get back to you shortly!</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            {/* Category selection */}
                            {enabledCategories.length > 0 && (
                                <div className="section-block">
                                    <h3 className="section-label">What are you looking for?</h3>
                                    <div className="category-chips">
                                        {enabledCategories.map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                className={`cat-chip ${form.categoryId === cat.id ? 'active' : ''}`}
                                                onClick={() => update('categoryId', form.categoryId === cat.id ? '' : cat.id)}
                                            >
                                                <span>{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subcategory */}
                            {form.categoryId && enabledSubs.length > 0 && (
                                <div className="section-block animate-in">
                                    <h3 className="section-label">Select a type</h3>
                                    <div className="sub-chips">
                                        {enabledSubs.map(sub => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                className={`sub-chip ${form.subcategoryId === sub.id ? 'active' : ''}`}
                                                onClick={() => update('subcategoryId', form.subcategoryId === sub.id ? '' : sub.id)}
                                            >
                                                {sub.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products */}
                            {form.categoryId && enabledProducts.length > 0 && (
                                <div className="section-block animate-in">
                                    <h3 className="section-label">Select a product <span className="section-optional">(optional)</span></h3>
                                    <div className="products-grid">
                                        {enabledProducts.map(prod => (
                                            <button
                                                key={prod.id}
                                                type="button"
                                                className={`product-card ${form.productId === prod.id ? 'active' : ''}`}
                                                onClick={() => update('productId', form.productId === prod.id ? '' : prod.id)}
                                            >
                                                <div className="product-name">{prod.name}</div>
                                                {prod.price && <div className="product-price">{prod.price}</div>}
                                                {form.productId === prod.id && <div className="product-check">✓</div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Contact details */}
                            <div className="section-block">
                                <h3 className="section-label">Your Details</h3>
                                <div className="contact-fields">
                                    {ff.name?.enabled && (
                                        <div className="form-group">
                                            <label className="form-label">{ff.name.label}{ff.name.required && <span className="required-star">*</span>}</label>
                                            <input className={`form-control ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => update('name', e.target.value)} placeholder={`Enter your name`} />
                                            {errors.name && <p className="form-error">⚠️ {errors.name}</p>}
                                        </div>
                                    )}
                                    {ff.phone?.enabled && (
                                        <div className="form-group">
                                            <label className="form-label">{ff.phone.label}{ff.phone.required && <span className="required-star">*</span>}</label>
                                            <input className={`form-control ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 9876543210" type="tel" />
                                            {errors.phone && <p className="form-error">⚠️ {errors.phone}</p>}
                                        </div>
                                    )}
                                    {ff.email?.enabled && (
                                        <div className="form-group">
                                            <label className="form-label">{ff.email.label}{ff.email.required && <span className="required-star">*</span>}</label>
                                            <input className={`form-control ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" type="email" />
                                            {errors.email && <p className="form-error">⚠️ {errors.email}</p>}
                                        </div>
                                    )}
                                    {ff.message?.enabled && (
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">{ff.message.label}{ff.message.required && <span className="required-star">*</span>}</label>
                                            <textarea className="form-control" value={form.message} onChange={e => update('message', e.target.value)} placeholder="Describe what you need..." rows={3} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button type="submit" className={`btn btn-primary btn-full btn-lg submit-btn ${submitting ? 'loading' : ''}`} disabled={submitting}>
                                {submitting ? <><span className="spinner" /> Sending...</> : '📨 Send Enquiry'}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* SUCCESS SCREEN */
                    <div className="success-card">
                        <div className="success-icon">🎉</div>
                        <h2 className="success-title">Enquiry Sent!</h2>
                        <p className="success-msg">{s.successMessage}</p>

                        {form.name && <p className="success-name">Hi {form.name}! We'll reach out to you soon.</p>}

                        <div className="success-actions">
                            <button className="btn btn-success btn-lg whatsapp-btn" onClick={handleWhatsApp}>
                                <span>💬</span> Continue on WhatsApp
                            </button>
                            {s.phone && (
                                <a href={`tel:${s.phone}`} className="btn btn-secondary btn-lg">📞 Call Us</a>
                            )}
                        </div>

                        <button className="new-enquiry-btn" onClick={handleReset}>+ Submit another enquiry</button>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="user-footer">
                {s.email && <a href={`mailto:${s.email}`} className="footer-link">✉️ {s.email}</a>}
                {s.phone && <a href={`tel:${s.phone}`} className="footer-link">📞 {s.phone}</a>}
                <p className="footer-copy">© {new Date().getFullYear()} {s.companyName}</p>
            </footer>
        </div>
    );
}
