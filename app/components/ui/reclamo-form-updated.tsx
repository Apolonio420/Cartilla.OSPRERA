"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIAS, SUBCATEGORIAS } from "@/app/lib/categorias"
import { crearReclamo } from "@/app/actions/reclamo-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Steps, Step } from "@/components/ui/steps"
import { ArrowLeft, ArrowRight, Send, X } from "lucide-react"
import { EspecialidadSearch } from "./especialidad-search"
import { FarmaciaSearch } from "./farmacia-search"

// Esquema base para el formulario
const baseSchema = z.object({
  categoria: z.string().min(1, { message: "Debe seleccionar una categoría" }),
  subcategoria: z.string().min(1, { message: "Debe seleccionar una subcategoría" }),
  subsubcategoria: z.string().min(1, { message: "Debe seleccionar una sub-subcategoría" }),
  subsubsubcategoria: z.string().optional(), // Para casos de 4 niveles como APP > SOLICITUDES > PRÁCTICAS > APROBACIÓN
})

export function ReclamoFormUpdated() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [dynamicSchema, setDynamicSchema] = useState<z.ZodObject<any>>(baseSchema)

  // Estados para la jerarquía
  const [subcategorias, setSubcategorias] = useState<any[]>([])
  const [subsubcategorias, setSubsubcategorias] = useState<any[]>([])
  const [subsubsubcategorias, setSubsubsubcategorias] = useState<any[]>([])
  const [camposAdicionales, setCamposAdicionales] = useState<any[]>([])

  const router = useRouter()

  // Crear formulario con esquema dinámico
  const form = useForm<any>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      categoria: "",
      subcategoria: "",
      subsubcategoria: "",
      subsubsubcategoria: "",
      detalle: {},
    },
    mode: "onChange",
  })

  // Observar cambios en las selecciones
  const categoriaSeleccionada = form.watch("categoria")
  const subcategoriaSeleccionada = form.watch("subcategoria")
  const subsubcategoriaSeleccionada = form.watch("subsubcategoria")
  const subsubsubcategoriaSeleccionada = form.watch("subsubsubcategoria")

  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      setSubcategorias(subcats)
      form.setValue("subcategoria", "")
      form.setValue("subsubcategoria", "")
      form.setValue("subsubsubcategoria", "")
      setSubsubcategorias([])
      setSubsubsubcategorias([])
      setCamposAdicionales([])
    }
  }, [categoriaSeleccionada, form])

  // Actualizar sub-subcategorías cuando cambia la subcategoría
  useEffect(() => {
    if (categoriaSeleccionada && subcategoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      const subcategoriaObj = subcats.find((s) => s.label === subcategoriaSeleccionada)
      const subsubcats = subcategoriaObj?.subsubcategorias || []
      setSubsubcategorias(subsubcats)
      form.setValue("subsubcategoria", "")
      form.setValue("subsubsubcategoria", "")
      setSubsubsubcategorias([])
      setCamposAdicionales([])
    }
  }, [categoriaSeleccionada, subcategoriaSeleccionada, form])

  // Actualizar sub-sub-subcategorías cuando cambia la sub-subcategoría
  useEffect(() => {
    if (categoriaSeleccionada && subcategoriaSeleccionada && subsubcategoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      const subcategoriaObj = subcats.find((s) => s.label === subcategoriaSeleccionada)
      const subsubcats = subcategoriaObj?.subsubcategorias || []
      const subsubcategoriaObj = subsubcats.find((s) => s.label === subsubcategoriaSeleccionada)

      // Verificar si tiene más niveles anidados
      if (subsubcategoriaObj?.subsubcategorias && subsubcategoriaObj.subsubcategorias.length > 0) {
        setSubsubsubcategorias(subsubcategoriaObj.subsubcategorias)
        form.setValue("subsubsubcategoria", "")
        setCamposAdicionales([])
      } else {
        // Si no tiene más niveles, usar los campos de este nivel
        setSubsubsubcategorias([])
        const campos = subsubcategoriaObj?.campos || []
        setCamposAdicionales(campos)
        actualizarEsquema(campos)
      }
    }
  }, [categoriaSeleccionada, subcategoriaSeleccionada, subsubcategoriaSeleccionada, form])

  // Actualizar campos cuando cambia la sub-sub-subcategoría (4to nivel)
  useEffect(() => {
    if (subsubsubcategoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      const subcategoriaObj = subcats.find((s) => s.label === subcategoriaSeleccionada)
      const subsubcats = subcategoriaObj?.subsubcategorias || []
      const subsubcategoriaObj = subsubcats.find((s) => s.label === subsubcategoriaSeleccionada)
      const subsubsubcats = subsubcategoriaObj?.subsubcategorias || []
      const subsubsubcategoriaObj = subsubsubcats.find((s) => s.label === subsubsubcategoriaSeleccionada)

      const campos = subsubsubcategoriaObj?.campos || []
      setCamposAdicionales(campos)
      actualizarEsquema(campos)
    }
  }, [subsubsubcategoriaSeleccionada])

  // Función para actualizar el esquema dinámico
  const actualizarEsquema = (campos: any[]) => {
    const schemaObj: any = {
      categoria: baseSchema.shape.categoria,
      subcategoria: baseSchema.shape.subcategoria,
      subsubcategoria: baseSchema.shape.subsubcategoria,
      subsubsubcategoria: z.string().optional(),
      detalle: z.object({}).optional(),
    }

    if (campos.length > 0) {
      const detalleSchema: any = {}
      campos.forEach((campo) => {
        if (campo.required) {
          detalleSchema[campo.nombre] = z.string().min(1, { message: `${campo.label} es requerido` })
        } else {
          detalleSchema[campo.nombre] = z.string().optional()
        }
      })
      schemaObj.detalle = z.object(detalleSchema)
    }

    setDynamicSchema(z.object(schemaObj))
  }

  const nextStep = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  async function onSubmit(values: any) {
    setIsLoading(true)
    try {
      // Determinar la subcategoría final basada en la jerarquía
      let subcategoriaFinal = values.subsubcategoria
      if (values.subsubsubcategoria) {
        subcategoriaFinal = values.subsubsubcategoria
      }

      const result = await crearReclamo({
        categoria: values.categoria,
        subcategoria: values.subcategoria,
        subsubcategoria: subcategoriaFinal,
        detalle: values.detalle || {},
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

  // Función para renderizar campos según su tipo
  const renderCampo = (campo: any) => {
    switch (campo.tipo) {
      case "search_especialidad":
        return (
          <EspecialidadSearch
            onSelect={(especialidad) => {
              form.setValue(`detalle.${campo.nombre}`, especialidad.nombre)
            }}
            placeholder={`Buscar ${campo.label}`}
          />
        )

      case "search_farmacia":
        return (
          <FarmaciaSearch
            onSelect={(farmacia) => {
              form.setValue(`detalle.${campo.nombre}`, farmacia.nombre)
            }}
            placeholder={`Buscar ${campo.label}`}
          />
        )

      case "search_localidad":
        return (
          <Input
            placeholder={`Ingrese ${campo.label}`}
            onChange={(e) => form.setValue(`detalle.${campo.nombre}`, e.target.value)}
          />
        )

      case "radio":
        return (
          <RadioGroup
            onValueChange={(value) => form.setValue(`detalle.${campo.nombre}`, value)}
            className="flex flex-col space-y-1"
          >
            {campo.opciones?.map((opcion: string) => (
              <FormItem key={opcion} className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value={opcion} />
                </FormControl>
                <FormLabel className="font-normal">{opcion}</FormLabel>
              </FormItem>
            ))}
          </RadioGroup>
        )

      default:
        return (
          <Input
            placeholder={`Ingrese ${campo.label}`}
            onChange={(e) => form.setValue(`detalle.${campo.nombre}`, e.target.value)}
          />
        )
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Steps currentStep={currentStep} className="mb-8">
        <Step title="Categoría" />
        <Step title="Detalles" />
        <Step title="Confirmación" />
      </Steps>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              {/* Categoría */}
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                          <SelectValue placeholder="Seleccione una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subcategoría */}
              {categoriaSeleccionada && (
                <FormField
                  control={form.control}
                  name="subcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                            <SelectValue placeholder="Seleccione una subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategorias.map((subcat) => (
                            <SelectItem key={subcat.label} value={subcat.label}>
                              {subcat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Sub-subcategoría */}
              {subcategoriaSeleccionada && subsubcategorias.length > 0 && (
                <FormField
                  control={form.control}
                  name="subsubcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de reclamo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                            <SelectValue placeholder="Seleccione el tipo de reclamo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subsubcategorias.map((subsubcat) => (
                            <SelectItem key={subsubcat.label} value={subsubcat.label}>
                              {subsubcat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Sub-sub-subcategoría (4to nivel) */}
              {subsubcategoriaSeleccionada && subsubsubcategorias.length > 0 && (
                <FormField
                  control={form.control}
                  name="subsubsubcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detalle específico</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                            <SelectValue placeholder="Seleccione el detalle específico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subsubsubcategorias.map((subsubsubcat) => (
                            <SelectItem key={subsubsubcat.label} value={subsubsubcat.label}>
                              {subsubsubcat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {currentStep === 1 && camposAdicionales.length > 0 && (
            <div className="space-y-4">
              {camposAdicionales.map((campo) => (
                <FormField
                  key={campo.nombre}
                  control={form.control}
                  name={`detalle.${campo.nombre}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{campo.label}</FormLabel>
                      <FormControl>{renderCampo(campo)}</FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          )}

          {currentStep === 1 && camposAdicionales.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay campos adicionales para esta categoría</div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#00613c]/20 p-4">
                <h3 className="font-medium mb-2 text-[#00613c]">Resumen del reclamo</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Categoría:</div>
                  <div className="text-sm font-medium">{form.getValues("categoria")}</div>
                  <div className="text-sm text-muted-foreground">Subcategoría:</div>
                  <div className="text-sm font-medium">{form.getValues("subcategoria")}</div>
                  <div className="text-sm text-muted-foreground">Tipo:</div>
                  <div className="text-sm font-medium">
                    {form.getValues("subsubsubcategoria") || form.getValues("subsubcategoria")}
                  </div>
                  {camposAdicionales.map((campo) => (
                    <React.Fragment key={campo.nombre}>
                      <div className="text-sm text-muted-foreground">{campo.label}:</div>
                      <div className="text-sm font-medium">{form.getValues(`detalle.${campo.nombre}`) || "-"}</div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>
      </Form>

      <div className="flex justify-between mt-8">
        {currentStep > 0 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="border-[#00613c] text-[#00613c] hover:bg-[#00613c] hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
        {currentStep === 0 && (
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="border-[#00613c] text-[#00613c] hover:bg-[#00613c] hover:text-white"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        )}
        {currentStep < 2 ? (
          <Button onClick={nextStep} className="bg-[#00613c] hover:bg-[#00613c]/90">
            Siguiente
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-[#00613c] hover:bg-[#00613c]/90"
          >
            {isLoading ? (
              <>
                <Send className="mr-2 h-4 w-4 animate-pulse" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar reclamo
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
