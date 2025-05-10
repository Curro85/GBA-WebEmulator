import { useEffect } from 'react'
import { useEmulator } from '../context/emulator.context'
import { useGamepad } from '../hooks/useGamepad';
import { PlayIcon, PauseIcon, ArrowUpTrayIcon, BoltIcon } from '@heroicons/react/24/outline';

const Emulator = () => {
    const {
        emulator,
        canvasRef,
        speed, handleSpeed,
        volume, handleVolume,
        handleRomLoad,
        toggleEmulation,
        status, isRunning, setIsRunning
    } = useEmulator();

    useGamepad({
        onPress: name => {
            if (name === 'rt') {
                handleSpeed(speed + 4);
            } else if (name === 'lt') {
                handleSpeed(speed - 4);
            } else if (name === 'ls') {
                emulator.quickReload();
            } else {
                emulator.buttonPress(name);
            }
        },

        onRelease: name => {
            emulator.buttonUnpress(name);
        }
    });

    useEffect(() => {
        if (emulator?.romLoaded && !isRunning) {
            emulator.start();
            setIsRunning(true);
        }
    }, [emulator, isRunning, setIsRunning]);

    const handleOnDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleRomLoad(files[0]);
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 space-y-6">
            <div className="w-full max-w-5xl space-y-6">
                <div className="relative w-full aspect-[3/2] overflow-hidden rounded-xl border-4 border-gray-800 shadow-2xl bg-black group">
                    <canvas
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDrop={(e) => handleOnDrop(e)}
                        ref={canvasRef}
                        width={240}
                        height={160}
                        className="absolute top-0 left-0 w-full h-full object-contain"
                    />

                    {/* Efecto CRT */}
                    <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMNCA0Wk00IDBMMCA0WiIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2U9IiNmZmYiPjwvcGF0aD4KPC9zdmc+')]"></div>

                    {/* Estado del emulador */}
                    <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-md text-sm font-medium ${status.includes('Error') ? 'bg-red-900/80 text-red-200' :
                        status.includes('Pausado') ? 'bg-amber-900/80 text-amber-200' :
                            status.includes('Jugando') ? 'bg-green-900/80 text-green-200' :
                                'bg-gray-800/80 text-gray-300'
                        }`}>
                        {status}
                    </div>
                </div>

                {/* Controles */}
                <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {/* Botón Cargar ROM */}
                        <label className="cursor-pointer flex items-center space-x-2 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg transition-all duration-200 shadow hover:shadow-purple-500/30">
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            <span>Cargar ROM</span>
                            <input
                                type="file"
                                className="hidden"
                                accept=".gba, .gbc, .gb"
                                onChange={(e) => handleRomLoad(e.target.files[0])}
                                disabled={isRunning}
                            />
                        </label>

                        {/* Botón Play/Pause */}
                        <button
                            onClick={toggleEmulation}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 shadow ${isRunning ?
                                'bg-red-600 hover:bg-red-500 shadow-red-500/30 hover:shadow-red-500/40' :
                                'bg-green-600 hover:bg-green-500 shadow-green-500/30 hover:shadow-green-500/40'
                                }`}
                        >
                            {isRunning ? (
                                <>
                                    <PauseIcon className="h-5 w-5" />
                                    <span>Pausar</span>
                                </>
                            ) : (
                                <>
                                    <PlayIcon className="h-5 w-5" />
                                    <span>Jugar</span>
                                </>
                            )}
                        </button>

                        {/* Control de velocidad */}
                        <div className="flex items-center space-x-3 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
                            <BoltIcon className="h-5 w-5 text-amber-400" />
                            <input
                                type="range"
                                onChange={e => handleSpeed(Number(e.target.value))}
                                onMouseUp={(e) => e.target.blur()}
                                onKeyUp={(e) => e.target.blur()}
                                min="1"
                                max="5"
                                step="1"
                                value={speed}
                                className="w-24 accent-amber-500 cursor-pointer"
                            />
                            <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                                x{speed}
                            </span>
                        </div>

                        {/* Control de volumen */}
                        <div className="flex items-center space-x-3 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
                            <input
                                type="range"
                                onChange={handleVolume}
                                onMouseUp={(e) => e.target.blur()}
                                onKeyUp={(e) => e.target.blur()}
                                min="0"
                                max="100"
                                value={volume}
                                className="w-24 accent-blue-500 cursor-pointer"
                            />
                            <span className="text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                                {volume}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20 rounded-full"></div>
            </div>
        </div>
    );
};

export default Emulator;