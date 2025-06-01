import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useEmulator } from "./emulator.context";

const buttonMap = {
    0: 'a', 1: 'b', 2: 'x', 3: 'y',
    4: 'l', 5: 'r', 6: 'lt', 7: 'rt',
    8: 'select', 9: 'start',
    10: 'ls', 11: 'rs',
    12: 'up', 13: 'down', 14: 'left', 15: 'right',
};

const GamepadContext = createContext();

export const GamepadProvider = ({ children }) => {
    const { emulator, handleSpeed, speedRef } = useEmulator();
    const [isGamepadConnected, setIsGamepadConnected] = useState(false);
    const prevRef = useRef([]);
    const animationFrameRef = useRef(0);

    const handlePress = (name) => {
        if (name === 'rt') {
            handleSpeed(speedRef.current + 1);
        } else if (name === 'lt') {
            handleSpeed(speedRef.current - 1);
        } else if (name === 'ls') {
            emulator.quickReload();
        } else if (name === 'rs') {
            emulator.pauseGame();
        } else {
            emulator.buttonPress(name);
        }
    };

    const handleRelease = (name) => {
        emulator.buttonUnpress(name);
    };

    useEffect(() => {
        if (!emulator) return;

        const loop = () => {
            const gamepad = navigator.getGamepads()[0];
            if (gamepad) {
                gamepad.buttons.forEach((btn, index) => {
                    const name = buttonMap[index];
                    if (!name) return;

                    const last = prevRef.current[index];
                    const now = btn.pressed;

                    if (now && !last) handlePress(name);
                    if (!now && last) handleRelease(name);

                    prevRef.current[index] = now;
                });
            }
            animationFrameRef.current = requestAnimationFrame(loop);
        };

        const onConnect = e => {
            prevRef.current = Array(e.gamepad.buttons.length).fill(false);
            setIsGamepadConnected(true);
            loop();
        };
        const onDisconnect = () => {
            cancelAnimationFrame(animationFrameRef.current);
            setIsGamepadConnected(false);
        }

        window.addEventListener('gamepadconnected', onConnect);
        window.addEventListener('gamepaddisconnected', onDisconnect);

        return () => {
            window.removeEventListener('gamepadconnected', onConnect);
            window.removeEventListener('gamepaddisconnected', onDisconnect);
            cancelAnimationFrame(animationFrameRef.current);
        };

    }, [emulator]);

    return (
        <GamepadContext.Provider value={{ isGamepadConnected }}>
            {children}
        </GamepadContext.Provider>
    )

};

export const useGamepad = () => {
    return useContext(GamepadContext);
}