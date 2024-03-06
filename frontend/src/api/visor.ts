import {authAxios} from "./useAxios.ts";

export const eval_embalse = async (id_1: number, id_2: number) => {
    const response = await authAxios.post("/visor/eval_embalse/", {id_1, id_2})
    return response;
}

export const eval_perfil = async (geojson : any, idsPerfil:number[], nombresPerfil:string[], demsPerfil:string[], proyecto:string, ukey: string, name: string, id: number) => {
    const response = await authAxios.post("/visor/eval_perfil/", {geojson, idsPerfil, nombresPerfil, demsPerfil, proyecto, ukey, name, id})
    return response;
}