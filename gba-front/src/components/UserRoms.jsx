import { useEffect, useState } from "react";
import { useEmulator } from "../context/emulator.context";
import { ArrowPathIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function UserRoms({ onSuccess }) {
    const [roms, setRoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { emulator } = useEmulator();

    useEffect(() => {
        loadRoms();
    }, []);

    const loadRoms = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/loadroms', {
                credentials: 'include'
            });

            if (!response.ok) {
                setError('Inicie sesión para ver sus ROMs');
            }

            const data = await response.json();
            setRoms(data);
        } catch (error) {
            console.error('Error loading roms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (rom) => {
        try {
            const response = await fetch(`http://localhost:5000/api/loadrom/${rom.hash}`, {
                credentials: 'include',
            });
            console.log(response);

            if (!response.ok) {
                throw new Error('Error cargando ROM');
            }

            const romBlob = await response.blob();
            const romFile = new File([romBlob], rom.name, {
                type: 'application/octet-stream',
            });

            await emulator.uploadRom(romFile, () => {
                emulator.FSSync();
                emulator.quitGame();
                emulator.toggleInput(true);
                emulator.loadGame(`/data/games/${romFile.name}`);

            });

            onSuccess();

        } catch (error) {
            console.log(error.message);
        }

    };

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl border-2 border-purple-500 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Tus Juegos
                    </span>
                </h2>
                <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-purple-500 transition-colors"
                    onClick={loadRoms}
                    title="Recargar lista"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-3 flex items-center bg-red-900/50 border border-red-500 rounded-md text-red-200">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <ArrowPathIcon className="h-12 w-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-gray-400 animate-pulse">Cargando tus ROMs<span className="animate-bounce">...</span></p>
                </div>
            ) : (
                <div className="mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {roms.length > 0 ? (
                        <ul className="space-y-2">
                            {roms.map((rom) => (
                                <li
                                    key={rom.hash}
                                    className="group relative flex items-center transition-all"
                                >
                                    <div
                                        className="w-full p-3 rounded-lg bg-gray-800 hover:bg-purple-900/30 cursor-pointer transition-all duration-300"
                                        onClick={() => handleSelect(rom)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200 font-mono truncate text-sm">
                                                {rom.name.replace(/\.[^/.]+$/, "")}
                                            </span>
                                            <span className="hidden group-hover:block text-purple-400 ml-2">
                                                <CloudArrowUpIcon className="h-4 w-4" />
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-400">
                                                {new Date(rom.upload_date).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {(rom.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No tienes ROMs guardadas aún</p>
                            <p className="mt-2 text-sm">¡Sube tus juegos desde el botón superior!</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-400">
                Haz clic en una ROM para cargarla en el emulador
            </div>
        </div>
    );
}

export default UserRoms