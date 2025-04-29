import { useState, useEffect } from 'react'
import { useEmulator } from '../context/emulator.context'

const Emulator = () => {
    const { emulator, canvasRef, speed, handleSpeed } = useEmulator();
    const [status, setStatus] = useState("Esperando ROM...");
    const [isRunning, setIsRunning] = useState(false);
    // const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(100);

    useEffect(() => {
        if (emulator?.romLoaded && !isRunning) {
            emulator.start();
            setIsRunning(true);
        }
    }, [emulator, isRunning]);

    const handleRomLoad = async (e) => {
        if (!emulator || !e.target.files?.[0]) return;

        if (status.includes('Pausado') || status.includes('Jugando...')) {
            emulator.quitGame();
        };

        try {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                console.log(data);
                console.log(file);

                // 1. Escribir el ROM en el sistema de archivos virtual
                emulator.FS.writeFile(`/data/games/${file.name}`, data);
                emulator.FSSync();

                // 2. Cargar el ROM desde la ruta especificada
                const loadResult = emulator.loadGame(`/data/games/${file.name}`);
                setIsRunning(true);

                if (loadResult) {
                    setStatus("Jugando...");
                    setIsRunning(true);
                    console.log("ROM cargado correctamente", {
                        romLoaded: true,
                        fileList: emulator.listRoms(),
                        saveList: emulator.listSaves(),
                        save: emulator.getSave(),
                    });
                } else {
                    setStatus("Error: ROM no compatible");
                    console.error("Error al cargar ROM");
                }
            };

            reader.readAsArrayBuffer(file);

        } catch (error) {
            console.error("Error completo:", error);
            setStatus("Error cargando ROM");
        }
    };

    const toggleEmulation = () => {
        if (!emulator) return;

        if (isRunning) {
            emulator.pauseGame();
            emulator.toggleInput(false);
            setIsRunning(false);
            setStatus("Pausado");
        } else {
            emulator.resumeGame();
            emulator.toggleInput(true);
            setIsRunning(true);
            setStatus("Jugando...");
        }
    };

    // const handleSpeed = (e) => {
    //     const inputSpeed = e.target.value;
    //     setSpeed(inputSpeed);
    //     emulator.setFastForwardMultiplier(inputSpeed);
    // }

    const handleVolume = (e) => {
        const inputVolume = e.target.value;
        setVolume(inputVolume);
        emulator.setVolume(inputVolume / 100);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 space-y-4">
            <div className="controls flex flex-wrap gap-4 bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-3xl">
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors duration-200 flex items-center">
                    📁 Cargar ROM
                    <input
                        type="file"
                        className="hidden"
                        accept=".gba, .gbc, .gb"
                        onChange={handleRomLoad}
                        disabled={isRunning}
                    />
                </label>

                <button
                    onClick={toggleEmulation}
                    className={`px-6 py-2 rounded-md font-bold transition-all duration-200 
                        ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                    {isRunning ? "⏸" : "▶"}
                </button>

                <div className="flex items-center space-x-2 bg-purple-500 px-4 py-2 rounded-md">
                    <span className="text-sm">⚡ Velocidad</span>
                    <input
                        type="range"
                        onChange={handleSpeed}
                        id="speed"
                        min="1"
                        max="5"
                        step="1"
                        value={speed}
                        className="w-24 accent-blue-500 cursor-pointer"
                    />
                </div>

                <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-md">
                    <span className="text-sm">🔊 Volumen</span>
                    <input
                        type="range"
                        onChange={handleVolume}
                        id="volume"
                        step="10"
                        value={volume}
                        className="w-24 accent-blue-500 cursor-pointer"
                    />
                </div>
            </div>

            <div className="status-indicator bg-gray-800 px-4 py-2 rounded-md text-sm text-gray-300">
                {status}
            </div>

            <div className="relative w-full max-w-4xl aspect-[3/2] overflow-hidden rounded-lg border-2 border-gray-700 shadow-2xl bg-black">
                <canvas
                    ref={canvasRef}
                    width={240}
                    height={160}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                />
            </div>
        </div>
    );
};

export default Emulator;