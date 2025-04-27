function LoginForm({ onSuccess }) {
    const handleSubmit = (e) => {
        e.preventDefault()

        onSuccess()
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold">Iniciar sesión</h2>
            <input type="email" placeholder="Email" className="w-full border p-2 rounded" required />
            <input type="password" placeholder="Contraseña" className="w-full border p-2 rounded" required />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Entrar
            </button>
        </form>
    )
}

export default LoginForm