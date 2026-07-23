import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './AdminPanel.css';

export default function AdminSettings() {
    const { data, updateSettings, updateFormField } = useApp();
    const s = data.settings;
    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => updateSettings({ [key]: value });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="admin-panel">
            {/* Company Info */}
            <div className="card mb-section">
                <div className="card-header">
                    <h3 className="card-title">🏢 Company Information</h3>
                </div>
                <div className="grid grid-2" style={{ gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input className="form-control" value={s.companyName} onChange={e => handleChange('companyName', e.target.value)} placeholder="Your company name" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Tagline</label>
                        <input className="form-control" value={s.tagline} onChange={e => handleChange('tagline', e.target.value)} placeholder="Short tagline" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">WhatsApp Number</label>
                        <input className="form-control" value={s.whatsappNumber} onChange={e => handleChange('whatsappNumber', e.target.value)} placeholder="+91 9876543210" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-control" value={s.email} onChange={e => handleChange('email', e.target.value)} placeholder="info@company.com" type="email" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-control" value={s.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 9876543210" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Logo URL (optional)</label>
                        <input className="form-control" value={s.logo} onChange={e => handleChange('logo', e.target.value)} placeholder="https://..." />
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="card mb-section">
                <div className="card-header">
                    <h3 className="card-title">📝 Form Fields</h3>
                    <span className="text-hint">Toggle which fields appear on the user form</span>
                </div>
                <div className="fields-list">
                    {Object.entries(s.formFields).map(([key, field]) => (
                        <div key={key} className="field-row">
                            <div className="field-row-info">
                                <p className="field-key">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                                <input
                                    className="form-control field-label-input"
                                    value={field.label}
                                    onChange={e => updateFormField(key, { label: e.target.value })}
                                    placeholder="Field label"
                                />
                            </div>
                            <div className="field-row-controls">
                                <label className="toggle-row-label">
                                    <span className="text-hint">Required</span>
                                    <label className="toggle">
                                        <input type="checkbox" checked={field.required} onChange={e => updateFormField(key, { required: e.target.checked })} disabled={!field.enabled} />
                                        <span className="toggle-slider" />
                                    </label>
                                </label>
                                <label className="toggle-row-label">
                                    <span className="text-hint">Enabled</span>
                                    <label className="toggle">
                                        <input type="checkbox" checked={field.enabled} onChange={e => updateFormField(key, { enabled: e.target.checked })} />
                                        <span className="toggle-slider" />
                                    </label>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="card mb-section">
                <div className="card-header">
                    <h3 className="card-title">💬 Messages & Templates</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">Success Message</label>
                        <textarea className="form-control" value={s.successMessage} onChange={e => handleChange('successMessage', e.target.value)} rows={3} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">WhatsApp Message Template</label>
                        <textarea className="form-control" value={s.whatsappMessage} onChange={e => handleChange('whatsappMessage', e.target.value)} rows={3} />
                        <p className="form-hint">Variables: {'{name}'}, {'{phone}'}, {'{email}'}, {'{category}'}, {'{subcategory}'}, {'{product}'}, {'{message}'}</p>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="card mb-section">
                <div className="card-header">
                    <h3 className="card-title">🔐 Security</h3>
                </div>
                <div className="form-group" style={{ maxWidth: '240px' }}>
                    <label className="form-label">Admin PIN</label>
                    <input className="form-control" type="password" value={s.adminPin} onChange={e => handleChange('adminPin', e.target.value)} placeholder="New PIN" maxLength={10} />
                    <p className="form-hint">Change your login PIN here</p>
                </div>
            </div>

            <button className={`btn btn-primary btn-lg ${saved ? 'btn-success' : ''}`} onClick={handleSave}>
                {saved ? '✅ Saved!' : '💾 Save Settings'}
            </button>
        </div>
    );
}
