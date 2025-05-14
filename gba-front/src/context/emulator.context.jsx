import { createContext, useContext, useEffect, useState, useRef } from "react";
import mGBA from '../lib/mgba-wasm';

const EmulatorContext = createContext();

export const EmulatorProvider = ({ children }) => {
    const canvasRef = useRef(null);
    const [emulator, setEmulator] = useState(null);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(100);
    const [status, setStatus] = useState("Esperando ROM...");
    const [isRunning, setIsRunning] = useState(false);
    const allowedFiles = ['gba', 'gbc', 'gb'];

    useEffect(() => {
        const initEmulator = async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            try {
                const Module = await mGBA({ canvas });
                console.log(`mGBA ${Module.version.projectVersion}`);
                await Module.FSInit();
                Module.setFastForwardMultiplier(1);
                Module.setVolume(1);
                Module.setMainLoopTiming(0, 16);

                setEmulator(Module);
            } catch (error) {
                console.error("Error inicializando emulador:", error);
            }
        };

        initEmulator();

        // return () => {
        //     if (emulator) {
        //         emulator.quitGame();
        //         emulator.quitMgba();
        //     }
        // };
    }, []);

    const getRomData = async (rom) => {
        try {
            const romData = emulator.FS.readFile(`/data/games/${rom}`);

            return new Blob([romData], { type: 'application/octet-stream' });
        } catch (error) {
            console.log('Error leyendo ROM:', error);
            throw error;
        }
    }

    const getSaveData = async (save) => {
        try {
            const saveData = emulator.FS.readFile(`/data/saves/${save}`);
            return new Blob([saveData], { type: 'application/octet-stream' });
        } catch (error) {
            console.log('Error leyendo datos de guardado:', error);
            throw error;
        }
    }

    const handleRomLoad = async (file) => {
        if (!emulator || !file) return;

        const fileExt = file.name.split('.').pop().toLowerCase();
        console.log(fileExt);

        if (!allowedFiles.includes(fileExt)) {
            setStatus('Error: Formato no soportado');
            return;
        }

        emulator.quitGame();
        emulator.toggleInput(true);

        try {
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

    const handleSpeed = (number) => {
        const speedRange = Math.max(1, Math.min(5, number));
        setSpeed(speedRange);
        emulator.setFastForwardMultiplier(speedRange);
    }

    const handleVolume = (e) => {
        const inputVolume = e.target.value;
        setVolume(inputVolume);
        emulator.setVolume(inputVolume / 100);
    }

    return (
        <EmulatorContext.Provider value={{
            emulator,
            canvasRef,
            speed,
            handleSpeed,
            volume,
            handleVolume,
            getRomData,
            getSaveData,
            handleRomLoad,
            isRunning,
            status,
            setStatus,
            toggleEmulation,
            setIsRunning
        }}>
            {children}
        </EmulatorContext.Provider>
    )
};

export const useEmulator = () => {
    return useContext(EmulatorContext);
}