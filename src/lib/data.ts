import fs from 'node:fs';
import Papa from 'papaparse';

export async function getOficinas() {
    // 1. Leer el archivo desde la carpeta public
    const csvFile = fs.readFileSync('./public/oficinas.csv', 'utf8');

    // 2. Parsear el CSV a objetos
    const { data: rawRows } = Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
    });

    // 3. Agrupar por ID y aplicar herencia de campos de cabecera
    const dependenciasMap = rawRows.reduce((acc: any, row: any) => {
        const id = row.id;

        if (!acc[id]) {
            // Si es la primera fila de este ID, extraemos los datos globales (Cabecera)
            acc[id] = {
                id: id,
                titulo: row.titulo_unidad,
                responsableGral: row.responsable_general,
                cargoGral: row.responsable_cargo,
                emailGral: row.emails, // El primer email se guarda como el principal
                video: row.video_url,
                perfiles: []
            };
        }

        // 4. Procesar los datos específicos de la fila (Sub-dependencia / Audiencia)
        acc[id].perfiles.push({
            subArea: row.sub_dependencia,
            responsableArea: row.responsable_subarea,
            audiencia: row.audiencia_label,
            // Transformar teléfonos en lista
            telefonos: row.telefonos ? row.telefonos.split(';').map((t: string) => t.trim()) : [],
            // Transformar redes sociales (nombre|url) en objetos
            redes: row.redes_sociales ? row.redes_sociales.split(';').map((item: string) => {
                const [nombre, url] = item.split('|');
                return { nombre: nombre?.trim(), url: url?.trim() };
            }).filter((r: any) => r.url) : [],
            logo: row.logo_url,
            ubicacion: row.ubicacion_texto,
            images: row.carrusel_url ? row.carrusel_url.split(';').map((url: string) => url.trim()) : []
        });

        return acc;
    }, {});

    // Convertimos el mapa de vuelta a una lista de objetos
    return Object.values(dependenciasMap as Record<string, any>);
}