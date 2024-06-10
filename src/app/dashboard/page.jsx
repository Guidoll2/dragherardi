"use client"
import {signOut} from 'next-auth/react'
import Link from 'next/link'

function DashboardPage() {
  return (
    <section className="h-[calc(100vh-7rem)] flex justify-center items-center">
      <div className='flex grid grid-cols-1 p-5'>
        <h1 className="text-white text-3xl">Portal de pacientes</h1>
        <Link className="bg-white text-black px-4 py-2 rounded-md mt-4" href='/pacientes'        >
          Turnos y archivos personales
        </Link>
      </div>

      <div className='flex grid grid-cols-1'>
        <h1 className="text-white text-3xl">Portal de estudiantes</h1>
        <button className="bg-white text-black px-4 py-2 rounded-md mt-4"
          onClick={() => signOut()}
        >
          Logout
        </button>
      </div>

    </section>
  )
}
export default DashboardPage