import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
    const { adminLogin, data } = useApp();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            const ok = adminLogin(pin);
            if (ok) {
                navigate('/admin/dashboard');
            } else {
                setError('Incorrect PIN. Please try again.');
                setPin('');
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="login-page">
            {/* Background orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div className="login-container">
                <div className="login-brand">
                    {data.settings.logo
                        ? <img src={data.settings.logo} alt="Logo" className="login-logo-img" />
                        : <div className="login-logo-icon">🔐</div>
                    }
                    <h1 className="login-brand-name">{data.settings.companyName}</h1>
                    <p className="login-brand-tagline">Admin Control Panel</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admin PIN</label>
                        <input
                            type="password"
                            className="form-control pin-input"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter your 4-digit PIN"
                            maxLength={10}
                            autoFocus
                        />
                        {error && <p className="form-error">⚠️ {error}</p>}
                    </div>

                    <button type="submit" className={`btn btn-primary btn-full btn-lg ${loading ? 'loading' : ''}`} disabled={loading || !pin}>
                        {loading ? <><span className="spinner" /> Verifying...</> : '🔓 Enter Dashboard'}
                    </button>
                </form>

                <a href="/" className="login-back-link">← Back to Enquiry Form</a>

                <div className="login-hint">
                    <p>Default PIN: <code>1234</code> (change in Settings)</p>
                </div>
            </div>
        </div>
    );
}
