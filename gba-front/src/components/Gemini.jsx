import { useState } from "react"
import { Send, User, Loader, Sparkles, X } from 'lucide-react'
import { useEmulator } from "../context/emulator.context";

function Gemini() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { emulator } = useEmulator();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        const userMessage = content.trim();
        setContent('');
        setIsLoading(true);

        const newConversation = [...conversation, { type: 'user', content: userMessage }];
        setConversation(newConversation);

        try {
            const result = await fetch('http://localhost:5000/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: userMessage,
                    history: conversation
                })
            });

            if (!result.ok) throw new Error('Error en la respuesta');

            const text = await result.json();

            setConversation([...newConversation, { type: 'ai', content: text.response }]);
        } catch (error) {
            console.error('Error:', error);
            setConversation([...newConversation, { type: 'ai', content: 'Error: No se pudo obtener respuesta de la IA.' }]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    const clearConversation = () => {
        setConversation([]);
    }

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => { setIsOpen(true); emulator.toggleInput(false); }}
                    className="fixed top-6 right-6 z-40 p-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full shadow-lg hover:shadow-purple-500/30 transition-all duration-300 group"
                >
                    <img src='jeremias.png' alt='jeremias' className='h-12 w-12 group-hover:scale-110 transition-transform' />
                </button>
            )}

            {/* Panel lateral del chat */}
            <div className={`fixed inset-y-0 right-0 z-50 w-156 bg-gray-800/95 backdrop-blur-sm border-l border-purple-500/30 shadow-xl shadow-purple-500/10 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                <div className="flex items-center justify-between p-4 border-b border-purple-500/30 bg-gray-800/80">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            <img src='jeremias.png' alt='jeremias' className='h-5 w-5' />
                        </div>
                        <div>
                            <h3 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                Jeremias
                            </h3>
                            <p className="text-xs text-gray-400">Experto en jueguitos.</p>
                        </div>
                        <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                    </div>

                    <div className="flex items-center space-x-1">
                        {conversation.length > 0 && (
                            <button
                                onClick={clearConversation}
                                className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-red-400"
                                title="Limpiar chat"
                            >
                                <Loader className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={() => { setIsOpen(false); emulator.toggleInput(true); }}
                            className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Área de mensajes */}
                <div className="flex-1 h-[calc(100vh-140px)] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {conversation.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="p-3 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                                <img src='jeremias.png' alt='jeremias' className='h-10 w-10' />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-200 mb-2">¡Hola!</h4>
                                <p className="text-gray-400 text-sm max-w-xs">
                                    Soy Jeremias, tu ayudante para videojuegos. ¿En qué puedo ayudarte?
                                </p>
                            </div>
                        </div>
                    ) : (
                        conversation.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 p-1.5 rounded-full ${message.type === 'user'
                                        ? 'bg-gradient-to-br from-cyan-600 to-blue-700'
                                        : 'bg-gradient-to-br from-purple-600 to-pink-600'
                                        }`}>
                                        {message.type === 'user' ? (
                                            <User className="h-3 w-3 text-white" />
                                        ) : (
                                            <img src='jeremias.png' alt='jeremias' className='h-3 w-3' />
                                        )}
                                    </div>
                                    <div className={`p-2.5 rounded-lg text-sm ${message.type === 'user'
                                        ? 'bg-gradient-to-br from-cyan-600/20 to-blue-700/20 border border-cyan-500/30'
                                        : 'bg-gray-700/50 border border-gray-600'
                                        }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap text-white">
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start space-x-2 max-w-[85%]">
                                <div className="flex-shrink-0 p-1.5 rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
                                    <img src='jeremias.png' alt='jeremias' className='h-3 w-3' />
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-700/50 border border-gray-600">
                                    <div className="flex items-center space-x-2">
                                        <Loader className="h-3 w-3 animate-spin text-purple-400" />
                                        <span className="text-sm text-gray-400">Pensando...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-purple-500/30 bg-gray-800/80">
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="flex items-end space-x-2">
                            <textarea
                                name="content"
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pregúntame sobre juegos..."
                                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[40px] max-h-24"
                                rows="1"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !content.trim()}
                                className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 shadow hover:shadow-purple-500/30 disabled:shadow-none"
                            >
                                {isLoading ? (
                                    <Loader className="h-4 w-4 text-white animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4 text-white" />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500">
                            Enter para enviar • Shift+Enter nueva línea
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Gemini