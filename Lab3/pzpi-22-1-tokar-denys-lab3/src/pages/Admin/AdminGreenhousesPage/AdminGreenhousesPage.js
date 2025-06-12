import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../../services/adminService';
import styles from './AdminGreenhousesPage.module.css';

const GreenhouseFormModal = ({ greenhouse, users, availableHardwareIds, onClose, onSave, formError, setFormErrorExternally }) => {
    const [name, setName] = useState(greenhouse?.name || '');
    const [location, setLocation] = useState(greenhouse?.location || '');
    const [hardwareId, setHardwareId] = useState(greenhouse?.hardwareId || '');
    const [ownerId, setOwnerId] = useState(greenhouse?.ownerId?._id || greenhouse?.ownerId || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrorExternally('');
        if (!name || !hardwareId || !ownerId) {
            setFormErrorExternally('Назва, Hardware ID та Власник є обов\'язковими.');
            return;
        }
        
        const selectedHwEntry = availableHardwareIds.find(hw => hw.hardwareId === hardwareId);

        if (!selectedHwEntry) {
            setFormErrorExternally(`Hardware ID '${hardwareId}' відсутній у списку дозволених або недоступний.`);
            return;
        }
        if (selectedHwEntry.isAssigned && selectedHwEntry.assignedGreenhouseId && selectedHwEntry.assignedGreenhouseId.toString() !== greenhouse?._id?.toString()) {
            setFormErrorExternally(`Hardware ID '${hardwareId}' вже прив'язаний до іншої теплиці.`);
            return;
        }
        onSave({ _id: greenhouse?._id, name, location, hardwareId, ownerId });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{greenhouse ? 'Редагувати Теплицю' : 'Створити Нову Теплицю'}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="ghName">Назва:</label>
                        <input id="ghName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ghLocation">Розташування:</label>
                        <input id="ghLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="ghHardwareId">Hardware ID Контролера:</label>
                        <input
                            id="ghHardwareId"
                            type="text"
                            value={hardwareId}
                            onChange={(e) => setHardwareId(e.target.value)}
                            list="hardwareIdOptions"
                            required
                        />
                        <datalist id="hardwareIdOptions">
                            {availableHardwareIds
                                .filter(hw => !hw.isAssigned || (greenhouse && hw.hardwareId === greenhouse.hardwareId))
                                .map(hw => <option key={hw._id} value={hw.hardwareId}>{hw.description ? `${hw.hardwareId} (${hw.description})` : hw.hardwareId}</option>)
                            }
                        </datalist>
                        {hardwareId && !availableHardwareIds.some(hw => hw.hardwareId === hardwareId && (!hw.isAssigned || (greenhouse && hw.hardwareId === greenhouse.hardwareId))) &&
                            <small className={styles.warning}>Цей Hardware ID недоступний або вже прив'язаний.</small>
                        }
                    </div>
                     <div className={styles.formGroup}>
                        <label htmlFor="ghOwner">Власник:</label>
                        <select id="ghOwner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required>
                            <option value="">Оберіть Власника</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.username} ({user.email || 'Без email'})</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={`${styles.actionButton} ${styles.saveButton}`}>Зберегти</button>
                        <button type="button" onClick={onClose} className={`${styles.actionButton} ${styles.cancelButton}`}>Скасувати</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminGreenhousesPage = () => {
    const [greenhouses, setGreenhouses] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allowedHardware, setAllowedHardware] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGreenhouse, setEditingGreenhouse] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [ghData, usersData, hardwareData] = await Promise.all([
                adminService.getAllGreenhousesAdmin(),
                adminService.getAllUsers(),
                adminService.getAllowedHardwareIds()
            ]);
            setGreenhouses(ghData);
            setAllUsers(usersData.filter(u => u.role === 'user'));
            setAllowedHardware(hardwareData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Не вдалося завантажити дані.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteGreenhouse = async (greenhouseId, name) => {
        if (window.confirm(`Ви впевнені, що хочете видалити теплицю "${name}" та всі пов'язані дані? Це також звільнить її Hardware ID.`)) {
            setError('');
            try {
                await adminService.deleteGreenhouseAdmin(greenhouseId);
                await fetchData();
                alert(`Теплицю "${name}" успішно видалено.`);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити теплицю.');
            }
        }
    };

    const handleOpenCreateModal = () => {
        setEditingGreenhouse(null);
        setModalError('');
        setShowModal(true);
    };
    
    const handleOpenEditModal = (greenhouse) => {
        setEditingGreenhouse(greenhouse);
        setModalError('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGreenhouse(null);
        setModalError('');
    };

    const handleSaveGreenhouse = async (greenhouseData) => {
        setModalError('');
        try {
            if (greenhouseData._id) {
                const updated = await adminService.updateGreenhouseAdmin(greenhouseData._id, greenhouseData);
                alert(`Теплицю "${updated.name}" успішно оновлено.`);
            } else {
                const created = await adminService.createGreenhouseAdmin(greenhouseData);
                alert(`Теплицю "${created.name}" успішно створено.`);
            }
            handleCloseModal();
            await fetchData();
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Не вдалося зберегти теплицю.');
        }
    };

    if (loading) return <div className={styles.adminPageContainer}><p>Завантаження теплиць...</p></div>;
    
    return (
        <div className={styles.adminPageContainer}>
            <h2>Керування Теплицями</h2>
            {error && <p className={styles.error}>{error}</p>}
            <button onClick={handleOpenCreateModal} className={styles.addButton}>+ Створити Теплицю</button>
            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Назва</th>
                            <th>Розташування</th>
                            <th>Hardware ID</th>
                            <th>Власник</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {greenhouses.length > 0 ? greenhouses.map(gh => (
                            <tr key={gh._id}>
                                <td>
                                    <Link to={`/admin/greenhouses/${gh._id}`} className={styles.nameLink}>{gh.name}</Link>
                                </td>
                                <td>{gh.location || '-'}</td>
                                <td>{gh.hardwareId || 'Не вказано'}</td>
                                <td>{gh.ownerId?.username || (typeof gh.ownerId === 'string' ? gh.ownerId : 'N/A')}</td>
                                <td className={styles.actionsCell}>
                                    <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleOpenEditModal(gh)}>Редагувати</button>
                                    <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteGreenhouse(gh._id, gh.name)}>Видалити</button>
                                    <Link to={`/admin/greenhouses/${gh._id}`} className={`${styles.actionButton} ${styles.detailsButton}`}>Деталі</Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5">Теплиць не знайдено.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <GreenhouseFormModal
                    greenhouse={editingGreenhouse}
                    users={allUsers}
                    availableHardwareIds={allowedHardware}
                    onClose={handleCloseModal}
                    onSave={handleSaveGreenhouse}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                />
            )}
        </div>
    );
};

export default AdminGreenhousesPage;