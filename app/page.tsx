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
    <main className="relative bg-zinc-900 w-screen h-screen flex flex-row">
      <div className='relative w-full lg:w-3/4 h-full flex flex-col'>
        <div className='w-full h-full p-7 hidden lg:flex'>
          <Terminal setPrevCommandOuter={setPrevCommand} greenCallback={() => router.push("/terminal")}/>
        </div>
      </div>
      <div className='relative h-full w-1/4 hidden lg:flex'>
        <div className='w-full h-full before:border-gl before:gradient-grayed after:border-gl after:gradient-grayed-flipped after:anim-blink'>
          <div className='w-full h-full p-2 flex flex-col items-center justify-start'>
            <Tutorial prevCommand={prevCommand}/>
          </div>
        </div>
      </div>
    </main>
  )
}