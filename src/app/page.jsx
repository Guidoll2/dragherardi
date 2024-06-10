import Image from "next/image";

function HomePage() {
  return (
    <section className="h-[calc(100vh-7rem)] flex flex-col justify-center items-center p-40">
      
      
      <Image className="-z-[10] opacity-70 w-5/12" width = {1000} height = {1000} alt='brainpicture' src='/cerebro2.png'/>
          
          <h1 className="text-white text-3xl">Bienvenidos - Welcome</h1>
        
        <p className="text-white mt-5 text-center">"Medicine is, for me, the committed and active care for health; work towards disease prevention; and during illness, in terms of health recovery."</p>
        
    </section>
  )
}

export default HomePage