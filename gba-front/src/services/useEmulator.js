import { useEffect, useState, useRef } from 'react';
import mGBA from '../lib/mgba-wasm';

export const useEmulator = () => {
    const canvasRef = useRef(null);
    const [emulator, setEmulator] = useState(null);

    useEffect(() => {
        const initEmulator = async () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            try {
                const Module = await mGBA({ canvas });
                console.log(`mGBA ${Module.version.projectVersion}`);
                await Module.FSInit();

                // Configuración inicial
                // Module.setCoreSettings({
                //     volume: 100,
                //     fastForwardMultiplier: 1,
                // });

                Module.addCoreCallbacks({
                    romLoaded: (loaded) => {
                        Module.romLoaded = loaded;
                    }
                });

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

    return { emulator, canvasRef };
};