"use client";

import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const logout = () => {
        localStorage.removeItem("jwt");
        setJwtToken(null);
        setUser(null);
    };
    const isAuthenticated = () => {
        return !!jwtToken;
    }
    return (
        <AuthContext.Provider value={{ user, setUser,logout, jwtToken, setJwtToken, loading, setLoading, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
}