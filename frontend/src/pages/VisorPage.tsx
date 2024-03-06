import Visor from "../components/Visor";

import {useQuery} from "@tanstack/react-query";
import {get_embalses} from "../api/proyectos.ts";
import {get_perfiles, get_recursos, get_recursos_generados} from '../api/recursos.ts';


const VisorPage = () => {

    const embalses = useQuery({
        queryKey: ["embalses"],
        queryFn: get_embalses,
    });

    const recursos = useQuery({
        queryKey: ["recursos"],
        queryFn: get_recursos,
    });

    const recursos_gen = useQuery({
        queryKey: ["recursos_gen"],
        queryFn: get_recursos_generados,
    });

    const perfiles = useQuery({
        queryKey: ["perfiles"],
        queryFn: get_perfiles,
    });


    return (
        recursos.data !== undefined && embalses.data !== undefined && recursos_gen.data !== undefined && perfiles.data !== undefined ? (
            < Visor embalses={embalses.data} recursos={recursos.data} recursos_gen={recursos_gen.data} perfiles={perfiles.data}/>
        ) : (
            <></>
        )
    )
}

export default VisorPage