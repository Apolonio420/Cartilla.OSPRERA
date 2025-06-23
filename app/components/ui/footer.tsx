import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, MapPin, Youtube, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#00613c] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%283%29-88U1neg4WhRgcnRXJJYz6I2QAqkKjH.png"
                alt="OSPRERA"
                width={250}
                height={60}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm">Obra Social del Personal Rural y Estibadores de la República Argentina</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                Reconquista 630 - (1003) Capital Federal
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                (011) 4312-2500
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                consultas@osprera.org.ar
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-[#00613c] border border-white rounded-lg p-4 text-white">
              <h3 className="text-lg font-bold">Centros de atención telefónica</h3>
              <h2 className="text-2xl font-bold">Provinciales</h2>
              <p className="text-sm font-bold">NÚMEROS TELEFÓNICOS</p>
            </div>
            <div className="mt-auto">
              <div className="flex space-x-4 mt-4">
                <Link href="#" className="text-white hover:text-[#ffd100]">
                  <Youtube className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-white hover:text-[#ffd100]">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/20 text-sm text-center">
          <p>Copyright © 2025 Osprera. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
