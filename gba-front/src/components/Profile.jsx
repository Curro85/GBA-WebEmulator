import { useState } from 'react';
import { useAuth } from '../context/auth.context';

function Profile() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative max-w-md w-full mx-4 bg-gray-900 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20 overflow-hidden">
                {/* Barra superior */}
                <div className="handle flex justify-between items-center bg-gray-800 px-4 py-3 border-b border-purple-500 cursor-move">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        {user ? `Hola, ${user}` : 'Perfil'}
                    </h2>
                    <button
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    {user ? (
                        <div className="space-y-6">
                            {/* Pestañas */}
                            <div className="flex border-b border-gray-700">
                                <button
                                    className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    Perfil
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium ${activeTab === 'library' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                                    onClick={() => setActiveTab('library')}
                                >
                                    Biblioteca
                                </button>
                            </div>

                            {/* Contenido de pestañas */}
                            <div className="min-h-[200px]">
                                {activeTab === 'profile' ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 rounded-full bg-purple-900 flex items-center justify-center text-2xl">
                                                {user.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{user}</h3>
                                                <p className="text-sm text-gray-400">Jugador</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={logout}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 mb-4">Tus juegos guardados aparecerán aquí</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="aspect-square bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">{i}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                    Inicia sesión
                                </h2>
                                <p className="text-gray-400">Para guardar tu progreso</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile