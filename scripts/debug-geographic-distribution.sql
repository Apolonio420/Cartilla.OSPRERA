-- Script para debuggear la distribución geográfica de datos

-- 1. Distribución de Base Geográfica por provincia
SELECT 
    "Provincia",
    COUNT(*) as cantidad_localidades,
    COUNT(DISTINCT "Localidad") as localidades_unicas
FROM "Base Geografica" 
WHERE "Latitud" IS NOT NULL 
    AND "Longitud" IS NOT NULL 
    AND "Latitud" != 0 
    AND "Longitud" != 0
GROUP BY "Provincia"
ORDER BY cantidad_localidades DESC;

-- 2. Distribución de Cartilla por provincia
SELECT 
    "PROVINCIA",
    COUNT(*) as cantidad_prestadores,
    COUNT(DISTINCT "LOCALIDAD") as localidades_unicas
FROM "Cartilla" 
WHERE "Latitud" IS NOT NULL 
    AND "Longitud" IS NOT NULL 
    AND "Latitud" != 0 
    AND "Longitud" != 0
GROUP BY "PROVINCIA"
ORDER BY cantidad_prestadores DESC;

-- 3. Verificar datos de Paraná específicamente
SELECT 
    "NOMBRE_COMPLETO",
    "ESPECIALIDAD",
    "LOCALIDAD",
    "PROVINCIA",
    "Latitud",
    "Longitud"
FROM "Cartilla" 
WHERE "LOCALIDAD" ILIKE '%paraná%' 
    OR "LOCALIDAD" ILIKE '%parana%'
ORDER BY "LOCALIDAD";

-- 4. Verificar Base Geográfica para Paraná
SELECT 
    "Localidad",
    "Partido",
    "Provincia",
    "Region Macro",
    "Region Micro",
    "Latitud",
    "Longitud"
FROM "Base Geografica" 
WHERE "Localidad" ILIKE '%paraná%' 
    OR "Localidad" ILIKE '%parana%'
ORDER BY "Localidad";

-- 5. Verificar si hay prestadores con coordenadas válidas fuera de Buenos Aires
SELECT 
    "PROVINCIA",
    COUNT(*) as prestadores_con_coordenadas
FROM "Cartilla" 
WHERE "Latitud" IS NOT NULL 
    AND "Longitud" IS NOT NULL 
    AND "Latitud" != 0 
    AND "Longitud" != 0
    AND "PROVINCIA" NOT ILIKE '%buenos aires%'
    AND "PROVINCIA" NOT ILIKE '%caba%'
    AND "PROVINCIA" NOT ILIKE '%capital federal%'
GROUP BY "PROVINCIA"
ORDER BY prestadores_con_coordenadas DESC;
