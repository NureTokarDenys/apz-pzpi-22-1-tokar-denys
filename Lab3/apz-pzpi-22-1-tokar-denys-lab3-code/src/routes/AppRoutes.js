import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AdminUsersPage from '../pages/Admin/AdminUsersPage';
import AdminGreenhousesPage from '../pages/Admin/AdminGreenhousesPage'; 
import AdminHardwareIdPage from '../pages/Admin/AdminHardwareIdPage'; 
import AdminGreenhouseDetailPage from '../pages/Admin/AdminGreenhouseDetailPage';

import ProtectedRoute from './ProtectedRoute';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const AppRoutes = () => {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <main style={{ flexGrow: 1, padding: '1rem' }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<DashboardPage />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                            <Route path="/admin/greenhouses" element={<AdminGreenhousesPage />} />
                            <Route path="/admin/greenhouses/:greenhouseId" element={<AdminGreenhouseDetailPage />} />
                            <Route path="/admin/hardware-ids" element={<AdminHardwareIdPage />} />
                        </Route>
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default AppRoutes;