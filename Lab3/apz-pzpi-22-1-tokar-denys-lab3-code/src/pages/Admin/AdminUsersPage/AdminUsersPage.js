import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../../services/adminService';
import styles from './AdminUsersPage.module.css';

const EditUserModal = ({ user, onSave, onClose }) => {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState(user.role);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user._id, { username, email, role });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h3>Edit User: {user.username}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="editUsername">Username:</label>
                        <input id="editUsername" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editEmail">Email:</label>
                        <input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="editRole">Role:</label>
                        <select id="editRole" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                        </select>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="submit" className={styles.actionButton}>Save</button>
                        <button type="button" onClick={onClose} className={`${styles.actionButton} ${styles.cancelButton}`}>Cancel</button>
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
    const [editingUser, setEditingUser] = useState(null); // Для модального вікна редагування

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch users.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
            setError('');
            try {
                await adminService.deleteUserByAdmin(userId);
                setUsers(users.filter(user => user._id !== userId));
                alert(`User "${username}" deleted successfully.`);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to delete user.');
            }
        }
    };

    const handleOpenEditModal = (user) => {
        setEditingUser(user);
    };

    const handleCloseEditModal = () => {
        setEditingUser(null);
    };

    const handleSaveUser = async (userId, updatedData) => {
        setError('');
        try {
            const updatedUser = await adminService.updateUserByAdmin(userId, updatedData);
            setUsers(users.map(user => (user._id === userId ? updatedUser : user)));
            setEditingUser(null);
            alert(`User "${updatedUser.username}" updated successfully.`);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update user.');
            // Не закриваємо модальне вікно при помилці, щоб користувач міг спробувати ще
        }
    };
    
    // TODO: Додати форму/модальне вікно для створення нового користувача (AdminCreateUser)

    if (loading) return <div className={styles.adminPageContainer}><p>Loading users...</p></div>;

    return (
        <div className={styles.adminPageContainer}>
            <h2>Manage Users</h2>
            {error && <p className={styles.error}>{error}</p>}
            {/* <button className={styles.addUserButton}>Add New User</button>  TODO: Implement */}
            <div className={styles.tableContainer}>
                <table className={styles.usersTable}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Registered</th>
                            <th>Actions</th>
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
                                        Edit
                                    </button>
                                    <button 
                                        className={`${styles.actionButton} ${styles.deleteButton}`} 
                                        onClick={() => handleDeleteUser(user._id, user.username)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5">No users found.</td>
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
                />
            )}
        </div>
    );
};

export default AdminUsersPage;