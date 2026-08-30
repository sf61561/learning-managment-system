"use client";

import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [jwtToken, setJwtToken] = useState(null);
    const logout = () => {
        setUser(null);
        setJwtToken(null);
    };
    return (
        <AuthContext.Provider value={{ user, setUser,logout,jwtToken, setJwtToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    return context;
}