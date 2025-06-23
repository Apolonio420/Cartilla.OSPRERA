// Script simple para probar la conexión a GitHub
async function probarConexion() {
  const urls = {
    farmacias:
      "https://raw.githubusercontent.com/Apolonio420/osprera-datos-csv/refs/heads/main/Red%20de%20Farmacias%20(Ambulatorio).csv",
    especialidades:
      "https://raw.githubusercontent.com/Apolonio420/osprera-datos-csv/refs/heads/main/Especialidades.csv",
  }

  for (const [nombre, url] of Object.entries(urls)) {
    try {
      console.log(`\n🔍 Probando ${nombre}...`)
      console.log(`📡 URL: ${url}`)

      const response = await fetch(url)
      console.log(`📊 Status: ${response.status} ${response.statusText}`)

      if (response.ok) {
        const content = await response.text()
        const lines = content.split("\n").filter((line) => line.trim())
        console.log(`📄 Líneas: ${lines.length}`)
        console.log(`📋 Headers: ${lines[0]}`)
        console.log(`✅ ${nombre} - OK`)
      } else {
        console.log(`❌ ${nombre} - Error: ${response.status}`)
      }
    } catch (error) {
      console.log(`💥 ${nombre} - Error: ${error}`)
    }
  }
}

probarConexion()
