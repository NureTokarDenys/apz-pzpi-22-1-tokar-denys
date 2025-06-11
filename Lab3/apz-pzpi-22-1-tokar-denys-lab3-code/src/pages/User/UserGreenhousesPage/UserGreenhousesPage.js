import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import greenhouseService from '../../../services/greenhouseService';
import styles from './UserGreenhousesPage.module.css';
import { useAuth } from '../../../hooks/useAuth';

const UserGreenhouseFormModal = ({ greenhouse, availableHardwareIds, onClose, onSave, formError, setFormErrorExternally, currentUserId }) => {
    const [name, setName] = useState(greenhouse?.name || '');
    const [location, setLocation] = useState(greenhouse?.location || '');
    const [hardwareId, setHardwareId] = useState(greenhouse?.hardwareId || '');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrorExternally('');
        if (!name || !hardwareId) {
            setFormErrorExternally('Назва та Hardware ID є обов\'язковими.');
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
        // Власник тут не передається, бо це поточний користувач (встановлюється на бекенді)
        onSave({ _id: greenhouse?._id, name, location, hardwareId, ownerId: currentUserId });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>{greenhouse ? 'Редагувати Мою Теплицю' : 'Створити Нову Теплицю'}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="userGhName">Назва:</label>
                        <input id="userGhName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userGhLocation">Розташування:</label>
                        <input id="userGhLocation" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="userGhHardwareId">Hardware ID Контролера:</label>
                        <input
                            id="userGhHardwareId"
                            type="text"
                            value={hardwareId}
                            onChange={(e) => setHardwareId(e.target.value)}
                            list="userHardwareIdOptions"
                            required
                            disabled={!!greenhouse?.hardwareId && !!greenhouse?._id} // Не можна змінювати Hardware ID для існуючої теплиці користувачем
                            title={greenhouse?.hardwareId && greenhouse?._id ? "Hardware ID не можна змінити після створення теплиці." : ""}
                        />
                        <datalist id="userHardwareIdOptions">
                             {availableHardwareIds
                                .filter(hw => !hw.isAssigned || (greenhouse && hw.hardwareId === greenhouse.hardwareId))
                                .map(hw => <option key={hw._id} value={hw.hardwareId}>{hw.description ? `${hw.hardwareId} (${hw.description})` : hw.hardwareId}</option>)
                            }
                        </datalist>
                         {hardwareId && !availableHardwareIds.some(hw => hw.hardwareId === hardwareId && (!hw.isAssigned || (greenhouse && hw.hardwareId === greenhouse.hardwareId))) &&
                            <small className={styles.warning}>Цей Hardware ID недоступний або вже прив'язаний.</small>
                        }
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


const UserGreenhousesPage = () => {
    const [greenhouses, setGreenhouses] = useState([]);
    const [allowedHardware, setAllowedHardware] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingGreenhouse, setEditingGreenhouse] = useState(null);
    const { currentUser } = useAuth();

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        setError('');
        try {
            const [ghData, hardwareData] = await Promise.all([
                greenhouseService.getMyGreenhouses(),
                greenhouseService.getAllowedHardwareIds() 
            ]);
            setGreenhouses(ghData);
            setAllowedHardware(hardwareData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Не вдалося завантажити дані.');
        }
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDeleteMyGreenhouse = async (greenhouseId, name) => {
        if (window.confirm(`Ви впевнені, що хочете видалити теплицю "${name}" та всі пов'язані дані?`)) {
            setError('');
            try {
                await greenhouseService.deleteMyGreenhouse(greenhouseId);
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

    const handleSaveMyGreenhouse = async (greenhouseData) => {
        setModalError('');
        try {
            if (greenhouseData._id) {
                const dataToUpdate = { name: greenhouseData.name, location: greenhouseData.location };
                // Користувач не може змінювати hardwareId або ownerId існуючої теплиці
                const updated = await greenhouseService.updateMyGreenhouse(greenhouseData._id, dataToUpdate);
                alert(`Теплицю "${updated.name}" успішно оновлено.`);
            } else {
                const created = await greenhouseService.createMyGreenhouse(greenhouseData);
                alert(`Теплицю "${created.name}" успішно створено.`);
            }
            handleCloseModal();
            await fetchData();
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Не вдалося зберегти теплицю.');
        }
    };


    if (loading) return <div className={styles.userPageContainer}><p>Завантаження ваших теплиць...</p></div>;

    return (
        <div className={styles.userPageContainer}>
            <h2>Мої Теплиці</h2>
            {error && <p className={styles.error}>{error}</p>}
            <button onClick={handleOpenCreateModal} className={styles.addButton}>+ Створити Теплицю</button>
            
            {greenhouses.length === 0 && !loading && (
                <p>У вас ще немає зареєстрованих теплиць. Натисніть "+ Створити Теплицю", щоб додати нову.</p>
            )}
            {greenhouses.length > 0 && (
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Назва</th>
                                <th>Розташування</th>
                                <th>Hardware ID</th>
                                <th>Дії</th>
                            </tr>
                        </thead>
                        <tbody>
                            {greenhouses.map(gh => (
                                <tr key={gh._id}>
                                    <td>
                                        <Link to={`/my-greenhouses/${gh._id}`} className={styles.nameLink}>{gh.name}</Link>
                                    </td>
                                    <td>{gh.location || '-'}</td>
                                    <td>{gh.hardwareId || 'Не вказано'}</td>
                                    <td className={styles.actionsCell}>
                                        <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleOpenEditModal(gh)}>Редагувати</button>
                                        <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteMyGreenhouse(gh._id, gh.name)}>Видалити</button>
                                        <Link to={`/my-greenhouses/${gh._id}`} className={`${styles.actionButton} ${styles.detailsButton}`}>Деталі</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showModal && currentUser && (
                <UserGreenhouseFormModal
                    greenhouse={editingGreenhouse}
                    availableHardwareIds={allowedHardware}
                    onClose={handleCloseModal}
                    onSave={handleSaveMyGreenhouse}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                    currentUserId={currentUser._id}
                />
            )}
        </div>
    );
};

export default UserGreenhousesPage;