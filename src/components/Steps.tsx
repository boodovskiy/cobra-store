'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

const STEPS = [
    {
        name: 'Step 1: Add image',
        descripion: 'Choose an image for your case',
        url: '/upload',
    },
    {
        name: 'Step 2: Customize design',
        descripion: 'Make the case yours',
        url: '/design',
    },
    {
        name: 'Step 3: Summary',
        descripion: 'Review your final design',
        url: '/preview',
    }
]

const Steps = () => {
    const pathname = usePathname()
  return (
    <ol className='rounded-md bg-white lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200'>
        {STEPS.map((step, i) => {
            const isCurrent = pathname.endsWith(step.url)
            const isCompleted = STEPS.slice(i+1).some((step) => pathname.endsWith(step.url))

            return <li></li>;
        })}
    </ol>
  )
}

export default Steps