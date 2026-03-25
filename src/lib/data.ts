import fs from 'node:fs';
import Papa from 'papaparse';

export interface Perfil {
    subArea: string;
    responsableArea: string;
    audiencia: string;
    telefonos: string[];
    redes: { nombre: string; url: string }[];
    logo: string;         // ruta relativa a assets/ — usada en build-time glob
    ubicacion: string;
    images: string[];     // rutas relativas a assets/ — usadas en build-time glob
}

export interface Dependencia {
    id: string;
    titulo: string;
    responsableGral: string;
    cargoGral: string;
    emailGral: string;
    video: string;
    perfiles: Perfil[];
}

export async function getOficinas(): Promise<Dependencia[]> {
    const csvFile = fs.readFileSync('./public/oficinas.csv', 'utf8');

    const { data: rawRows } = Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
    });

    const dependenciasMap = (rawRows as any[]).reduce(
        (acc: Record<string, Dependencia>, row: any) => {
            const id: string = row.id;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    titulo: row.titulo_unidad ?? '',
                    responsableGral: row.responsable_general ?? '',
                    cargoGral: row.responsable_cargo ?? '',
                    emailGral: row.emails ?? '',
                    video: row.video_url ?? '',
                    perfiles: [],
                };
            }

            acc[id].perfiles.push({
                subArea: row.sub_dependencia ?? '',
                responsableArea: row.responsable_subarea ?? '',
                audiencia: row.audiencia_label ?? '',
                telefonos: row.telefonos
                    ? row.telefonos.split(';').map((t: string) => t.trim()).filter(Boolean)
                    : [],
                redes: row.redes_sociales
                    ? row.redes_sociales
                        .split(';')
                        .map((item: string) => {
                            const [nombre, url] = item.split('|');
                            return { nombre: nombre?.trim() ?? '', url: url?.trim() ?? '' };
                        })
                        .filter((r: { url: string }) => r.url)
                    : [],
                // Estos campos son rutas relativas a assets/ (ej: "logos/orci.png")
                // El componente ImageLoader.astro se encarga de resolverlos en build-time
                logo: row.logo_url ?? '',
                ubicacion: row.ubicacion_texto ?? '',
                images: row.carrusel_url
                    ? row.carrusel_url.split(';').map((url: string) => url.trim()).filter(Boolean)
                    : [],
            });

            return acc;
        },
        {}
    );

    return Object.values(dependenciasMap);
}