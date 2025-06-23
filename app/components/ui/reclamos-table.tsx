"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Reclamo } from "@/app/lib/types"
import { reiterarReclamo } from "@/app/actions/reclamo-actions"
import { toast } from "@/components/ui/use-toast"
import { formatDistanceToNow, differenceInHours } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { RefreshCw } from "lucide-react"

interface ReclamosTableProps {
  reclamos: Reclamo[]
}

export function ReclamosTable({ reclamos }: ReclamosTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleReenviar = async (id: string) => {
    setLoadingId(id)
    try {
      const result = await reiterarReclamo(id)
      if (result.success) {
        toast({
          title: "Reclamo reenviado",
          description: "Su reclamo ha sido reenviado correctamente",
        })
        // Recargar la página para mostrar los cambios
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo reenviar el reclamo",
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
      setLoadingId(null)
    }
  }

  const canResend = (reclamo: Reclamo) => {
    // Si nunca se ha reiterado, usar la fecha de creación
    if (!reclamo.reiteraciones || reclamo.reiteraciones === 0) {
      const hoursElapsed = differenceInHours(new Date(), new Date(reclamo.created_at))
      return hoursElapsed >= 24
    }

    // Si ya se ha reiterado, usar la fecha de última actualización
    const hoursElapsed = differenceInHours(new Date(), new Date(reclamo.updated_at))
    return hoursElapsed >= 24
  }

  const getTimeUntilNextResend = (reclamo: Reclamo) => {
    // Si nunca se ha reiterado, usar la fecha de creación
    if (!reclamo.reiteraciones || reclamo.reiteraciones === 0) {
      const hoursElapsed = differenceInHours(new Date(), new Date(reclamo.created_at))
      return Math.max(0, 24 - hoursElapsed)
    }

    // Si ya se ha reiterado, usar la fecha de última actualización
    const hoursElapsed = differenceInHours(new Date(), new Date(reclamo.updated_at))
    return Math.max(0, 24 - hoursElapsed)
  }

  const getTooltipMessage = (reclamo: Reclamo) => {
    const hoursRemaining = getTimeUntilNextResend(reclamo)

    if (hoursRemaining === 0) {
      return "Puede reiterar ahora"
    }

    if (reclamo.reiteraciones && reclamo.reiteraciones > 0) {
      return `Disponible en ${hoursRemaining} horas (desde la última reiteración)`
    } else {
      return `Disponible en ${hoursRemaining} horas (desde la creación)`
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "nuevo":
        return <Badge className="bg-blue-500">Nuevo</Badge>
      case "en_proceso":
        return <Badge className="bg-[#ffd100] text-[#00613c]">En proceso</Badge>
      case "cerrado":
        return (
          <Badge variant="outline" className="border-[#00613c] text-[#00613c]">
            Cerrado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return <Badge variant="destructive">Alta</Badge>
      case "urgente":
        return <Badge className="bg-red-600">Urgente</Badge>
      case "baja":
        return <Badge variant="secondary">Baja</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-bold">Fecha</TableHead>
            <TableHead className="font-bold">Categoría</TableHead>
            <TableHead className="font-bold">Tipo</TableHead>
            <TableHead className="font-bold">Reiteraciones</TableHead>
            <TableHead className="font-bold">Reiterar Reclamo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reclamos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No hay reclamos registrados
              </TableCell>
            </TableRow>
          ) : (
            reclamos.map((reclamo) => (
              <TableRow key={reclamo.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  <div>
                    <div>
                      {formatDistanceToNow(new Date(reclamo.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </div>
                    {reclamo.reiteraciones && reclamo.reiteraciones > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Última reiteración:{" "}
                        {formatDistanceToNow(new Date(reclamo.updated_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{reclamo.categoria}</TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <div className="font-medium">{reclamo.subcategoria}</div>
                    {reclamo.subsubcategoria && (
                      <div className="text-sm text-muted-foreground">{reclamo.subsubcategoria}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {reclamo.reiteraciones && reclamo.reiteraciones > 0 ? (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      {reclamo.reiteraciones}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sin reiteraciones</span>
                  )}
                </TableCell>
                <TableCell>
                  {canResend(reclamo) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReenviar(reclamo.id)}
                      disabled={loadingId === reclamo.id || reclamo.estado === "cerrado"}
                      className="border-[#00613c] text-[#00613c] hover:bg-[#00613c] hover:text-white flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingId === reclamo.id ? "animate-spin" : ""}`} />
                      {loadingId === reclamo.id ? "Enviando..." : "Reiterar"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-gray-300 text-gray-400 cursor-not-allowed flex items-center gap-2"
                      title={getTooltipMessage(reclamo)}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reiterar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
