import {z} from 'zod'

export const userSchema = z.object ({

    name: z.string().min(3, 
        {message: 'El nombre debe tener al menos 3 caracteres de largo'
    }).max(200, {message: 'El nombre debe tener como maximos 200 caracteres.'}),

    email: z.string().email({
        message: 'Por favor ingresar un correo valido.'
    }),

    weight: z.string().refine(weight => !isNaN(parseFloat(weight)),{
        message: "El peso debe ser un numero",
    }),

});