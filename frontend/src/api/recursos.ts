import {authAxios} from "./useAxios";
// import {Embalse} from "../Interfaces.ts";

export const get_recursos = async () => {
    const response = await authAxios.get("/recursos/get/");
    return response.data;
}

export const get_recursos_generados = async () => {
    const response = await authAxios.get("/recursos/get_gen/");
    return response.data;
}