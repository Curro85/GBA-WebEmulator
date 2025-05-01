import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        profile();
    }, []);

    const profile = async () => {
        const response = await fetch('http://localhost:5000/api/profile', {
            credentials: 'include',
        });

        if (!response.ok) {
            setUser(null);
        }

        const data = await response.json();
        setUser(data.username);
    }

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const dataError = await response.json();
                throw new Error(dataError.error || 'Error al iniciar sesión');
            }

            profile();

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await fetch('http://localhost:5000/api/logout', {
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
    }

    const isAuthenticated = () => {
        return user !== null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,
            isAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);