import {authAxios} from "./useAxios";
// import {Embalse} from "../Interfaces.ts";

export const get_embalses = async () => {
    const response = await authAxios.get("/proyectos/get/");
    return response.data;
}

