'use client'

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod' 
import { userSchema } from '../../validations/userSchema';


function Turnos () {
    const {register, handleSubmit, watch, formState: {errors}} = useForm ({
        resolver: zodResolver(userSchema)
    })
    return (
<div>

       <h1 className="text-gray-200 text-center text-4xl">Turnos</h1>

    <form onSubmit={handleSubmit(data => {console.log(data)})} className="flex flex-col p-12 gap-2">

        <label htmlFor="name" className="text-gray-200">Nombre</label>
        <input type="text" id="name" 
        {...register('name')}>


        </input>

        <label htmlFor="name" className="text-gray-200">Apellido</label>
        <input type="text" id="name" 
        {...register('surname')}></input>

        <label htmlFor="name" className="text-gray-200">Edad</label>
        <input type="text" id="name" 
        {...register('age')}
        ></input>

        <label htmlFor="name" className="text-gray-200">Email</label>
        <input type="email" id="email" 
        {...register("email")}
        ></input>

        <label htmlFor="weight " className="text-gray-200">Peso</label>
        <input type="number" id="weight" 
        {...register('weight')}
        ></input>

        <label htmlFor="date" className="text-gray-200">Fecha</label>
        <select name="date" id='date'>
            <option></option>

        </select>



        <button type="submit" className="text-gray-200 mt-5 border border-sky-400 mx-auto p-2 rounded">Enviar</button>
    
    </form>
 <div>
    {JSON.stringify(watch(), null, 2)}
 </div>
   
    </div>



    )
}

export default Turnos;