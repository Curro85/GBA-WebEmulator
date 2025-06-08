import { useEffect, useState } from "react";
import { useEmulator } from "../context/emulator.context";
import { useAuth } from "../context/auth.context";
import { CircleCheckBig, CloudUpload, RefreshCw, TriangleAlert } from "lucide-react";

function RomList({ onSuccess }) {
    const [roms, setRoms] = useState([]);
    const [selectedRoms, setSelectedRoms] = useState([]);
    const [includeSaves, setIncludeSaves] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { emulator, getRomData, getSaveData } = useEmulator();
    const { getCookie } = useAuth();

    useEffect(() => {
        getLocalRoms();
    }, []);

    const getLocalRoms = () => {
        const romsList = emulator.listRoms();
        const filteredRoms = romsList.filter(name => /\.(gba|gbc|gb)$/i.test(name));
        setRoms(filteredRoms);
    }

    const handleRomSelection = (rom, isChecked) => {
        if (isChecked) {
            setSelectedRoms([...selectedRoms, rom]);
        } else {
            setSelectedRoms(selectedRoms.filter(r => r !== rom));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            for (const rom of selectedRoms) {
                const romBlob = await getRomData(rom);
                formData.append('roms', romBlob, rom);

                if (includeSaves) {
                    try {
                        const save = rom.replace(/\.[^.]+$/, '.sav');
                        const saveBlob = await getSaveData(save);
                        formData.append('saves', saveBlob, save);
                    } catch (error) {
                        console.log('No se encontró save para:', rom, error.message);
                    }
                }
            }

            formData.append('include_saves', includeSaves);

            const response = await fetch('/api/uploadroms', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': getCookie('csrf_access_token'),
                },
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Inicia sesión para subir las ROMs');
            }

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                setSuccess(false);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            setError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Subir ROMs
                    </span>
                </h2>
                <button
                    type="button"
                    onClick={getLocalRoms}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
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

            {success ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <CircleCheckBig className="h-16 w-16 text-green-500 mb-4" />
                    <p className="text-xl text-white font-medium">ROMs subidas correctamente!</p>
                </div>
            ) : (
                <>
                    <div className="mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {roms.length > 0 ? (
                            <ul className="space-y-2">
                                {roms.map((rom) => (
                                    <li key={rom} className="flex items-center">
                                        <label className="flex items-center w-full p-3 rounded-lg bg-gray-800 hover:bg-gray-700/80 transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={rom}
                                                onChange={(e) => handleRomSelection(rom, e.target.checked)}
                                                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-600 bg-gray-700 mr-3"
                                            />
                                            <span className="text-gray-200 font-mono truncate">{rom}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No hay ROMs almacenados localmente
                            </div>
                        )}
                    </div>

                    <div className="mb-4 flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeSaves}
                                onChange={(e) => setIncludeSaves(e.target.checked)}
                                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-600 bg-gray-700 mr-2"
                            />
                            <span className="text-gray-300 text-sm">
                                Incluir datos de guardado (.sav)
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={selectedRoms.length === 0 || isLoading}
                        className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${selectedRoms.length === 0 || isLoading
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-purple-500/30'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <CloudUpload className="h-5 w-5 mr-2" />
                                Subir {selectedRoms.length > 0 ? `(${selectedRoms.length})` : ''}
                            </>
                        )}
                    </button>
                </>
            )}
        </form>
    );
}

export default RomList;