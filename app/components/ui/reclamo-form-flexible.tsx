"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { LocalidadSearch } from "./localidad-search"
import { EspecialidadSearch } from "./especialidad-search"
import { CartillaSearch } from "./cartilla-search"
import { crearReclamo } from "@/app/actions/reclamo-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Esquema de validación
const formSchema = z.object({
  localidad: z.string().min(1, { message: "La localidad es requerida" }),
  especialidad: z.string().optional(),
  prestador: z.string().optional(),
  fecha_atencion: z.date().optional(),
  reclamo: z.string().min(10, { message: "El reclamo debe tener al menos 10 caracteres" }),
})

export function ReclamoFormFlexible() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocalidad, setSelectedLocalidad] = useState<string | undefined>(undefined)
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | undefined>(undefined)
  const [selectedPrestador, setSelectedPrestador] = useState<string | undefined>(undefined)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localidad: "",
      especialidad: "",
      prestador: "",
      reclamo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await crearReclamo({
        categoria: "Prestadores",
        subcategoria: "Reclamo General",
        detalle: {
          localidad: values.localidad,
          especialidad: values.especialidad || "",
          prestador: values.prestador || "",
          fecha_atencion: values.fecha_atencion ? format(values.fecha_atencion, "yyyy-MM-dd") : "",
          reclamo: values.reclamo,
        },
      })

      if (result.success) {
        toast({
          title: "Reclamo enviado",
          description: "Su reclamo ha sido registrado correctamente",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el reclamo",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="localidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localidad</FormLabel>
                <FormControl>
                  <LocalidadSearch
                    onSelect={(localidad) => {
                      field.onChange(localidad.nombre)
                      setSelectedLocalidad(localidad.nombre)
                      // Reset dependientes
                      form.setValue("prestador", "")
                      setSelectedPrestador(undefined)
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="especialidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidad</FormLabel>
                <FormControl>
                  <EspecialidadSearch
                    onSelect={(especialidad) => {
                      field.onChange(especialidad.nombre)
                      setSelectedEspecialidad(especialidad.nombre)
                    }}
                    value={field.value}
                    localidad={selectedLocalidad}
                    prestador={selectedPrestador}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prestador"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestador</FormLabel>
                <FormControl>
                  <CartillaSearch
                    onSelect={(prestador) => {
                      // Si es un objeto, usar el nombre, si es string, usar directamente
                      const nombrePrestador =
                        typeof prestador === "string" ? prestador : prestador.nombre || prestador.nombre_completo
                      field.onChange(nombrePrestador)
                      setSelectedPrestador(nombrePrestador)
                    }}
                    value={field.value}
                    filters={{
                      localidad: selectedLocalidad,
                      especialidad: selectedEspecialidad,
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_atencion"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de atención</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reclamo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reclamo</FormLabel>
              <FormControl>
                <Textarea placeholder="Ingrese su reclamo aquí." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-[#00613c] hover:bg-[#00613c]/90" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Reclamo"
          )}
        </Button>
      </form>
    </Form>
  )
}

// Exportación nombrada para que funcione con el import
