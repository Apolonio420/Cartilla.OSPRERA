import { OtpForm } from "@/app/components/ui/otp-form"

export default function VerificarPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-[#00613c]">Verificación</h1>
          <p className="text-muted-foreground">Ingrese el código enviado a su teléfono o email</p>
        </div>
        <OtpForm />
      </div>
    </main>
  )
}
