export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Página de Depuración</h1>
      <p>Esta página muestra información básica para depuración.</p>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Información del entorno</h2>
        <p>Hora del servidor: {new Date().toISOString()}</p>
        <p>Entorno: {process.env.NODE_ENV}</p>
      </div>

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
        <p>
          <a href="/test" className="text-blue-500 underline">
            Ir a la página de prueba
          </a>
        </p>
      </div>
    </div>
  )
}
