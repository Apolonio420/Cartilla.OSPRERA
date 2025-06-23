"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIAS, SUBCATEGORIAS } from "@/app/lib/categorias"
import { crearReclamo } from "@/app/actions/reclamo-actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Steps, Step } from "@/components/ui/steps"
import { ArrowLeft, ArrowRight, Send, X, Edit3 } from "lucide-react"
import { LocalidadSearch } from "./localidad-search"
import { EspecialidadSearch } from "./especialidad-search"
import { FarmaciaSearch } from "./farmacia-search"
import { CartillaSearch } from "./cartilla-search"
import { RedFarmaciasSearch } from "./red-farmacias-search"
import { RegionSearch } from "./region-search"
import { obtenerDatosValidados } from "@/app/actions/validation-actions"

// Esquema base para el formulario
const baseSchema = z.object({
  categoria: z.string().min(1, { message: "Debe seleccionar una categoría" }),
  subcategoria: z.string().min(1, { message: "Debe seleccionar un motivo" }),
  subsubcategoria: z.string().optional(), // Submotivo opcional
  detalle_adicional: z.string().optional(), // Campo libre opcional
})

interface DatosContacto {
  telefono_validado?: string
  email_validado?: string
  fecha_validacion?: string
}

export function ReclamoForm() {
  const [currentStep, setCurrentStep] = useState(0) // 0 = Reclamo, 1 = Confirmación
  const [isLoading, setIsLoading] = useState(false)
  const [dynamicSchema, setDynamicSchema] = useState<z.ZodObject<any>>(baseSchema)
  const [subcategorias, setSubcategorias] = useState<any[]>([])
  const [subsubcategorias, setSubsubcategorias] = useState<any[]>([])
  const [camposAdicionales, setCamposAdicionales] = useState<any[]>([])
  const [datosContacto, setDatosContacto] = useState<DatosContacto | null>(null)
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [isRestoringState, setIsRestoringState] = useState(false)
  const router = useRouter()

  // Estados para los filtros cruzados
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined)
  const [selectedLocalidad, setSelectedLocalidad] = useState<string | undefined>(undefined)
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string | undefined>(undefined)
  const [selectedPrestador, setSelectedPrestador] = useState<string | undefined>(undefined)

  // Crear formulario con esquema dinámico
  const form = useForm<any>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      categoria: "",
      subcategoria: "",
      subsubcategoria: "",
      detalle: {},
      detalle_adicional: "",
    },
    mode: "onChange",
  })

  // Observar cambios en la categoría seleccionada
  const categoriaSeleccionada = form.watch("categoria")
  const subcategoriaSeleccionada = form.watch("subcategoria")
  const subsubcategoriaSeleccionada = form.watch("subsubcategoria")

  // Cargar datos de contacto cuando se monta el componente
  useEffect(() => {
    const cargarDatosContacto = async () => {
      setLoadingDatos(true)
      try {
        const datos = await obtenerDatosValidados()
        if (datos) {
          setDatosContacto(datos)
          console.log("✅ Datos de contacto cargados:", datos)
        } else {
          console.log("❌ No se encontraron datos de contacto validados")
        }
      } catch (error) {
        console.error("Error cargando datos de contacto:", error)
      } finally {
        setLoadingDatos(false)
      }
    }

    cargarDatosContacto()
  }, [])

  // Restaurar datos del formulario si vuelve de editar contacto - PRIMERO
  useEffect(() => {
    const draft = localStorage.getItem("reclamo_draft")
    if (draft) {
      try {
        const savedState = JSON.parse(draft)
        console.log("🔄 Restaurando estado guardado:", savedState)

        // Si es el formato nuevo (con componentState)
        if (savedState.formData) {
          const {
            formData,
            currentStep: savedStep,
            subcategorias: savedSubcats,
            subsubcategorias: savedSubsubcats,
            camposAdicionales: savedCampos,
            selectedRegion: savedRegion,
            selectedLocalidad: savedLocalidad,
            selectedEspecialidad: savedEspecialidad,
            selectedPrestador: savedPrestador,
          } = savedState

          setIsRestoringState(true)

          // Restaurar estado del componente PRIMERO
          if (savedSubcats) {
            console.log("🔄 Restaurando subcategorías:", savedSubcats)
            setSubcategorias(savedSubcats)
          }
          if (savedSubsubcats) {
            console.log("🔄 Restaurando subsubcategorías:", savedSubsubcats)
            setSubsubcategorias(savedSubsubcats)
          }
          if (savedCampos) {
            console.log("🔄 Restaurando campos adicionales:", savedCampos)
            setCamposAdicionales(savedCampos)
          }
          if (savedRegion) setSelectedRegion(savedRegion)
          if (savedLocalidad) setSelectedLocalidad(savedLocalidad)
          if (savedEspecialidad) setSelectedEspecialidad(savedEspecialidad)
          if (savedPrestador) setSelectedPrestador(savedPrestador)

          // Reconstruir esquema dinámico si hay campos adicionales
          if (savedCampos && savedCampos.length > 0) {
            const schemaObj: any = {
              categoria: baseSchema.shape.categoria,
              subcategoria: baseSchema.shape.subcategoria,
              subsubcategoria: baseSchema.shape.subsubcategoria,
              detalle_adicional: baseSchema.shape.detalle_adicional,
              detalle: z.object({}).optional(),
            }

            const detalleSchema: any = {}
            savedCampos.forEach((campo: any) => {
              if (campo.required) {
                detalleSchema[campo.nombre] = z.string().min(1, { message: `${campo.label} es requerido` })
              } else {
                detalleSchema[campo.nombre] = z.string().optional()
              }
            })
            schemaObj.detalle = z.object(detalleSchema)
            setDynamicSchema(z.object(schemaObj))
          }

          // Restaurar valores del formulario DESPUÉS
          setTimeout(() => {
            console.log("🔄 Restaurando valores del formulario:", formData)
            form.reset(formData)

            // Restaurar el paso si estaba en confirmación
            if (savedStep === 1) {
              setCurrentStep(1)
            }

            setIsRestoringState(false)
            console.log("✅ Estado completo restaurado")
          }, 100)
        } else {
          // Formato antiguo (solo formData) - mantener compatibilidad
          form.reset(savedState)
          if (savedState.categoria && savedState.subcategoria) {
            setCurrentStep(1)
          }
        }

        // Limpiar el draft después de restaurar
        localStorage.removeItem("reclamo_draft")
      } catch (error) {
        console.error("Error restaurando draft:", error)
        localStorage.removeItem("reclamo_draft")
      }
    }
  }, [form])

  // Actualizar subcategorías cuando cambia la categoría - SOLO si no estamos restaurando
  useEffect(() => {
    if (isRestoringState) {
      console.log("⏸️ Saltando actualización de subcategorías - restaurando estado")
      return
    }

    if (categoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      console.log("🔄 Actualizando motivos para categoría:", categoriaSeleccionada, subcats)
      setSubcategorias(subcats)

      // Limpiar subcategoría y subsubcategoría
      form.setValue("subcategoria", "")
      form.setValue("subsubcategoria", "")
      setSubsubcategorias([])
      setCamposAdicionales([])
    } else {
      setSubcategorias([])
      setSubsubcategorias([])
      setCamposAdicionales([])
    }
  }, [categoriaSeleccionada, form, isRestoringState])

  // Actualizar subsubcategorías cuando cambia la subcategoría - SOLO si no estamos restaurando
  useEffect(() => {
    if (isRestoringState) {
      console.log("⏸️ Saltando actualización de subsubcategorías - restaurando estado")
      return
    }

    if (categoriaSeleccionada && subcategoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      const subcategoriaObj = subcats.find((s) => s.label === subcategoriaSeleccionada)

      if (subcategoriaObj?.subsubcategorias && subcategoriaObj.subsubcategorias.length > 0) {
        // Tiene subsubcategorías (submotivos)
        console.log("🔄 Actualizando submotivos:", subcategoriaObj.subsubcategorias)
        setSubsubcategorias(subcategoriaObj.subsubcategorias)
        form.setValue("subsubcategoria", "")
        setCamposAdicionales([])
      } else {
        // No tiene subsubcategorías, usar campos directos
        console.log("🔄 Usando campos directos del motivo")
        setSubsubcategorias([])
        const campos = subcategoriaObj?.campos || []
        setCamposAdicionales(campos)

        // Construir esquema dinámico
        const schemaObj: any = {
          categoria: baseSchema.shape.categoria,
          subcategoria: baseSchema.shape.subcategoria,
          subsubcategoria: baseSchema.shape.subsubcategoria,
          detalle_adicional: baseSchema.shape.detalle_adicional,
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
    }
  }, [categoriaSeleccionada, subcategoriaSeleccionada, form, isRestoringState])

  // Actualizar campos adicionales cuando cambia la subsubcategoría - SOLO si no estamos restaurando
  useEffect(() => {
    if (isRestoringState) {
      console.log("⏸️ Saltando actualización de campos - restaurando estado")
      return
    }

    if (categoriaSeleccionada && subcategoriaSeleccionada && subsubcategoriaSeleccionada) {
      const subcats = SUBCATEGORIAS[categoriaSeleccionada] || []
      const subcategoriaObj = subcats.find((s) => s.label === subcategoriaSeleccionada)
      const subsubcategoriaObj = subcategoriaObj?.subsubcategorias?.find(
        (ss) => ss.label === subsubcategoriaSeleccionada,
      )
      const campos = subsubcategoriaObj?.campos || []

      console.log("🔄 Actualizando campos para submotivo:", subsubcategoriaSeleccionada, campos)
      setCamposAdicionales(campos)

      // Construir esquema dinámico basado en los campos adicionales
      const schemaObj: any = {
        categoria: baseSchema.shape.categoria,
        subcategoria: baseSchema.shape.subcategoria,
        subsubcategoria: z.string().min(1, { message: "Debe seleccionar un submotivo" }),
        detalle_adicional: baseSchema.shape.detalle_adicional,
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
  }, [categoriaSeleccionada, subcategoriaSeleccionada, subsubcategoriaSeleccionada, isRestoringState])

  const nextStep = async () => {
    // Validar todos los campos del formulario de reclamo
    const fieldsToValidate: string[] = ["categoria", "subcategoria", "detalle_adicional"]

    // Agregar subsubcategoria si es requerida
    if (subsubcategorias.length > 0) {
      fieldsToValidate.push("subsubcategoria")
    }

    // Agregar campos requeridos dinámicos
    camposAdicionales.forEach((campo) => {
      if (campo.required) {
        fieldsToValidate.push(`detalle.${campo.nombre}`)
      }
    })

    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(1) // Ir a confirmación
    }
  }

  const prevStep = () => {
    setCurrentStep(0) // Volver al formulario de reclamo
  }

  const editarDatosContacto = () => {
    // Guardar el estado completo del formulario y componente
    const formData = form.getValues()
    const componentState = {
      formData,
      currentStep,
      subcategorias,
      subsubcategorias,
      camposAdicionales,
      selectedRegion,
      selectedLocalidad,
      selectedEspecialidad,
      selectedPrestador,
    }

    localStorage.setItem("reclamo_draft", JSON.stringify(componentState))
    console.log("💾 Estado guardado antes de editar:", componentState)

    // Redirigir a la página de validación de datos
    router.push("/validar-datos?return=/new-claim")
  }

  async function onSubmit(values: any) {
    setIsLoading(true)
    try {
      // Combinar detalle específico con detalle adicional
      const detalleCompleto = {
        ...values.detalle,
        detalle_adicional: values.detalle_adicional || "",
      }

      const result = await crearReclamo({
        categoria: values.categoria,
        subcategoria: values.subcategoria,
        subsubcategoria: values.subsubcategoria,
        detalle: detalleCompleto,
      })

      if (result.success) {
        // Limpiar draft si existe
        localStorage.removeItem("reclamo_draft")

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

  const renderCampo = (campo: any) => {
    return (
      <FormField
        key={campo.nombre}
        control={form.control}
        name={`detalle.${campo.nombre}`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{campo.label}</FormLabel>
            {campo.tipo === "text" && (
              <FormControl>
                <Input {...field} className="border-[#00613c]/20 focus:ring-[#00613c]/20" />
              </FormControl>
            )}
            {campo.tipo === "textarea" && (
              <FormControl>
                <Textarea {...field} className="border-[#00613c]/20 focus:ring-[#00613c]/20" rows={4} />
              </FormControl>
            )}
            {campo.tipo === "select" && (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                    <SelectValue placeholder={`Seleccione ${campo.label}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campo.opciones?.map((opcion: string) => (
                    <SelectItem key={opcion} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {campo.tipo === "radio" && (
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
              </FormControl>
            )}
            {campo.tipo === "search_region" && (
              <FormControl>
                <RegionSearch
                  onSelect={(region) => {
                    if (region) {
                      field.onChange(region.region)
                      setSelectedRegion(region.region)
                      console.log("✅ Región seleccionada para filtro:", region.region)
                    } else {
                      field.onChange("")
                      setSelectedRegion(undefined)
                      console.log("🗑️ Región limpiada")
                    }
                  }}
                  placeholder="Buscar región (ej: GBA Norte, Interior PBA...)"
                  value={field.value}
                />
              </FormControl>
            )}
            {campo.tipo === "search_localidad" && (
              <FormControl>
                <LocalidadSearch
                  onSelect={(localidad) => {
                    if (localidad) {
                      field.onChange(localidad.nombre)
                      setSelectedLocalidad(localidad.nombre)
                      console.log("✅ Localidad seleccionada para filtro:", localidad.nombre)
                    } else {
                      field.onChange("")
                      setSelectedLocalidad(undefined)
                      console.log("🗑️ Localidad limpiada")
                    }
                  }}
                  placeholder="Buscar localidad (ej: vicente, capital, rosario...)"
                  value={field.value}
                  region={selectedRegion}
                />
              </FormControl>
            )}
            {campo.tipo === "search_especialidad" && (
              <FormControl>
                <EspecialidadSearch
                  onSelect={(especialidad) => {
                    if (especialidad) {
                      field.onChange(especialidad.nombre)
                      setSelectedEspecialidad(especialidad.nombre)
                      console.log("✅ Especialidad seleccionada para filtro:", especialidad.nombre)
                    } else {
                      field.onChange("")
                      setSelectedEspecialidad(undefined)
                      console.log("🗑️ Especialidad limpiada")
                    }
                  }}
                  placeholder="Buscar especialidad (ej: alergia, cardio, trauma...)"
                  localidad={selectedLocalidad}
                  prestador={selectedPrestador}
                  value={field.value}
                />
              </FormControl>
            )}
            {campo.tipo === "search_farmacia" && (
              <FormControl>
                <FarmaciaSearch
                  onSelect={(farmacia) => field.onChange(farmacia.nombre)}
                  placeholder="Buscar farmacia (ej: farmacity, del pueblo...)"
                  localidad={selectedLocalidad}
                  especialidad={selectedEspecialidad}
                />
              </FormControl>
            )}
            {campo.tipo === "search_red_farmacias" && (
              <FormControl>
                <RedFarmaciasSearch
                  onSelect={(farmacia) => field.onChange(farmacia.nombre)}
                  placeholder="Buscar farmacia de la red (ej: farmacity, del pueblo...)"
                  localidad={selectedLocalidad}
                  especialidad={selectedEspecialidad}
                />
              </FormControl>
            )}
            {campo.tipo === "search_cartilla" && (
              <FormControl>
                <CartillaSearch
                  onSelect={(prestador) => {
                    const nombrePrestador =
                      typeof prestador === "string" ? prestador : prestador.nombre || prestador.nombre_completo
                    field.onChange(nombrePrestador)
                    setSelectedPrestador(nombrePrestador)
                    console.log("✅ Prestador seleccionado para filtro:", nombrePrestador)
                  }}
                  placeholder="Buscar prestador (ej: hospital, clínica, dr...)"
                  filters={{
                    localidad: selectedLocalidad,
                    especialidad: selectedEspecialidad,
                  }}
                />
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  // Función para organizar campos en el layout 2x2
  const organizarCamposEnLayout = (campos: any[]) => {
    const camposRegion = campos.filter((c) => c.tipo === "search_region")
    const camposLocalidad = campos.filter((c) => c.tipo === "search_localidad")
    const camposEspecialidad = campos.filter((c) => c.tipo === "search_especialidad")
    const camposPrestador = campos.filter((c) => c.tipo === "search_cartilla")
    const otrosCampos = campos.filter(
      (c) => !["search_region", "search_localidad", "search_especialidad", "search_cartilla"].includes(c.tipo),
    )

    return {
      columnaIzquierda: [...camposRegion, ...camposLocalidad],
      columnaDerecha: [...camposEspecialidad, ...camposPrestador],
      otrosCampos,
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Steps currentStep={currentStep} className="mb-8">
        <Step title="Reclamo" />
        <Step title="Confirmación" />
      </Steps>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Paso 0: Formulario completo del reclamo */}
          {currentStep === 0 && (
            <div className="space-y-8">
              {/* Sección: Categoría, Motivo y Submotivo */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {CATEGORIAS &&
                              CATEGORIAS.map((cat) => (
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

                  {categoriaSeleccionada && subcategorias && subcategorias.length > 0 && (
                    <FormField
                      control={form.control}
                      name="subcategoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                                <SelectValue placeholder="Seleccione un motivo" />
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
                </div>

                {/* Submotivo (solo si hay subsubcategorías) */}
                {subcategoriaSeleccionada && subsubcategorias && subsubcategorias.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="subsubcategoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Submotivo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-[#00613c]/20 focus:ring-[#00613c]/20">
                                <SelectValue placeholder="Seleccione un submotivo" />
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
                  </div>
                )}
              </div>

              {/* Disclaimer para RECETARIO NO DISPONIBLE */}
              {subcategoriaSeleccionada === "RECETARIO NO DISPONIBLE" && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">Información importante sobre recetarios</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Los recetarios en papel ya no se utilizan en Argentina por ley. Todas las prescripciones
                          médicas se realizan de forma digital. Si aún necesita realizar este reclamo, puede continuar
                          con el formulario.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección: Información específica del reclamo */}
              {camposAdicionales && camposAdicionales.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#00613c]">Información específica del reclamo</h3>

                  {(() => {
                    const { columnaIzquierda, columnaDerecha, otrosCampos } = organizarCamposEnLayout(camposAdicionales)

                    return (
                      <>
                        {/* Layout 2x2 para campos de búsqueda geográfica */}
                        {(columnaIzquierda.length > 0 || columnaDerecha.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">{columnaIzquierda.map((campo) => renderCampo(campo))}</div>
                            <div className="space-y-4">{columnaDerecha.map((campo) => renderCampo(campo))}</div>
                          </div>
                        )}

                        {/* Otros campos en layout normal */}
                        {otrosCampos.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {otrosCampos.map((campo) => renderCampo(campo))}
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Sección: Detalles adicionales */}
              {categoriaSeleccionada && subcategoriaSeleccionada && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#00613c]">Detalles adicionales (opcional)</h3>
                  <FormField
                    control={form.control}
                    name="detalle_adicional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describa su reclamo con más detalle si lo desea</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Escriba aquí cualquier información adicional sobre su reclamo..."
                            className="border-[#00613c]/20 focus:ring-[#00613c]/20 min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          )}

          {/* Paso 1: Confirmación */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Resumen del reclamo */}
              <div className="rounded-lg border border-[#00613c]/20 p-4">
                <h3 className="font-medium mb-4 text-[#00613c]">Resumen del reclamo</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Categoría:</div>
                  <div className="text-sm font-medium">{form.getValues("categoria")}</div>
                  <div className="text-sm text-muted-foreground">Motivo:</div>
                  <div className="text-sm font-medium">{form.getValues("subcategoria")}</div>

                  {form.getValues("subsubcategoria") && (
                    <>
                      <div className="text-sm text-muted-foreground">Submotivo:</div>
                      <div className="text-sm font-medium">{form.getValues("subsubcategoria")}</div>
                    </>
                  )}

                  {/* Mostrar campos específicos */}
                  {camposAdicionales &&
                    camposAdicionales.map((campo) => (
                      <React.Fragment key={campo.nombre}>
                        <div className="text-sm text-muted-foreground">{campo.label}:</div>
                        <div className="text-sm font-medium">{form.getValues(`detalle.${campo.nombre}`) || "-"}</div>
                      </React.Fragment>
                    ))}

                  {/* Mostrar detalle adicional si existe */}
                  {form.getValues("detalle_adicional") && (
                    <>
                      <div className="text-sm text-muted-foreground">Detalles adicionales:</div>
                      <div className="text-sm font-medium col-span-2 bg-gray-50 p-2 rounded">
                        {form.getValues("detalle_adicional")}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Datos de contacto */}
              {datosContacto && (
                <div className="rounded-lg border border-[#00613c]/20 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-[#00613c]">Datos de contacto</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={editarDatosContacto}
                      className="border-[#00613c] text-[#00613c] hover:bg-[#00613c] hover:text-white"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-muted-foreground">Teléfono:</div>
                    <div className="text-sm font-medium">{datosContacto.telefono_validado || "-"}</div>
                    <div className="text-sm text-muted-foreground">Email:</div>
                    <div className="text-sm font-medium">{datosContacto.email_validado || "-"}</div>
                    {datosContacto.fecha_validacion && (
                      <>
                        <div className="text-sm text-muted-foreground">Última actualización:</div>
                        <div className="text-sm font-medium">
                          {new Date(datosContacto.fecha_validacion).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {loadingDatos && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-center text-muted-foreground">Cargando datos de contacto...</div>
                </div>
              )}
            </div>
          )}
        </form>
      </Form>

      {/* Navegación */}
      <div className="flex justify-between mt-8">
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

        {currentStep === 1 && (
          <Button
            variant="outline"
            onClick={prevStep}
            className="border-[#00613c] text-[#00613c] hover:bg-[#00613c] hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}

        {currentStep === 0 ? (
          <Button
            onClick={nextStep}
            className="bg-[#00613c] hover:bg-[#00613c]/90"
            disabled={
              !categoriaSeleccionada ||
              !subcategoriaSeleccionada ||
              (subsubcategorias.length > 0 && !subsubcategoriaSeleccionada)
            }
          >
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
