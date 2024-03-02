import {authAxios} from "./useAxios.ts";

export const eval_embalse = async (id_1: number, id_2: number) => {
    const response = await authAxios.post("/visor/eval_embalse/", {id_1, id_2})
    return response;
}