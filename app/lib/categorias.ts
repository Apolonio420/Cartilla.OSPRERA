import type { SubcategoriasMap } from "./types"

export const CATEGORIAS = [
  "APP",
  "CONSULTA AFILIATORIA",
  "0800 Call Center",
  "DIABETES",
  "DISCAPACIDAD",
  "SALUD SEXUAL",
  "CRÓNICAS",
  "TRATAMIENTOS ESPECIALES",
  "PRÓTESIS",
  "RED DE FARMACIAS",
  "CARTILLA",
  "PLAN MATERNO INFANTIL",
]

export const SUBCATEGORIAS: SubcategoriasMap = {
  // ✅ APP - Nueva estructura con motivos y submotivos
  APP: [
    {
      label: "ACCESO",
      subsubcategorias: [
        {
          label: "APP CAÍDA",
          campos: [],
        },
        {
          label: "USUARIO Y CONTRASEÑA",
          campos: [],
        },
        {
          label: "CREACIÓN DE USUARIO",
          campos: [],
        },
      ],
    },
    {
      label: "SOLICITUDES PRESTACIONALES",
      subsubcategorias: [
        {
          label: "FALTA DE APROBACIÓN DE CONSULTAS MÉDICAS",
          campos: [
            {
              nombre: "numero_tramite",
              tipo: "text",
              label: "Número de Trámite",
              required: true,
            },
          ],
        },
        {
          label: "FALTANTE DE ESPECIALIDAD",
          campos: [
            {
              nombre: "region",
              tipo: "search_region",
              label: "Región",
              required: false,
            },
            {
              nombre: "localidad",
              tipo: "search_localidad",
              label: "Localidad",
              required: true,
            },
            {
              nombre: "especialidad",
              tipo: "search_especialidad",
              label: "Especialidad",
              required: true,
            },
          ],
        },
        {
          label: "PRESTADOR NO ENCONTRADO EN LA CARTILLA DE LA APP",
          campos: [
            {
              nombre: "region",
              tipo: "search_region",
              label: "Región",
              required: false,
            },
            {
              nombre: "localidad",
              tipo: "search_localidad",
              label: "Localidad",
              required: true,
            },
            {
              nombre: "especialidad",
              tipo: "search_especialidad",
              label: "Especialidad",
              required: true,
            },
            {
              nombre: "prestador",
              tipo: "search_cartilla",
              label: "Prestador",
              required: true,
            },
          ],
        },
      ],
    },
    {
      label: "PRÁCTICAS",
      subsubcategorias: [
        {
          label: "FALTA DE APROBACIÓN",
          campos: [
            {
              nombre: "numero_tramite",
              tipo: "text",
              label: "Número de Trámite",
              required: true,
            },
          ],
        },
        {
          label: "FALTANTE DE ESPECIALIDAD",
          campos: [
            {
              nombre: "region",
              tipo: "search_region",
              label: "Región",
              required: false,
            },
            {
              nombre: "localidad",
              tipo: "search_localidad",
              label: "Localidad",
              required: true,
            },
            {
              nombre: "especialidad",
              tipo: "search_especialidad",
              label: "Especialidad",
              required: true,
            },
          ],
        },
        {
          label: "PRESTADOR NO ENCONTRADO EN LA CARTILLA DE LA APP",
          campos: [
            {
              nombre: "region",
              tipo: "search_region",
              label: "Región",
              required: false,
            },
            {
              nombre: "localidad",
              tipo: "search_localidad",
              label: "Localidad",
              required: true,
            },
            {
              nombre: "especialidad",
              tipo: "search_especialidad",
              label: "Especialidad",
              required: true,
            },
            {
              nombre: "prestador",
              tipo: "search_cartilla",
              label: "Prestador",
              required: true,
            },
          ],
        },
      ],
    },
    {
      label: "RECETARIO NO DISPONIBLE",
      campos: [
        {
          nombre: "detalle",
          tipo: "text",
          label: "Detalle (opcional)",
          required: false,
        },
      ],
    },
    {
      label: "ESTADO DE SOLICITUD",
      subsubcategorias: [
        {
          label: "DEMORA DE APROBACIÓN",
          campos: [
            {
              nombre: "numero_solicitud",
              tipo: "text",
              label: "Número de Solicitud",
              required: true,
            },
          ],
        },
        {
          label: "RECHAZO",
          campos: [
            {
              nombre: "numero_solicitud",
              tipo: "text",
              label: "Número de Solicitud",
              required: true,
            },
          ],
        },
        {
          label: "DESCARGA BONO",
          campos: [
            {
              nombre: "numero_solicitud",
              tipo: "text",
              label: "Número de Solicitud",
              required: false,
            },
          ],
        },
        {
          label: "ERRÓNEAMENTE CONSUMIDO",
          campos: [
            {
              nombre: "numero_solicitud",
              tipo: "text",
              label: "Número de Solicitud",
              required: true,
            },
          ],
        },
      ],
    },
    {
      label: "CONDICIÓN AFILIATORIA",
      subsubcategorias: [
        {
          label: "REGISTRO ERRÓNEO",
          campos: [
            {
              nombre: "tipo_registro",
              tipo: "radio",
              label: "Tipo de Registro",
              opciones: ["Titular", "Grupo Familiar", "Ambos"],
              required: true,
            },
          ],
        },
        {
          label: "INFORMACIÓN NO DISPONIBLE",
          campos: [],
        },
      ],
    },
    {
      label: "CREDENCIAL DIGITAL",
      subsubcategorias: [
        {
          label: "NO PUEDO VERLA",
          campos: [],
        },
        {
          label: "NO PUEDO DESCARGARLA",
          campos: [],
        },
      ],
    },
  ],

  // ✅ RED DE FARMACIAS - Estructura de 2 niveles
  "RED DE FARMACIAS": [
    {
      label: "FALTANTE DE FARMACIAS",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
      ],
    },
    {
      label: "NO ENTREGA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
  ],

  // ✅ CARTILLA - Estructura de 2 niveles CON REGIÓN
  CARTILLA: [
    {
      label: "FALTANTE DE ESPECIALIDAD",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
      ],
    },
    {
      label: "NO ATIENDE",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "DEMORA EN LA ATENCIÓN",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "COBROS INDEBIDOS",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "ATENCIÓN DEFICIENTE",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
  ],

  // ✅ DIABETES - Estructura de 2 niveles
  DIABETES: [
    {
      label: "ERROR EN DESCUENTOS",
      campos: [],
    },
    {
      label: "NO ENTREGAN EN FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
    {
      label: "COBERTURA INSUFICIENTE",
      campos: [],
    },
    {
      label: "FALTA DE COBERTURA",
      campos: [],
    },
  ],

  // ✅ DISCAPACIDAD - Estructura de 2 niveles
  DISCAPACIDAD: [
    {
      label: "ERROR EN DESCUENTOS",
      campos: [],
    },
    {
      label: "NO ENTREGAN EN FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
    {
      label: "COBERTURA INSUFICIENTE",
      campos: [],
    },
    {
      label: "FALTA DE COBERTURA",
      campos: [],
    },
  ],

  // ✅ SALUD SEXUAL - Estructura de 2 niveles
  "SALUD SEXUAL": [
    {
      label: "ERROR EN DESCUENTOS",
      campos: [],
    },
    {
      label: "NO ENTREGAN EN FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
    {
      label: "COBERTURA INSUFICIENTE",
      campos: [],
    },
    {
      label: "FALTA DE COBERTURA",
      campos: [],
    },
  ],

  // ✅ CRÓNICAS - Estructura de 2 niveles
  CRÓNICAS: [
    {
      label: "ERROR EN DESCUENTOS",
      campos: [],
    },
    {
      label: "NO ENTREGAN EN FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
    {
      label: "COBERTURA INSUFICIENTE",
      campos: [],
    },
    {
      label: "FALTA DE COBERTURA",
      campos: [],
    },
  ],

  // ✅ TRATAMIENTOS ESPECIALES - Estructura de 2 niveles
  "TRATAMIENTOS ESPECIALES": [
    {
      label: "LEJANÍA A LA FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
      ],
    },
    {
      label: "ERROR EN EL ENVÍO",
      campos: [],
    },
    {
      label: "FALTANTE EN FARMACIA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "farmacia",
          tipo: "search_red_farmacias",
          label: "Farmacia de la Red",
          required: true,
        },
      ],
    },
    {
      label: "DEMORA EN APROBACIÓN DE SOLICITUD",
      campos: [],
    },
    {
      label: "NEGATIVA DE LA SOLICITUD",
      campos: [],
    },
  ],

  // ✅ PRÓTESIS - Estructura de 2 niveles
  PRÓTESIS: [
    {
      label: "DEMORA EN APROBACIÓN DE SOLICITUD",
      campos: [],
    },
    {
      label: "DEMORA EN LA PROVISIÓN",
      campos: [],
    },
    {
      label: "NEGATIVA DE LA SOLICITUD",
      campos: [],
    },
  ],

  // ✅ CONSULTA AFILIATORIA - Estructura de 2 niveles
  "CONSULTA AFILIATORIA": [
    {
      label: "REGISTRO ERRÓNEO",
      campos: [
        {
          nombre: "tipo_registro",
          tipo: "radio",
          label: "Tipo de Registro",
          opciones: ["Titular", "Grupo Familiar", "Ambos"],
          required: true,
        },
      ],
    },
    {
      label: "SIN INFORMACIÓN DISPONIBLE",
      campos: [],
    },
  ],

  // ✅ 0800 Call Center - Estructura de 2 niveles
  "0800 Call Center": [
    {
      label: "NO ATIENDEN",
      campos: [],
    },
    {
      label: "NO RESUELVE LA CONSULTA",
      campos: [],
    },
    {
      label: "MODALES INADECUADOS",
      campos: [],
    },
    {
      label: "DEMORA EN LA ATENCIÓN",
      campos: [],
    },
  ],

  // ✅ PLAN MATERNO INFANTIL - Estructura de 2 niveles
  "PLAN MATERNO INFANTIL": [
    {
      label: "FALTA DE COBERTURA",
      campos: [],
    },
    {
      label: "NO ATIENDE",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "DEMORA",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "COBERTURA INSUFICIENTE",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
      ],
    },
    {
      label: "COBROS INDEBIDOS",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
        {
          nombre: "prestador",
          tipo: "search_cartilla",
          label: "Prestador",
          required: true,
        },
      ],
    },
    {
      label: "FALTANTE DE ESPECIALIDAD",
      campos: [
        {
          nombre: "region",
          tipo: "search_region",
          label: "Región",
          required: false,
        },
        {
          nombre: "localidad",
          tipo: "search_localidad",
          label: "Localidad",
          required: true,
        },
        {
          nombre: "especialidad",
          tipo: "search_especialidad",
          label: "Especialidad",
          required: true,
        },
      ],
    },
  ],
}
