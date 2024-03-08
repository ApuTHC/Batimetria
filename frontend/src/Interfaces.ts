export interface Token {
    user_id: number;
    exp: number;
    is_staff: boolean;
    email: string;
    name: string;
    last_name: string;
    avatar: File | null;
}

export interface User {
    id?: number;
    avatar: File | null;
    email: string;
    name: string;
    last_name: string;
}

export interface Embalse {
    id: number;
    id_empresa: number;
    nombre: string;
    area: number;
    longitud: number;
    latitud: number;
}

export interface Recurso {
    id: number;
    id_empresa: number;
    id_embalse: number;
    id_tipo_recurso: number;
    id_metodo_adquisicion: number;
    id_proyecto: number;
    nombre: string;
    capa: string;
    ruta: string;
    env: string;
    nombre_file: string;
    descripcion: string;
}

export interface Perfil {
    id: number;
    id_empresa: number;
    id_embalse: number;
    geojson: string;
    nombre: string;
    nombres: string;
    proyectos: string;
    ukey: string;
    img: string;
    dems: string;
    ids: string;
}

export interface Medicion {
    id: number;
    id_empresa: number;
    id_embalse: number;
    tipo: string;
    fecha: string;
    max: number;
    min: number;
    json: string;
}