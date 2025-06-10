import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
    const [loading, setLoading] = useState(true);

    const login = useCallback(async (username, password) => {
        try {
            const user = await authService.login(username, password);
            setCurrentUser(user);
            return user;
        } catch (error) {
            throw error;
        }
    }, []);

    const register = useCallback(async (username, email, password, role) => {
        try {
            const user = await authService.register(username, email, password, role);
            setCurrentUser(user); 
            return user;
        } catch (error) {
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setCurrentUser(null);
    }, []);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const value = {
        currentUser,
        login,
        register,
        logout,
        isAuthenticated: !!currentUser,
        loading 
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};