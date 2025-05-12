import { useAuth } from "../context/auth.context";
import { useState } from "react";
import { CircleUserRound, Lock, TriangleAlert } from "lucide-react";

function LoginForm({ onSuccess, toRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);
        if (!result.success) {
            setError(result.error);
            setIsLoading(false);
            return;
        }

        onSuccess();

    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-8 bg-gray-900 rounded-xl border border-cyan-500 shadow-lg shadow-cyan-500/20">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                        Iniciar Sesión
                    </span>
                </h2>
                <p className="text-gray-400">Accede a tu cuenta para continuar</p>
            </div>

            {error && (
                <div className="mb-6 p-3 flex items-center bg-red-900/50 border border-red-500 rounded-md text-red-200">
                    <TriangleAlert className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CircleUserRound className="h-5 w-5 text-cyan-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Usuario"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-cyan-500" />
                    </div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center py-3 px-6 rounded-lg font-medium transition-all ${isLoading
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/30'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verificando...
                        </>
                    ) : (
                        <>
                            Iniciar sesión
                        </>
                    )}
                </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
                ¿No tienes cuenta? <button
                    type="button"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    onClick={toRegister}
                >Regístrate
                </button>
            </div>
        </form>
    )
}

export default LoginForm;