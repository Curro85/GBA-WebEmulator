import { useEffect } from 'react';

const GamepadDebug = () => {
    useEffect(() => {
        const buttonNames = [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT',
            'Select', 'Start', 'LS', 'RS', 'Up', 'Down', 'Left', 'Right'
        ];

        const checkGamepad = () => {
            const gamepads = navigator.getGamepads();
            const gamepad = gamepads[0]; // Solo el primer gamepad

            if (gamepad) {
                gamepad.buttons.forEach((button, index) => {
                    if (button.pressed) {
                        console.log(`Botón presionado: ${buttonNames[index] || index}`);
                    }
                });

                // Ejes analógicos (LS: [0,1], RS: [2,3], DPAD: [6,7] en algunos modelos)
                // const axes = gamepad.axes.map(a => Math.round(a * 100) / 100);
                // if (axes.some(a => a !== 0)) {
                //     console.log('Ejes:', axes);
                // }
            }

            requestAnimationFrame(checkGamepad);
        };

        const handleConnect = (e) => {
            console.log('Gamepad conectado:', e.gamepad);
            checkGamepad();
        };

        const handleDisconnect = () => {
            console.log('Gamepad desconectado');
        };

        window.addEventListener('gamepadconnected', handleConnect);
        window.addEventListener('gamepaddisconnected', handleDisconnect);

        return () => {
            window.removeEventListener('gamepadconnected', handleConnect);
            window.removeEventListener('gamepaddisconnected', handleDisconnect);
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-green-400 rounded-lg font-mono text-sm">
            Gamepad Debug - Ver consola
        </div>
    );
};

export default GamepadDebug;