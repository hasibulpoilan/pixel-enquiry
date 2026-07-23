import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminSettings from '../components/admin/AdminSettings';
import AdminCategories from '../components/admin/AdminCategories';
import AdminSubcategories from '../components/admin/AdminSubcategories';
import AdminProducts from '../components/admin/AdminProducts';
import AdminEnquiries from '../components/admin/AdminEnquiries';
import './AdminDashboard.css';

const NAV_ITEMS = [
    { id: 'enquiries', label: 'Enquiries', icon: '📋' },
    { id: 'categories', label: 'Categories', icon: '🗂️' },
    { id: 'subcategories', label: 'Subcategories', icon: '📁' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminDashboard() {
    const { isAdmin, adminLogout, data } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('enquiries');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAdmin) {
        navigate('/admin');
        return null;
    }

    const handleLogout = () => {
        adminLogout();
        navigate('/admin');
    };

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-icon">🔐</span>
                        <div>
                            <p className="sidebar-brand-name">{data.settings.companyName}</p>
                            <p className="sidebar-brand-sub">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="admin-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {item.id === 'enquiries' && data.enquiries.length > 0 && (
                                <span className="nav-badge">{data.enquiries.length}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <a href="/" className="admin-nav-item view-form-link" target="_blank" rel="noreferrer">
                        <span className="nav-icon">👁️</span>
                        <span className="nav-label">View User Form</span>
                    </a>
                    <button className="admin-nav-item logout-btn" onClick={handleLogout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                <header className="admin-header">
                    <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>
                    <div className="admin-header-info">
                        <h2 className="admin-header-title">
                            {NAV_ITEMS.find(n => n.id === activeTab)?.icon}{' '}
                            {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                        </h2>
                        <p className="admin-header-sub">Manage your {NAV_ITEMS.find(n => n.id === activeTab)?.label.toLowerCase()}</p>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'enquiries' && <AdminEnquiries />}
                    {activeTab === 'categories' && <AdminCategories />}
                    {activeTab === 'subcategories' && <AdminSubcategories />}
                    {activeTab === 'products' && <AdminProducts />}
                    {activeTab === 'settings' && <AdminSettings />}
                </div>
            </main>
        </div>
    );
}
