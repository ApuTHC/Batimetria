import Visor from "../components/Visor";

import {useQuery} from "@tanstack/react-query";
import {get_embalses} from "../api/proyectos.ts";
import {get_recursos} from '../api/recursos.ts';


const VisorPage = () => {

    const embalses = useQuery({
        queryKey: ["embalses"],
        queryFn: get_embalses,
    });

    const recursos = useQuery({
        queryKey: ["recursos"],
        queryFn: get_recursos,
    });


    return (
        recursos.data !== undefined && embalses.data !== undefined ? (
            < Visor embalses={embalses.data} recursos={recursos.data}/>
        ) : (
            <></>
        )
    )
}

export default VisorPage