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

    const handleRomLoad = async (e) => {
        if (!emulator || !e.target.files?.[0]) return;

        emulator.quitGame();
        emulator.toggleInput(true);

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

    const handleSpeed = (e) => {
        const inputSpeed = e.target.value;
        setSpeed(inputSpeed);
        emulator.setFastForwardMultiplier(inputSpeed);
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
            handleRomLoad,
            isRunning,
            status,
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