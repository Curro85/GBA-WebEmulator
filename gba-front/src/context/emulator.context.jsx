import { createContext, useContext, useEffect, useState, useRef } from "react";
import mGBA from '../lib/mgba-wasm';

const EmulatorContext = createContext();

export const EmulatorProvider = ({ children }) => {
    const canvasRef = useRef(null);
    const [emulator, setEmulator] = useState(null);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(100);

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
        }}>
            {children}
        </EmulatorContext.Provider>
    )
};

export const useEmulator = () => {
    return useContext(EmulatorContext);
}