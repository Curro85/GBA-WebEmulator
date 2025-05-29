import { X, Settings as SettingsIcon, Gamepad2, Info } from 'lucide-react';

function Settings({ onSuccess }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="relative max-w-2xl w-full mx-4 bg-gray-900 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20 overflow-hidden">
                {/* Barra superior */}
                <div className="handle flex justify-between items-center bg-gray-800 px-4 py-3 border-b border-purple-500">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-2">
                        <SettingsIcon size={24} className="text-purple-400" />
                        Controles
                    </h2>
                    <button
                        onClick={onSuccess}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
                                <Gamepad2 size={20} />
                                Esquema de Controles
                            </h3>
                            <div className="bg-gray-800 rounded-lg p-4 inline-block">
                                <img
                                    src='/gba.png'
                                    alt='Controles GBA'
                                    className="max-w-full h-auto rounded-md"
                                    style={{ maxHeight: '300px' }}
                                />
                            </div>
                            <div className="mt-4 text-sm text-gray-400 space-y-2">
                                <p className="flex items-center justify-center gap-2">
                                    <Info size={14} />
                                    Usa las teclas mostradas para jugar
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-4">
                                    <div className="space-y-1">
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">Z</span> Botón A</p>
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">X</span> Botón B</p>
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">←↑→↓</span> Cruceta</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">A</span> Botón L</p>
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">S</span> Botón R</p>
                                        <p><span className="bg-gray-700 px-2 py-1 rounded text-xs">Enter</span> Start</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-700">
                            <button
                                onClick={onSuccess}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;