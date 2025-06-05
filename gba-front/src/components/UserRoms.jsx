import { useEffect, useState } from "react";
import { useEmulator } from "../context/emulator.context";
import { CloudDownload, Play, RefreshCw, Save, Trash2, TriangleAlert } from 'lucide-react';

function UserRoms({ onSuccess }) {
    const [roms, setRoms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedRom, setExpandedRom] = useState(null);
    const [saves, setSaves] = useState({});
    const [loadingSaves, setLoadingSaves] = useState({});
    const { emulator, setIsRunning, setStatus } = useEmulator();

    useEffect(() => {
        loadRoms();
    }, []);

    const loadRoms = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/loadroms', {
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

    const loadSaves = async (romHash) => {
        setLoadingSaves((prev) => ({ ...prev, [romHash]: true }));
        try {
            const response = await fetch(
                `/api/loadsaves/${romHash}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) throw new Error("Error cargando partidas");

            const data = await response.json();
            setSaves((prev) => ({ ...prev, [romHash]: data }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSaves((prev) => ({ ...prev, [romHash]: false }));
        }
    };

    const handleSelect = async (rom, save) => {
        try {
            const response = await fetch(`/api/loadrom/${rom.hash}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error cargando ROM');
            }

            const romBlob = await response.blob();
            const romFile = new File([romBlob], rom.name, {
                type: 'application/octet-stream',
            });

            if (save) {
                const saveResponse = await fetch(`/api/loadsave/${save.id}`, {
                    credentials: 'include',
                });

                if (!saveResponse.ok) {
                    throw new Error('Error cargando partida');
                }

                const saveBlob = await saveResponse.blob();
                const saveFile = new File([saveBlob], save.name, {
                    type: 'application/octet-stream',
                })

                const savePath = `/data/saves/${saveFile.name}`;
                safeUnlink(savePath);

                await emulator.uploadSaveOrSaveState(saveFile, () => {
                    emulator.FSSync();
                })
            } else {
                const romName = romFile.name.split('.')[0]
                const romSavePath = `data/saves/${romName}.sav`;
                safeUnlink(romSavePath);
            }

            await emulator.uploadRom(romFile, () => {
                emulator.FSSync();
                emulator.quitGame();
                emulator.toggleInput(true);
                emulator.loadGame(`/data/games/${romFile.name}`);
                setIsRunning(true);
                setStatus('Jugando...');
            });

            onSuccess();

        } catch (error) {
            console.log(error.message);
        }

    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    const handleDeleteRom = async (romHash, romName) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar "${romName}"? Esta acción no se puede deshacer.`);
        if (!confirmDelete) return;

        try {
            const csrfToken = getCookie('csrf_access_token');

            const response = await fetch(`/api/deleterom/${romHash}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const { error } = await response.json();
                alert(`Error al eliminar la ROM: ${error}`);
                return;
            }

            setRoms(prev => prev.filter(rom => rom.hash !== romHash));
            setExpandedRom(null);
        } catch (error) {
            console.error('Error eliminando la ROM:', error);
            alert('Hubo un error inesperado al eliminar la ROM');
        }
    };


    const safeUnlink = (path) => {
        const exists = emulator.FS.analyzePath(path).exists;
        if (exists) {
            emulator.FS.unlink(path);
        }
    };

    const toggleRom = async (rom) => {
        if (expandedRom === rom.hash) {
            setExpandedRom(null);
        } else {
            setExpandedRom(rom.hash);
            if (!saves[rom.hash]) await loadSaves(rom.hash);
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
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    onClick={loadRoms}
                    title="Recargar lista"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-3 flex items-center bg-red-900/50 border border-red-500 rounded-md text-red-200">
                    <TriangleAlert className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <RefreshCw className="h-12 w-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-gray-400 animate-pulse">
                        Cargando tus ROMs<span className="animate-bounce">...</span>
                    </p>
                </div>
            ) : (
                <div className="mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {roms.length > 0 ? (
                        <ul className="space-y-2">
                            {roms.map((rom) => (
                                <li key={rom.hash}>
                                    <div
                                        className={`p-3 rounded-lg bg-gray-800 hover:bg-purple-900/30 cursor-pointer transition-all ${expandedRom === rom.hash ? "bg-purple-900/20" : ""
                                            }`}
                                        onClick={() => toggleRom(rom)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200 font-mono truncate text-sm">
                                                {rom.name.replace(/\.[^/.]+$/, "")}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <CloudDownload className="h-4 w-4 text-purple-400" />
                                                <button
                                                    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRom(rom.hash, rom.name);
                                                    }}
                                                    title="Eliminar ROM"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-xs text-gray-400">
                                                {new Date(rom.upload_date).toLocaleDateString()}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {(rom.size / 1024 / 1024).toFixed(1)} MB
                                            </span>
                                        </div>

                                        {expandedRom === rom.hash && (
                                            <div className="mt-3 ml-4 border-l-2 border-purple-500 pl-3">
                                                <h4 className="text-sm text-purple-400 mb-2 flex items-center">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Partidas guardadas
                                                </h4>
                                                {loadingSaves[rom.hash] ? (
                                                    <div className="text-gray-400 text-sm">
                                                        Cargando partidas...
                                                    </div>
                                                ) : (
                                                    <ul className="space-y-2">
                                                        <li
                                                            className="p-2 bg-gray-700 rounded hover:bg-purple-800/30 flex justify-between items-center transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelect(rom);
                                                            }}>
                                                            <span className="text-xs text-gray-200">Empezar partida nueva</span>
                                                            <Play className="h-4.5 w-4.5 text-gray-200" />
                                                        </li>
                                                        {saves[rom.hash]?.map((save) => (
                                                            <li
                                                                key={save.id}
                                                                className="p-2 bg-gray-700 rounded hover:bg-purple-800/30 flex justify-between items-center transition-colors"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSelect(rom, save);
                                                                }}>
                                                                <span className="text-xs text-gray-200">
                                                                    {new Date(
                                                                        save.upload_date
                                                                    ).toLocaleString()}
                                                                    <span> Elegir esta partida</span>
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    {(save.size / 1024).toFixed(1)} KB
                                                                </span>
                                                            </li>
                                                        ))}
                                                        {saves[rom.hash]?.length === 0 && (
                                                            <li className="text-xs text-gray-400 p-2">No hay partidas guardadas</li>
                                                        )}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No tienes ROMs guardadas aún</p>
                            <p className="mt-2 text-sm">
                                ¡Sube tus juegos desde el botón superior!
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 text-center text-sm text-gray-400">
                Haz clic en una ROM para ver sus partidas guardadas
            </div>
        </div>
    );
}

export default UserRoms