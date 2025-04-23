import { useState, useEffect } from 'react'
import { useEmulator } from '../services/useEmulator'

const Emulator = () => {
    const { emulator, canvasRef } = useEmulator();
    const [status, setStatus] = useState("Esperando ROM...");
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (emulator?.romLoaded && !isRunning) {
            emulator.start();
            setIsRunning(true);
        }
    }, [emulator?.romLoaded]);

    const handleRomLoad = async (e) => {
        if (!emulator || !e.target.files?.[0]) return;

        try {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                console.log(data);
                console.log(file);

                // 1. Escribir el ROM en el sistema de archivos virtual
                emulator.FS.writeFile(`/data/games/${file.name}`, data);
                emulator.setFastForwardMultiplier(1);
                emulator.setMainLoopTiming(0, 16);
                emulator.FSSync();

                // 2. Cargar el ROM desde la ruta especificada
                const loadResult = emulator.loadGame(`/data/games/${file.name}`);
                setIsRunning(true);

                if (loadResult) {
                    setStatus("ROM cargado - Presiona Iniciar");
                    console.log("ROM cargado correctamente", {
                        romLoaded: true,
                        fileList: emulator.listRoms(),
                        saveList: emulator.listSaves(),
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
            emulator.pauseGame(); // Usar pauseGame en lugar de stop
            setIsRunning(false);
            setStatus("Pausado");
        } else {
            emulator.resumeGame(); // Usar resumeGame en lugar de start
            setIsRunning(true);
            setStatus("Jugando...");
        }
    };

    const speedEmulation = () => {
        emulator.setFastForwardMultiplier(1);
    }

    const handleVolume = () => {
        let volume = document.getElementById("volume").value / 100;
        emulator.setVolume(volume);
    }

    return (
        <div className="emulator-container">
            <div className="controls">
                <label className="rom-upload-btn">
                    📁 Cargar ROM
                    <input
                        type="file"
                        accept=".gba, .gbc, .gb"
                        onChange={handleRomLoad}
                        disabled={isRunning}
                    />
                </label>

                <button
                    onClick={toggleEmulation}
                    className={`start-btn ${isRunning ? 'stop' : 'start'}`}
                >
                    {isRunning ? "⏸ Pausar" : "▶ Iniciar"}
                </button>
                <button
                    onClick={speedEmulation}
                >x2
                </button>
                <label className="rom-upload-btn"> Volumen:
                    <input type="range" onChange={handleVolume} id="volume" step="10" />
                </label>
            </div>

            <div className="status-indicator">
                <span>{status}</span>
            </div>

            <canvas
                ref={canvasRef}
                width={240}
                height={160}
                className="game-screen"
            />
        </div>
    );
};

export default Emulator;