function Navbar() {
  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="space-x-4">
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Cargar ROM</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Play</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">x2</button>
        <button className="cursor-pointer bg-amber-950 rounded w-30 h-10 hover:underline">Volumen</button>
      </div>
    </nav>
  )
}

export default Navbar