import { useState } from "react"

function Gemini() {
    const [response, setResponse] = useState('');
    const [content, setContent] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await fetch('http://localhost:5000/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        })

        if (!result) return;
        const text = await result.json();

        setResponse(text.response);
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <textarea
                    name="content"
                    id="content"
                    onChange={(e) => setContent(e.target.value)}
                >
                </textarea>
                <button type="submit">Enviar</button>
            </form>
            <div>
                <p>Respuesta: {response}</p>
            </div>
        </>
    )
}

export default Gemini