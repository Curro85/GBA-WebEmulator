import { useEffect, useState } from "react";
// import { useEmulator } from "../context/emulator.context";
import { ArrowPathIcon, CloudArrowUpIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function UserRoms({ onSuccess }) {
    const [roms, setRoms] = useState([]);
    const [loading, setLoading] = useState(true);
    // const { emulator } = useEmulator();

    useEffect(() => {
        const loadRoms = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/loadroms', {
                    credentials: 'include'
                });

                const data = await response.json();
                setRoms(data);
            } catch (error) {
                console.error('Error loading roms:', error);
            } finally {
                setLoading(false);
            }
        };
        loadRoms();
    }, []);

    return (
        <div className="bg-gray-900 p-6 rounded-lg border border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-4">Tus Juegos</h2>

            {loading ? (
                <div className="text-center py-4">
                    <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-purple-500" />
                </div>
            ) : (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {roms.map(rom => (
                        <li key={rom.hash}
                            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer">
                            <span className="text-gray-200 font-mono truncate">{rom.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UserRoms