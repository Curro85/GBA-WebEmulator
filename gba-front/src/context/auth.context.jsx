import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');

        if (token && username) {
            setUser(username);
        }
    }, [])

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const dataError = await response.json();
                throw new Error(dataError.error || 'Error al iniciar sesión');
            }

            const data = await response.json();

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('username', data.username);

            setUser(data.username);

            return { success: true };

        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
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