import React, { useState, useEffect } from 'react';
// import adminService from '../../../services/adminService'; // Потрібно створити або розширити існуючий greenhouseService
import styles from './AdminGreenhousesPage.module.css';
// import { Link } from 'react-router-dom'; // Для переходу на детальну сторінку теплиці

const AdminGreenhousesPage = () => {
    const [greenhouses, setGreenhouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchGreenhouses = async () => {
            setLoading(true);
            setError('');
            try {
                // const data = await adminService.getAllGreenhouses(); // ПОТРІБНО РЕАЛІЗУВАТИ
                // setGreenhouses(data);
                setGreenhouses([ // Заглушка
                    {_id: 'gh1', name: 'My First Greenhouse', location: 'Backyard', hardwareId: 'ESP32_HWID_001', owner: {username: 'user1'}},
                    {_id: 'gh2', name: 'Experimental Setup', location: 'Lab', hardwareId: 'ESP32_HWID_002', owner: {username: 'user2'}},
                ]);
            } catch (err) {
                setError(err.message || 'Failed to fetch greenhouses.');
            }
            setLoading(false);
        };
        fetchGreenhouses();
    }, []);

    const handleDeleteGreenhouse = async (greenhouseId) => {
        if (window.confirm('Are you sure you want to delete this greenhouse and all its related data?')) {
            try {
                // await adminService.deleteGreenhouse(greenhouseId); // ПОТРІБНО РЕАЛІЗУВАТИ
                // setGreenhouses(greenhouses.filter(gh => gh._id !== greenhouseId));
                alert('Delete greenhouse functionality not yet implemented.');
            } catch (err) {
                setError(err.message || 'Failed to delete greenhouse.');
            }
        }
    };

    if (loading) return <div className={styles.adminPageContainer}><p>Loading greenhouses...</p></div>;
    if (error) return <div className={styles.adminPageContainer}><p className={styles.error}>{error}</p></div>;

    return (
        <div className={styles.adminPageContainer}>
            <h2>Manage All Greenhouses</h2>
            {/* TODO: Кнопка/форма для створення нової теплиці адміністратором */}
            <table className={styles.dataTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Hardware ID</th>
                        <th>Owner</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {greenhouses.map(gh => (
                        <tr key={gh._id}>
                            <td>{gh.name}</td>
                            <td>{gh.location || '-'}</td>
                            <td>{gh.hardwareId || 'Not set'}</td>
                            <td>{gh.owner?.username || 'N/A'}</td>
                            <td>
                                {/* <Link to={`/admin/greenhouses/${gh._id}`} className={styles.actionButton}>View/Edit Details</Link> */}
                                <button className={styles.actionButton} onClick={() => alert('View/Edit Details not implemented')}>Details</button>
                                <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeleteGreenhouse(gh._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminGreenhousesPage;