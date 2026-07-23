import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminPanel.css';

export default function AdminEnquiries() {
    const { data, deleteEnquiry } = useApp();
    const [selected, setSelected] = useState(null);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };

    const openWhatsApp = (enq) => {
        const num = data.settings.whatsappNumber.replace(/\D/g, '');
        const msg = encodeURIComponent(`Hi ${enq.name}, this is from ${data.settings.companyName}. Regarding your enquiry about ${enq.category || ''} ${enq.subcategory || ''}.`);
        window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
    };

    return (
        <div className="admin-panel">
            <div className="panel-toolbar">
                <div>
                    <h3 className="panel-count">{data.enquiries.length} Enquiries</h3>
                    <p className="panel-sub">Submitted by users</p>
                </div>
            </div>

            {data.enquiries.length === 0 && (
                <div className="empty-state large">
                    <span className="empty-icon">📋</span>
                    <p>No enquiries yet. They'll appear here once users submit the form.</p>
                </div>
            )}

            <div className="enquiry-grid">
                {data.enquiries.map(enq => (
                    <div key={enq.id} className="enquiry-card" onClick={() => setSelected(enq)}>
                        <div className="enquiry-card-top">
                            <div className="enquiry-avatar">{enq.name?.charAt(0)?.toUpperCase() || '?'}</div>
                            <div>
                                <p className="enquiry-name">{enq.name}</p>
                                <p className="enquiry-phone">{enq.phone}</p>
                            </div>
                        </div>
                        <div className="enquiry-tags">
                            {enq.category && <span className="badge badge-primary">{enq.category}</span>}
                            {enq.subcategory && <span className="badge badge-success">{enq.subcategory}</span>}
                            {enq.product && <span className="enquiry-product">📦 {enq.product}</span>}
                        </div>
                        <p className="enquiry-date">{formatDate(enq.createdAt)}</p>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Enquiry Details</h3>
                            <button className="btn-icon" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="enquiry-detail">
                            <div className="detail-row"><span>Name</span><strong>{selected.name || '—'}</strong></div>
                            <div className="detail-row"><span>Phone</span><strong>{selected.phone || '—'}</strong></div>
                            <div className="detail-row"><span>Email</span><strong>{selected.email || '—'}</strong></div>
                            <div className="detail-row"><span>Category</span><strong>{selected.category || '—'}</strong></div>
                            <div className="detail-row"><span>Subcategory</span><strong>{selected.subcategory || '—'}</strong></div>
                            <div className="detail-row"><span>Product</span><strong>{selected.product || '—'}</strong></div>
                            {selected.message && (
                                <div className="detail-message">
                                    <span>Message</span>
                                    <p>{selected.message}</p>
                                </div>
                            )}
                            <div className="detail-row"><span>Submitted</span><strong>{formatDate(selected.createdAt)}</strong></div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="btn btn-success flex-1" onClick={() => openWhatsApp(selected)}>💬 Reply on WhatsApp</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete this enquiry?')) { deleteEnquiry(selected.id); setSelected(null); } }}>🗑️</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
