import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { DEFAULT_DATA } from '../data/defaultData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [data, setData] = useState(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: settingsData, error: sErr } = await supabase.from('settings').select('*').limit(1);
            const { data: catsData, error: cErr } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
            const { data: prodsData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });

            if (sErr) console.error("Settings Error:", sErr);
            if (cErr) console.error("Categories Error:", cErr);
            if (pErr) console.error("Products Error:", pErr);

            const s = (settingsData && settingsData[0]) || {};
            const settings = {
                companyName: s.company_name || 'Pixel Solution',
                tagline: s.tagline || '',
                whatsappNumber: s.whatsapp_number || '',
                email: s.email || '',
                logo: s.logo || ''
            };

            const categories = (catsData || []).map(c => ({
                id: c.id,
                name: c.name,
                enabled: c.enabled !== false
            }));

            const products = (prodsData || []).map(p => ({
                id: p.id,
                categoryId: p.category_id,
                name: p.name,
                price: Number(p.price) || 0,
                description: p.description || [],
                images: p.images || [],
                image: (p.images && p.images.length > 0) ? p.images[0] : '',
                enabled: true
            }));

            setData({ settings, categories, products });
        } catch (error) {
            console.error('Error fetching Supabase data:', error);
            alert("Database Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates) => {
        setData(d => ({ ...d, settings: { ...d.settings, ...updates } }));
        const payload = {};
        if (updates.companyName !== undefined) payload.company_name = updates.companyName;
        if (updates.tagline !== undefined) payload.tagline = updates.tagline;
        if (updates.whatsappNumber !== undefined) payload.whatsapp_number = updates.whatsappNumber;
        if (updates.email !== undefined) payload.email = updates.email;
        if (updates.logo !== undefined) payload.logo = updates.logo;

        const { error } = await supabase.from('settings').update(payload).eq('id', 1);
        if (error) alert("Error saving settings: " + error.message);
    };

    const addCategory = async (name) => {
        const tempId = 'temp-' + Date.now();
        setData(d => ({ ...d, categories: [...d.categories, { id: tempId, name, enabled: true }] }));
        const { data: inserted, error } = await supabase.from('categories').insert([{ name }]).select().single();
        if (error) {
            alert("Error adding category: " + error.message);
            return;
        }
        if (inserted) {
            setData(d => ({ ...d, categories: d.categories.map(c => c.id === tempId ? { id: inserted.id, name: inserted.name, enabled: inserted.enabled } : c) }));
        }
    };

    const updateCategory = async (id, updates) => {
        setData(d => ({ ...d, categories: d.categories.map(c => c.id === id ? { ...c, ...updates } : c) }));
        const { error } = await supabase.from('categories').update(updates).eq('id', id);
        if (error) alert("Error updating category: " + error.message);
    };

    const deleteCategory = async (id) => {
        setData(d => ({ ...d, categories: d.categories.filter(c => c.id !== id), products: d.products.filter(p => p.categoryId !== id) }));
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) alert("Error deleting category: " + error.message);
    };

    const addProduct = async (prod) => {
        const tempId = 'temp-' + Date.now();
        setData(d => ({ ...d, products: [...d.products, { ...prod, id: tempId }] }));

        const payload = {
            category_id: prod.categoryId,
            name: prod.name,
            price: prod.price || 0,
            description: (prod.description && prod.description.length > 0) ? prod.description : [],
            images: prod.images || (prod.image ? [prod.image] : [])
        };

        const { data: inserted, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) {
            alert("Error adding product: " + error.message);
            return;
        }
        if (inserted) {
            setData(d => ({
                ...d, products: d.products.map(p => p.id === tempId ?
                    { ...p, id: inserted.id, categoryId: inserted.category_id, name: inserted.name, price: inserted.price, image: (inserted.images && inserted.images[0]) || '', images: inserted.images || [] } : p)
            }));
        }
    };

    const updateProduct = async (id, updates) => {
        setData(d => ({ ...d, products: d.products.map(p => p.id === id ? { ...p, ...updates } : p) }));

        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.images !== undefined) payload.images = updates.images;

        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) alert("Error updating product: " + error.message);
    };

    const deleteProduct = async (id) => {
        setData(d => ({ ...d, products: d.products.filter(p => p.id !== id) }));
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert("Error deleting product: " + error.message);
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fff' }}>Loading Data...</div>;
    }

    return (
        <AppContext.Provider value={{ data, updateSettings, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct }}>
            {children}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);
