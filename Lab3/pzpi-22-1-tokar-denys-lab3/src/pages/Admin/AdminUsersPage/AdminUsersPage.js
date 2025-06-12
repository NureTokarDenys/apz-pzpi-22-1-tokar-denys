import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../../services/adminService';
import styles from './AdminUsersPage.module.css';

const EditUserModal = ({ user, onSave, onClose, formError, setFormErrorExternally }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState(user.role);
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrorExternally('');
        const updatedData = { username, email, role };
        if (password) {
            updatedData.password = password;
        }
        onSave(user._id, updatedData);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>Редагувати Користувача: {user.username}</h3>
                {formError && <p className={styles.error}>{formError}</p>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="editUsername">Ім'я користувача:</label>
                        <input id="editUsername" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editEmail">Email:</label>
                        <input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editRole">Роль:</label>
                        <select id="editRole" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">Користувач</option>
                            <option value="admin">Адміністратор</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editPassword">Новий Пароль (залиште порожнім, щоб не змінювати):</label>
                        <input id="editPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
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


const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Не вдалося завантажити користувачів.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Ви впевнені, що хочете видалити користувача "${username}"? Цю дію неможливо буде скасувати.`)) {
            setError('');
            try {
                await adminService.deleteUserByAdmin(userId);
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                alert(`Користувача "${username}" успішно видалено.`);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Не вдалося видалити користувача.');
            }
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
        setModalError('');
    };

    const handleCloseEditModal = () => {
        setEditingUser(null);
        setModalError('');
    };

    const handleSaveUser = async (userId, updatedData) => {
        setModalError('');
        try {
            const updatedUserResponse = await adminService.updateUserByAdmin(userId, updatedData);
            setUsers(prevUsers => prevUsers.map(user => (user._id === userId ? updatedUserResponse : user)));
            setEditingUser(null);
            alert(`Користувача "${updatedUserResponse.username}" успішно оновлено.`);
        } catch (err) {
            setModalError(err.response?.data?.message || err.message || 'Не вдалося оновити користувача.');
        }
    };
    
    if (loading) return <div className={styles.adminPageContainer}><p>Завантаження користувачів...</p></div>;

    return (
        <div className={styles.adminPageContainer}>
            <h2>Керування Користувачами</h2>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>Ім'я користувача</th>
                            <th>Email</th>
                            <th>Роль</th>
                            <th>Зареєстровано</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.role}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className={styles.actionsCell}>
                                    <button 
                                        className={`${styles.actionButton} ${styles.editButton}`} 
                                        onClick={() => handleOpenEditModal(user)}
                                    >
                                        Редагувати
                                    </button>
                                    <button 
                                        className={`${styles.actionButton} ${styles.deleteButton}`} 
                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                    >
                                        Видалити
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5">Користувачів не знайдено.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onSave={handleSaveUser}
                    onClose={handleCloseEditModal}
                    formError={modalError}
                    setFormErrorExternally={setModalError}
                />
            )}
        </div>
    );
};

export default AdminUsersPage;