"use client"
import Image from "next/image";
import Link from "next/link";

function portalPacientes () {

    return (
    <div className="flex flex-col items-center justify-center p-24">      
    <h1 className="text-gray-200 text-3xl text-center">Bienvenido/a, elija la opción deseada:</h1>
    <div id='containe-options' className="flex grid grid-cols-1 md:grid-cols-4 p-10 gap-4 items-center ">
        
    
    <button className="border-[1px] border-blue-400 text-gray-200 rounded p-4 ">
    <Link href="/turnos" className="flex flex-col items-center justify-center"><span className="mr-2 text-xl mb-5">Turnos</span>
         <Image src="/calendariosky400.png" width={1000} height={1000} alt="Calendaricon" className="w-1/4" />
        </Link>

    </button>
    <button className="border-[1px] border-blue-400 text-gray-200 rounded p-4 flex flex-col items-center justify-center">
        <span className="mr-2 text-xl mb-5">Historia Clínica</span>
        <Image src="/hclinicas.png" width={1000} height={1000} alt="hospitalicon" className="w-1/4" />
    </button>

    <button className="border-[1px] border-blue-400 text-gray-200 rounded p-4 flex flex-col items-center justify-center">
        <span className="mr-2 text-xl mb-5">Objetivos</span>
        <Image src="/objetivo.png" width={1000} height={1000} alt="trageticon" className="w-1/4" />
    </button>

    <button className="border-[1px] border-blue-400 text-gray-200 rounded p-4 flex flex-col items-center justify-center">
        <span className="mr-2 text-xl mb-5">Archivo</span>
        <Image src="/archivo.png" width={1000} height={1000} alt="fileicon" className="w-1/4" />
    </button>


    </div>
    
    
    
    </div>
    );
}


export default portalPacientes;