import { createContext, useContext, useEffect, useState, useRef } from "react"
import mGBA from '../lib/mgba-wasm'

const EmulatorContext = createContext();

export const EmulatorProvider = ({ children }) => {
    const canvasRef = useRef(null);
    const [emulator, setEmulator] = useState(null);
    const [speed, setSpeed] = useState(1);

    const handleSpeed = (e) => {
        const inputSpeed = e.target.value;
        setSpeed(inputSpeed);
        emulator.setFastForwardMultiplier(inputSpeed);
    }

    useEffect(() => {
        const initEmulator = async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            try {
                const Module = await mGBA({ canvas });
                console.log(`mGBA ${Module.version.projectVersion}`);
                await Module.FSInit();
                Module.setFastForwardMultiplier(1);
                Module.setMainLoopTiming(0, 16);

                // Module.addCoreCallbacks({
                //     romLoaded: (loaded) => {
                //         Module.romLoaded = loaded;
                //     }
                // });

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

    return (
        <EmulatorContext.Provider value={{ emulator, canvasRef, speed, handleSpeed }}>
            {children}
        </EmulatorContext.Provider>
    )
};

export const useEmulator = () => {
    return useContext(EmulatorContext);
}