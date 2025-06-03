import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth.context';
import {
    X,
    User,
    Library,
    BarChart3,
    Calendar,
    HardDrive,
    Save,
    Gamepad2,
    RefreshCw,
    LogOut,
    UserPlus,
    Upload,
    Clock,
    Database
} from 'lucide-react';

function Profile({ onSuccess }) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState(null);
    const [roms, setRoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchProfileData();
            fetchRoms();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            const response = await fetch('/api/profile', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            } else {
                setError('No se pudo cargar el perfil');
            }
        } catch (err) {
            setError('Error de conexión');
            console.log(err)
        } finally {
            setLoading(false);
        }
    };

    const fetchRoms = async () => {
        try {
            const response = await fetch('/api/loadroms', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setRoms(data);
            }
        } catch (err) {
            console.error('Error loading ROMs:', err);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative max-w-2xl w-full mx-4 bg-gray-900 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20 overflow-hidden">

                <div className="handle flex justify-between items-center bg-gray-800 px-4 py-3 border-b border-purple-500">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
                        <User size={24} className="text-purple-400" />
                        {user ? `Hola, ${user}` : 'Perfil'}
                    </h2>
                    <button
                        onClick={onSuccess}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {user ? (
                        <div className="space-y-6">
                            <div className="flex border-b border-gray-700">
                                <button
                                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User size={16} />
                                    Perfil
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'library' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('library')}
                                >
                                    <Library size={16} />
                                    Biblioteca
                                </button>
                                <button
                                    className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'stats' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
                                    onClick={() => setActiveTab('stats')}
                                >
                                    <BarChart3 size={16} />
                                    Estadísticas
                                </button>
                            </div>

                            <div className="min-h-[300px]">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <RefreshCw className="animate-spin h-8 w-8 text-purple-400" />
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <p className="text-red-400 mb-4">{error}</p>
                                        <button
                                            onClick={fetchProfileData}
                                            className="text-purple-400 hover:text-purple-300 underline flex items-center gap-1 mx-auto"
                                        >
                                            <RefreshCw size={16} />
                                            Reintentar
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'profile' && (
                                            <div className="space-y-6">
                                                {profileData?.profile ? (
                                                    <>
                                                        <div className="flex items-start space-x-4">
                                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-2xl font-bold text-white">
                                                                {profileData.profile.name ? profileData.profile.name.charAt(0).toUpperCase() : user.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-white">{profileData.profile.name}</h3>
                                                                <p className="text-gray-400 text-sm mb-2">@{user}</p>
                                                                <p className="text-gray-300 text-sm leading-relaxed">{profileData.profile.bio}</p>
                                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                                    <Calendar size={12} />
                                                                    Miembro desde {formatDate(profileData.user.register_date)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                                                <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
                                                                    <Gamepad2 size={20} />
                                                                    {profileData.stats?.total_roms || 0}
                                                                </div>
                                                                <div className="text-xs text-gray-400">ROMs</div>
                                                            </div>
                                                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                                                <div className="text-2xl font-bold text-pink-400 flex items-center justify-center gap-1">
                                                                    <Save size={20} />
                                                                    {profileData.stats?.total_saves || 0}
                                                                </div>
                                                                <div className="text-xs text-gray-400">Partidas</div>
                                                            </div>
                                                            <div className="bg-gray-800 rounded-lg p-3 text-center">
                                                                <div className="text-lg font-bold text-blue-400 flex items-center justify-center gap-1">
                                                                    <HardDrive size={16} />
                                                                    <span className="text-sm">{formatFileSize(profileData.stats?.total_storage_used || 0)}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-400">Almacenado</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 rounded-full bg-purple-900 flex items-center justify-center mx-auto mb-4">
                                                            <User size={32} className="text-purple-400" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white mb-2">{user}</h3>
                                                        <p className="text-gray-400 mb-4">No tienes un perfil configurado</p>
                                                        <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors flex items-center gap-2 mx-auto">
                                                            <UserPlus size={16} />
                                                            Crear Perfil
                                                        </button>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={logout}
                                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <LogOut size={16} />
                                                    Cerrar sesión
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'library' && (
                                            <div className="space-y-4">
                                                {roms.length > 0 ? (
                                                    <>
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                                <Library size={20} />
                                                                Mis ROMs ({roms.length})
                                                            </h3>
                                                        </div>
                                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                                            {roms.map((rom, index) => (
                                                                <div key={index} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center hover:bg-gray-750 transition-colors">
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-white truncate">{rom.name}</h4>
                                                                        <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                                                                            <span className="flex items-center gap-1">
                                                                                <HardDrive size={10} />
                                                                                {formatFileSize(rom.size)}
                                                                            </span>
                                                                            <span>•</span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Upload size={10} />
                                                                                {formatDate(rom.upload_date)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Gamepad2 size={64} className="mx-auto mb-4 text-gray-600" />
                                                        <p className="text-gray-400 mb-4">No tienes ROMs subidas</p>
                                                        <p className="text-sm text-gray-500">Sube tus primeros juegos para empezar</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'stats' && profileData && (
                                            <div className="space-y-6">
                                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    <BarChart3 size={20} />
                                                    Estadísticas de Juego
                                                </h3>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-4">
                                                        <div className="text-3xl font-bold text-white flex items-center gap-2">
                                                            <Gamepad2 size={32} />
                                                            {profileData.stats?.total_roms || 0}
                                                        </div>
                                                        <div className="text-purple-200 text-sm">Total de ROMs</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-pink-800 to-pink-900 rounded-lg p-4">
                                                        <div className="text-3xl font-bold text-white flex items-center gap-2">
                                                            <Save size={32} />
                                                            {profileData.stats?.total_saves || 0}
                                                        </div>
                                                        <div className="text-pink-200 text-sm">Partidas Guardadas</div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-800 rounded-lg p-4">
                                                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                                                        <Database size={18} />
                                                        Almacenamiento
                                                    </h4>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 flex items-center gap-1">
                                                            <HardDrive size={14} />
                                                            Espacio usado
                                                        </span>
                                                        <span className="text-white font-mono">{formatFileSize(profileData.stats?.total_storage_used || 0)}</span>
                                                    </div>
                                                </div>

                                                {profileData.stats?.recent_roms && profileData.stats.recent_roms.length > 0 && (
                                                    <div className="bg-gray-800 rounded-lg p-4">
                                                        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                                            <Clock size={18} />
                                                            ROMs Recientes
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {profileData.stats.recent_roms.map((rom, index) => (
                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-300 truncate flex items-center gap-2">
                                                                        <Gamepad2 size={14} />
                                                                        {rom.name}
                                                                    </span>
                                                                    <span className="text-gray-500 flex items-center gap-1">
                                                                        <Calendar size={12} />
                                                                        {formatDate(rom.upload_date)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-6">
                                <User size={48} className="mx-auto mb-4 text-purple-400" />
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

export default Profile;