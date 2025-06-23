"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { verificarDni } from "@/app/actions/auth-actions"

const formSchema = z.object({
  dni: z
    .string()
    .min(7, { message: "El DNI debe tener al menos 7 dígitos" })
    .max(8, { message: "El DNI debe tener máximo 8 dígitos" })
    .regex(/^\d+$/, { message: "El DNI debe contener solo números" }),
})

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await verificarDni({ dni: values.dni })

      if (result.success) {
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.error || "DNI no encontrado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error:", error)
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
    <Card className="w-full border-[#00613c]/20">
      <CardHeader className="bg-[#00613c] text-white rounded-t-lg">
        <CardTitle>Acceso al Sistema</CardTitle>
        <CardDescription className="text-gray-200">Ingrese su DNI para acceder a sus reclamos</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} className="text-lg py-3" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-[#00613c] hover:bg-[#00613c]/90 py-3" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Ingresar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
