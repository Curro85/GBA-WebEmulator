import { useAuth } from "../context/auth.context";
import { useState } from "react";

function LoginForm({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(username, password);

        if (result.success) {
            onSuccess();
        } else {
            setError('Credenciales incorrectas');
        }

    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">Iniciar sesión</h2>
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="text"
                placeholder="Usuario"
                className="w-full border p-2 rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Contraseña"
                className="w-full border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Entrar
            </button>
        </form>
    )
}

export default LoginForm