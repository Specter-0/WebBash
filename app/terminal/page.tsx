"use client"
import Terminal from '@/components/Terminal'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const page = () => {
    const router = useRouter()
    return (
        <div className='bg-zinc-900 w-screen h-screen flex items-center justify-center px-40 py-10'>
            <Terminal redCallback={() => router.push("/")} />
        </div>
    )
}

export default page