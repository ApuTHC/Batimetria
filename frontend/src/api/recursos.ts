import {authAxios} from "./useAxios";
import {Perfil} from "../Interfaces.ts";
// import {Embalse} from "../Interfaces.ts";

export const get_recursos = async () => {
    const response = await authAxios.get("/recursos/get/");
    return response.data;
}

export const get_recursos_generados = async () => {
    const response = await authAxios.get("/recursos/get_gen/");
    return response.data;
}

export const get_mediciones = async () => {
    const response = await authAxios.get("/recursos/get_mediciones/");
    return response.data;
}

export const get_perfiles = async () => {
    const response = await authAxios.get("/recursos/get_perfiles/");
    return response.data;
}

export const post_perfil = async (data: Perfil) => {
    const formData = new FormData();
    formData.append("id_embalse", data.id_embalse.toString());
    formData.append("nombre", data.nombre);
    formData.append("nombres", data.nombres);
    formData.append("proyectos", data.proyectos);
    formData.append("ukey", data.ukey);
    formData.append("img", data.img);
    formData.append("geojson", data.geojson);
    formData.append("dems", data.dems);
    formData.append("ids", data.ids);
    const response = await authAxios.post("/recursos/post/", formData)
    return response;
}

export const edit_perfil = async (data: Perfil) => {
    const formData = new FormData();
    formData.append("id_embalse", data.id_embalse.toString());
    formData.append("nombre", data.nombre);
    formData.append("nombres", JSON.stringify(data.nombres));
    formData.append("proyectos", data.proyectos);
    formData.append("ukey", data.ukey);
    formData.append("img", data.img);
    formData.append("geojson", JSON.stringify(data.geojson));
    formData.append("dems", JSON.stringify(data.dems));
    formData.append("ids", JSON.stringify(data.ids));

    console.log(formData)
    const response = await authAxios.put(`/recursos/edit/${data.id}/`, formData)
    return response;
}

export const delete_perfil = async (id: number) => {
    await authAxios.delete(`/recursos/delete/${id}/`)
}