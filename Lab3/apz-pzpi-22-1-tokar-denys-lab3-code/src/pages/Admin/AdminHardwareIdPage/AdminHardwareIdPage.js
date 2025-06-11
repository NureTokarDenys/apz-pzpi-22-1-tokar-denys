import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../../services/adminService';
import styles from './AdminHardwareIdPage.module.css';

const AdminHardwareIdPage = () => {
    const [allowedEntries, setAllowedEntries] = useState([]);
    const [newHwId, setNewHwId] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');

    const [editingEntry, setEditingEntry] = useState(null);
    const [editTextHardwareId, setEditTextHardwareId] = useState('');
    const [editTextDescription, setEditTextDescription] = useState('');
    const [editError, setEditError] = useState('');

    const fetchAllowedIds = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllowedHardwareIds();
            setAllowedEntries(data.sort((a, b) => a.hardwareId.localeCompare(b.hardwareId)));
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Не вдалося завантажити список дозволених Hardware ID.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAllowedIds();
    }, [fetchAllowedIds]);

    const handleAddId = async (e) => {
        e.preventDefault();
        if (!newHwId.trim()) {
            setFormError("Hardware ID не може бути порожнім.");
            return;
        }
        setFormError('');
        setError('');
        try {
            await adminService.addAllowedHardwareId({ hardwareId: newHwId.trim(), description: newDescription.trim() });
            fetchAllowedIds();
            setNewHwId('');
            setNewDescription('');
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Не вдалося додати Hardware ID.');
        }
    };

    const handleDeleteId = async (entry) => {
        if (entry.isAssigned) {
            alert(`Hardware ID '${entry.hardwareId}' наразі прив'язаний до теплиці і не може бути видалений напряму. Спочатку відв'яжіть його від теплиці.`);
            return;
        }
        if (window.confirm(`Ви впевнені, що хочете видалити Hardware ID: ${entry.hardwareId}?`)) {
            setError('');
            try {
                await adminService.deleteAllowedHardwareId(entry._id);
                fetchAllowedIds();
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити Hardware ID.');
            }
        }
    };
    
    const handleStartEdit = (entry) => {
        setEditingEntry(entry);
        setEditTextHardwareId(entry.hardwareId);
        setEditTextDescription(entry.description || '');
        setEditError('');
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editTextHardwareId.trim()) {
            setEditError("Hardware ID не може бути порожнім під час редагування.");
            return;
        }
        setEditError('');
        setError('');
        try {
            await adminService.updateAllowedHardwareId(editingEntry._id, { hardwareId: editTextHardwareId.trim(), description: editTextDescription.trim() });
            setEditingEntry(null);
            fetchAllowedIds();
        } catch (err) {
            setEditError(err.response?.data?.message || err.message || 'Не вдалося оновити Hardware ID.');
        }
    };

    const handleCancelEdit = () => {
        setEditingEntry(null);
        setEditError('');
    };

    if (loading) return <div className={styles.adminPageContainer}><p>Завантаження дозволених Hardware ID...</p></div>;

    return (
        <div className={styles.adminPageContainer}>
            <h2>Керування Дозволеними Hardware ID</h2>
            {error && <p className={styles.error}>{error}</p>}
            
            <form onSubmit={handleAddId} className={styles.addForm}>
                <div className={styles.formInputGroup}>
                    <input
                        type="text"
                        value={newHwId}
                        onChange={(e) => setNewHwId(e.target.value)}
                        placeholder="Новий Hardware ID (напр., ESP32_XYZ)"
                        required
                        className={styles.formInput}
                    />
                    <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Опціональний Опис"
                        className={styles.formInput}
                    />
                </div>
                <button type="submit" className={styles.formButton}>Додати ID</button>
                {formError && <p className={`${styles.error} ${styles.formError}`}>{formError}</p>}
            </form>

            {editingEntry && (
                 <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h3>Редагувати Hardware ID</h3>
                        {editError && <p className={styles.error}>{editError}</p>}
                        <form onSubmit={handleSaveEdit}>
                            <div className={styles.formGroup}>
                                <label htmlFor="editHwId">Hardware ID:</label>
                                <input 
                                    type="text" 
                                    id="editHwId"
                                    value={editTextHardwareId} 
                                    onChange={(e) => setEditTextHardwareId(e.target.value)} 
                                    className={styles.editInputFull}
                                    required
                                />
                            </div>
                             <div className={styles.formGroup}>
                                <label htmlFor="editDesc">Опис:</label>
                                <input 
                                    type="text" 
                                    id="editDesc"
                                    value={editTextDescription} 
                                    onChange={(e) => setEditTextDescription(e.target.value)} 
                                    placeholder="Опис"
                                    className={styles.editInputFull}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`}>Зберегти Зміни</button>
                                <button type="button" onClick={handleCancelEdit} className={`${styles.actionButton} ${styles.cancelButton}`}>Скасувати</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Hardware ID</th>
                            <th>Опис</th>
                            <th>Статус</th>
                            <th>Прив'язано до (ID Теплиці)</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allowedEntries.length > 0 ? allowedEntries.map((entry) => (
                            <tr key={entry._id} className={entry.isAssigned ? styles.assignedRow : ''}>
                                <td>{entry.hardwareId}</td>
                                <td>{entry.description || '-'}</td>
                                <td>
                                    {entry.isAssigned ? 
                                        <span className={`${styles.statusBadge} ${styles.assignedBadge}`}>Прив'язано</span> :
                                        <span className={`${styles.statusBadge} ${styles.availableBadge}`}>Доступно</span>
                                    }
                                </td>
                                <td>{entry.assignedGreenhouseId || '-'}</td>
                                <td className={styles.actionsCell}>
                                    <button onClick={() => handleStartEdit(entry)} className={`${styles.actionButton} ${styles.editButton}`}>Редагувати</button>
                                    <button 
                                        onClick={() => handleDeleteId(entry)} 
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={entry.isAssigned}
                                        title={entry.isAssigned ? "Неможливо видалити: ID прив'язаний до теплиці. Спочатку відв'яжіть." : "Видалити ID"}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan="5">{loading? "Завантаження..." : "Дозволених Hardware ID не знайдено. Додайте нові!"}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminHardwareIdPage;