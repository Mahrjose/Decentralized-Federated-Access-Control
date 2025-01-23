import axios from "axios";
import React, { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/users/checkuser');
            return response.data.user.role;
        } catch (error) {
            return "unauthorized";
        }
    };

    return (
        <AuthContext.Provider value={{ checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
