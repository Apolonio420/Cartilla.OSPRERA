"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verificarOtp } from "@/app/actions/auth-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "El código debe tener 6 dígitos" })
    .regex(/^\d+$/, { message: "El código debe contener solo números" }),
})

export function OtpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await verificarOtp(values.otp)

      if (result.success) {
        toast({
          title: "Verificación exitosa",
          description: "Su identidad ha sido verificada correctamente",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.error || "Código OTP inválido",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-[#00613c]/20">
      <CardHeader className="bg-[#00613c] text-white rounded-t-lg">
        <CardTitle>Verificación</CardTitle>
        <CardDescription className="text-gray-200">
          Ingrese el código de 6 dígitos enviado a su teléfono o email
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código OTP</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-[#00613c] hover:bg-[#00613c]/90" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
