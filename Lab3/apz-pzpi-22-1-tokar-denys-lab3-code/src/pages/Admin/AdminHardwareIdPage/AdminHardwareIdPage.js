import React, { useState, useEffect } from 'react';
// import adminService from '../../../services/adminService'; // Потрібно створити/розширити
import styles from './AdminHardwareIdPage.module.css';

const AdminHardwareIdPage = () => {
    const [allowedIds, setAllowedIds] = useState([]);
    const [newId, setNewId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState(null); // ID для редагування
    const [editText, setEditText] = useState(''); // Текст для редагування

    useEffect(() => {
        const fetchAllowedIds = async () => {
            setLoading(true);
            setError('');
            try {
                // const data = await adminService.getAllowedHardwareIds(); // ПОТРІБНО РЕАЛІЗУВАТИ
                // setAllowedIds(data); // Очікуємо масив рядків
                setAllowedIds(["ESP32_HWID_001", "ESP32_HWID_002", "MY_DEVICE_A"]); // Заглушка
            } catch (err) {
                setError(err.message || 'Failed to fetch allowed hardware IDs.');
            }
            setLoading(false);
        };
        fetchAllowedIds();
    }, []);

    const handleAddId = async (e) => {
        e.preventDefault();
        if (!newId.trim()) return;
        setError('');
        try {
            // const updatedIds = await adminService.addAllowedHardwareId(newId.trim()); // ПОТРІБНО РЕАЛІЗУВАТИ
            // setAllowedIds(updatedIds);
            setAllowedIds(prev => [...prev, newId.trim()]); // Заглушка
            setNewId('');
        } catch (err) {
            setError(err.message || 'Failed to add hardware ID.');
        }
    };

    const handleDeleteId = async (idToDelete) => {
        if (window.confirm(`Are you sure you want to delete hardware ID: ${idToDelete}?`)) {
            setError('');
            try {
                // const updatedIds = await adminService.deleteAllowedHardwareId(idToDelete); // ПОТРІБНО РЕАЛІЗУВАТИ
                // setAllowedIds(updatedIds);
                setAllowedIds(prev => prev.filter(id => id !== idToDelete)); // Заглушка
            } catch (err) {
                setError(err.message || 'Failed to delete hardware ID.');
            }
        }
    };
    
    const handleStartEdit = (id) => {
        setEditId(id);
        setEditText(id);
    };

    const handleSaveEdit = async () => {
        if (!editText.trim() || editText.trim() === editId) {
            setEditId(null);
            return;
        }
        setError('');
        try {
            // await adminService.updateAllowedHardwareId(editId, editText.trim()); // ПОТРІБНО РЕАЛІЗУВАТИ
            setAllowedIds(prev => prev.map(id => (id === editId ? editText.trim() : id))); // Заглушка
            setEditId(null);
        } catch (err) {
            setError(err.message || 'Failed to update hardware ID.');
        }
    };


    if (loading) return <div className={styles.adminPageContainer}><p>Loading allowed Hardware IDs...</p></div>;

    return (
        <div className={styles.adminPageContainer}>
            <h2>Manage Allowed Hardware IDs</h2>
            {error && <p className={styles.error}>{error}</p>}
            <form onSubmit={handleAddId} className={styles.addForm}>
                <input
                    type="text"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="Enter new Hardware ID"
                    required
                />
                <button type="submit">Add ID</button>
            </form>

            <ul className={styles.idList}>
                {allowedIds.map((id) => (
                    <li key={id} className={styles.idItem}>
                        {editId === id ? (
                            <>
                                <input 
                                    type="text" 
                                    value={editText} 
                                    onChange={(e) => setEditText(e.target.value)} 
                                    className={styles.editInput}
                                />
                                <button onClick={handleSaveEdit} className={styles.actionButton}>Save</button>
                                <button onClick={() => setEditId(null)} className={`${styles.actionButton} ${styles.cancelButton}`}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>{id}</span>
                                <div>
                                    <button onClick={() => handleStartEdit(id)} className={styles.actionButton}>Edit</button>
                                    <button onClick={() => handleDeleteId(id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminHardwareIdPage;