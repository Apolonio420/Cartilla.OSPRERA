export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Prueba</h1>
      <p>Esta es una página de prueba estática.</p>
      <div className="mt-4 space-y-2">
        <p>
          <a href="/" className="text-blue-500 underline">
            Ir al inicio
          </a>
        </p>
        <p>
          <a href="/dashboard" className="text-blue-500 underline">
            Ir al dashboard
          </a>
        </p>
      </div>
    </div>
  )
}
