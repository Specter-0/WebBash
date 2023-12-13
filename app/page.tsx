"use client"
import Image from 'next/image'
import { AnimatePresence, motion, useAnimate, stagger } from "framer-motion"
import { useEffect, useState } from 'react'
import Terminal, { FakeTerminal } from '@/components/Terminal'
import { useRouter } from 'next/navigation'
import Tutorial, { Step, containerVarients } from '@/components/Tutorial'

export default function Home() {
  const router = useRouter()
  const [isLarge, setIsLarge] = useState(false)

  const [prevCommand, setPrevCommand] = useState("")

  return (
    <main className="">
      <section className='relative bg-zinc-900 w-full h-[1000px] pt-10 flex flex-row before:border-gb before:gradient-grayed after:border-gb after:gradient-grayed-flipped after:anim-blink'>
        <div className='relative w-full lg:w-3/4 h-full flex flex-col'>
          <div className='relative h-1/6 px-10 w-full flex items-center justify-center before:border-gb before:gradient-right-grayed after:border-gb after:gradient-right-grayed-flipped after:anim-blink'>
            <span className='text-center text-lg hidden lg:flex'>
              En Bash-terminal er et tekstbasert verktøy på datamaskinen som lar deg gi kommandoer ved å skrive. Du kan navigere i filsystemet, utføre oppgaver og kjøre programmer direkte fra terminalen. Bash er vanlig i Unix-lignende systemer som Linux.
            </span>
            <span className='text-center text-lg lg:hidden'>
              Bash-terminalen lar deg gi tekstbaserte kommandoer for oppgaver som filbehandling og programkjøring på Linux og lignende systemer.
            </span>
          </div>
          <div className='w-full h-5/6 p-5 hidden lg:flex'>
            <Terminal setPrevCommandOuter={setPrevCommand} greenCallback={() => router.push("/terminal")}/>
          </div>
          <div className='w-full h-5/6 p-5 flex justify-center lg:hidden'>
            <FakeTerminal/>
          </div>
        </div>
        <div className='relative h-full w-1/4 hidden lg:flex'>
          <div className='w-full h-full before:border-gl before:gradient-tail-grayed after:border-gl after:gradient-tail-grayed-flipped after:anim-blink'>
            <div className='relative h-[28%] w-full flex items-center justify-center p-5'>
              <span className='text-2xl text-center before:border-gb before:gradient-grayed after:border-gb after:gradient-grayed-flipped after:anim-blink'>
                følg stegnede under for å starte tutroialen
              </span>
            </div>
            <div className='w-full h-[72%] p-2 flex flex-col items-center justify-evenly'>
              <Tutorial prevCommand={prevCommand}/>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}