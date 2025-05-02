import { useEffect, useState } from "react";
import { useEmulator } from "../context/emulator.context";
import { ArrowPathIcon, CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/auth.context";

function RomList({ onSuccess }) {
    const [roms, setRoms] = useState([]);
    const [selectedRoms, setSelectedRoms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { emulator } = useEmulator();
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
            const response = await fetch('http://localhost:5000/api/uploadroms', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCookie('csrf_access_token'),
                },
                body: JSON.stringify({ selectedRoms }),
            })

            if (!response.ok) {
                const dataError = await response.json();
                throw new Error(dataError.error || 'Error al subir las ROMs');
            }
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                setSuccess(false);
                setIsLoading(false);
            }, 1000);

        } catch (error) {
            console.log(error)
            setError('Error al subir las ROMs. Intente de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Upload ROMs
                    </span>
                </h2>
                <button
                    type="button"
                    onClick={getLocalRoms}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Refresh list"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md text-red-200">
                    {error}
                </div>
            )}

            {success ? (
                <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                    <p className="text-xl text-white font-medium">ROMs uploaded successfully!</p>
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
                                No ROMs found in local storage
                            </div>
                        )}
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
                                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                                Upload {selectedRoms.length > 0 ? `(${selectedRoms.length})` : ''}
                            </>
                        )}
                    </button>
                </>
            )}
        </form>
    );
}

export default RomList;