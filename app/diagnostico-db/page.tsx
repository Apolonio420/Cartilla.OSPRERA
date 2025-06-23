import { neon } from "@neondatabase/serverless"

async function verificarBaseDatos() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Verificar si la tabla existe
    const tablas = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'Afiliado'
    `

    // Verificar columnas de la tabla Afiliado
    const columnas = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'Afiliado'
      ORDER BY ordinal_position
    `

    return {
      tablaExiste: tablas.length > 0,
      columnas: columnas,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

export default async function DiagnosticoDB() {
  const resultado = await verificarBaseDatos()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔍 Diagnóstico de Base de Datos</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Estado de la tabla Afiliado</h2>

        {resultado.error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {resultado.error}
          </div>
        ) : (
          <>
            <div
              className={`mb-4 p-3 rounded ${resultado.tablaExiste ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              <strong>Tabla Afiliado:</strong> {resultado.tablaExiste ? "✅ Existe" : "❌ No existe"}
            </div>

            {resultado.tablaExiste && resultado.columnas && (
              <div>
                <h3 className="font-semibold mb-2">Columnas disponibles:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Columna</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.columnas.map((col: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="border border-gray-300 px-4 py-2 font-mono">{col.column_name}</td>
                          <td className="border border-gray-300 px-4 py-2">{col.data_type}</td>
                          <td className="border border-gray-300 px-4 py-2">{col.is_nullable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Pasos para solucionar:</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>
              Ejecutar: <code className="bg-blue-100 px-2 py-1 rounded">npx prisma db push</code>
            </li>
            <li>
              Ejecutar: <code className="bg-blue-100 px-2 py-1 rounded">npx prisma generate</code>
            </li>
            <li>Reiniciar el servidor de desarrollo</li>
            <li>Volver a intentar la sincronización</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
