import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MapPin, Stethoscope, User, Phone, FileText, Building2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00613c] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Cartilla Médica OSPRERA</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Acceda a la red de prestadores médicos y centros de atención para afiliados de OSPRERA
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/cartilla">
              <Button className="bg-white text-[#00613c] hover:bg-gray-100 px-6 py-5 text-lg">
                <Search className="mr-2 h-5 w-5" />
                Buscar Prestadores
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Sección de características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mt-8">
          <Card className="border-t-4 border-t-[#00613c]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#00613c]">
                <Search className="mr-2 h-5 w-5" />
                Búsqueda Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Encuentre prestadores médicos filtrando por localidad, especialidad o nombre de manera rápida y
                sencilla.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#00613c]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#00613c]">
                <MapPin className="mr-2 h-5 w-5" />
                Información Detallada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acceda a datos completos de contacto, ubicación y especialidades de cada prestador de la red.
              </p>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-[#00613c]">
            <CardHeader>
              <CardTitle className="flex items-center text-[#00613c]">
                <Building2 className="mr-2 h-5 w-5" />
                Centros de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Consulte la ubicación y horarios de atención de todas las delegaciones y centros médicos de OSPRERA.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sección principal con tabs */}
        <Tabs defaultValue="prestadores" className="mb-12">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger
              value="prestadores"
              className="data-[state=active]:bg-[#00613c] data-[state=active]:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Prestadores
            </TabsTrigger>
            <TabsTrigger
              value="especialidades"
              className="data-[state=active]:bg-[#00613c] data-[state=active]:text-white"
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              Especialidades
            </TabsTrigger>
            <TabsTrigger value="contacto" className="data-[state=active]:bg-[#00613c] data-[state=active]:text-white">
              <Phone className="mr-2 h-4 w-4" />
              Contacto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prestadores">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#00613c]">Red de Prestadores</CardTitle>
                <CardDescription>
                  OSPRERA cuenta con una amplia red de profesionales y centros médicos en todo el país
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Nuestra cartilla médica incluye profesionales de todas las especialidades, clínicas, sanatorios y
                  centros de diagnóstico para brindarle la mejor atención médica.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-[#00613c] mb-2">Médicos de Cabecera</h3>
                    <p className="text-sm text-gray-600">
                      Elija su médico de cabecera entre los profesionales de nuestra cartilla para coordinar su atención
                      médica.
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-[#00613c] mb-2">Especialistas</h3>
                    <p className="text-sm text-gray-600">
                      Acceda a especialistas en todas las áreas médicas con la orden de derivación de su médico de
                      cabecera.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/cartilla" className="w-full">
                  <Button className="w-full bg-[#00613c] hover:bg-[#004d30]">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar en la Cartilla
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="especialidades">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#00613c]">Especialidades Médicas</CardTitle>
                <CardDescription>Contamos con profesionales en todas las especialidades médicas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Clínica Médica</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Pediatría</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Cardiología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Traumatología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Ginecología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Oftalmología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Dermatología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Neurología</span>
                  </div>
                  <div className="flex items-center p-2 border rounded-md">
                    <Stethoscope className="h-4 w-4 text-[#00613c] mr-2" />
                    <span className="text-sm">Odontología</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/cartilla" className="w-full">
                  <Button className="w-full bg-[#00613c] hover:bg-[#004d30]">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Ver Todas las Especialidades
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contacto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#00613c]">Contacto y Atención</CardTitle>
                <CardDescription>Estamos para ayudarlo ante cualquier consulta o necesidad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[#00613c] mb-2">Líneas de Atención</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-[#00613c] mr-2" />
                        <span>0800-222-7373 (Atención al Afiliado)</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-[#00613c] mr-2" />
                        <span>0800-333-7373 (Urgencias Médicas)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#00613c] mb-2">Horarios de Atención</h3>
                    <p className="text-sm text-gray-600">
                      Lunes a Viernes de 8:00 a 18:00 hs
                      <br />
                      Sábados de 9:00 a 13:00 hs
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#00613c] hover:bg-[#004d30]">
                  <FileText className="mr-2 h-4 w-4" />
                  Descargar Información de Contacto
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12 pt-6 border-t">
          <p>
            © {new Date().getFullYear()} OSPRERA - Obra Social del Personal Rural y Estibadores de la República
            Argentina
          </p>
          <p className="mt-1">Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}
