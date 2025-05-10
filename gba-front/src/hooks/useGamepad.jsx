import { useEffect, useRef } from 'react';
import { useEmulator } from '../context/emulator.context';

const buttonMap = {
    0: 'a', 1: 'b', 2: 'x', 3: 'y',
    4: 'l', 5: 'r', 6: 'lt', 7: 'rt',
    8: 'select', 9: 'start',
    10: 'ls', 11: 'rs',
    12: 'up', 13: 'down', 14: 'left', 15: 'right',
};

export function useGamepad({ onPress, onRelease }) {
    const { emulator } = useEmulator();
    const prevRef = useRef([]);
    const animationFrameRef = useRef(0);
    const onPressRef = useRef(onPress);
    const onReleaseRef = useRef(onRelease);

    useEffect(() => { onPressRef.current = onPress }, [onPress]);
    useEffect(() => { onReleaseRef.current = onRelease }, [onRelease])

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

                    if (now && !last) onPress(name);
                    if (!now && last) onRelease(name);

                    prevRef.current[index] = now;
                });
            }
            animationFrameRef.current = requestAnimationFrame(loop);
        };

        const handleConnect = e => {
            prevRef.current = Array(e.gamepad.buttons.length).fill(false);
            loop();
        };
        const handleDisconnect = () => cancelAnimationFrame(animationFrameRef.current);

        window.addEventListener('gamepadconnected', handleConnect);
        window.addEventListener('gamepaddisconnected', handleDisconnect);

        return () => {
            window.removeEventListener('gamepadconnected', handleConnect);
            window.removeEventListener('gamepaddisconnected', handleDisconnect);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [emulator]);
}

