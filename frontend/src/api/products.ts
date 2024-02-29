import {authAxios, axi} from "./useAxios";
import {Product} from "../Interfaces.ts";



export const create_review = async (description: string, rating: number, productId: number) => {
    await authAxios.post(`/products/review/${productId}/`, {description, rating})
};

export const cate_api = async (category: string) => {
    const response = await authAxios.get(`/products/cate/${category}/`);
    return response.data;
}

export const search_prod = async (query: string) => {
    const response = await authAxios.get(`/products/search/?query=${query}`);
    return response.data;
}

export const get_solo = async (slug: string) => {
    const response = await authAxios.get(`/products/get/${slug}/`);
    return response.data;
}

export const get_solo_prod = async (id: number) => {
    const response = await authAxios.get(`/products/get/admin/${id}/`);
    return response.data;
}

export const delete_product = async (id: number) => {
    await authAxios.delete(`/products/delete/${id}/`)
}
export const post_product = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("count_in_stock", data.count_in_stock.toString());
    formData.append("category", data.category);
    formData.append("price", data.price.toString());
    if (data.image) {
        formData.append("image", data.image);
    }
    await authAxios.post("/products/post/", formData)

}

export const edit_product = async (data: Product) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("count_in_stock", data.count_in_stock.toString());
    formData.append("category", data.category);
    formData.append("price", data.price.toString());
    if (data.image) {
        formData.append("image", data.image);
    }
    console.log(formData)
    await authAxios.put(`/products/edit/${data.id}/`, formData)

}


export const get_products = async ({pageParam = 1}) => {
    const response = await axi.get(`/products/?page=${pageParam}&pages=9`);
    return response.data;
}