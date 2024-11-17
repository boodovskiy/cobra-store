'use client'

import { AspectRatio } from '@/components/ui/aspect-ratio';
import React from 'react'
import NextImage from 'next/image'
import { cn } from '@/lib/utils';
import { Rnd } from 'react-rnd';
import HandleComponent from '@/components/HandleComponent';

interface DesignConfiguratorProps {
    configId: string 
    imageUrl: string
    imageDimensions: { width: number; height: number }
}

const DesignConfigurator = ( { configId, imageUrl, imageDimensions }: DesignConfiguratorProps) => {
  return (
    <div className='relative mt-20 grid grid-cols-1 lg:grid-cols-3 mb-20 pb-20'>
        <div className="relative h-[37.5rem] overflow-hidden col-span-2 w-full max-w-4xl flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <div className="relative w-60 bg-opacity-50 aspect-[896/1831] overflow-visible pointer-events-auto">
                <AspectRatio ratio={896 / 1831} className='pointer-events-none relative z-50 aspect-[896/1831] w-full'>
                    <NextImage fill alt='phone image' src="/phone-template.png" className='pointer-events-none z-50 select-none'/>
                </AspectRatio>
                <div className="absolute z-40 pointer-events-none inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px] shadow-[0_0_0_99999px_rgba(229,231,235,0.6)]" />
                <div className={cn(
                    "absolute inset-0 left-[3px] top-px right-[3px] bottom-px rounded-[32px]",
                    `bg-zinc-950`
                )} />

                <Rnd 
                    default={{
                        x: 150,
                        y: 205,
                        height: imageDimensions.height / 4,
                        width: imageDimensions.width / 4,
                    }}
                    className='absolute z-20 border-[3px] border-primary'
                    lockAspectRatio
                    resizeHandleComponent={{
                        bottomRight: <HandleComponent />,
                        bottomLeft: <HandleComponent />,
                        topLeft: <HandleComponent />,
                        topRight: <HandleComponent />,
                    }}
                >
                    <div className="relative w-full h-full">
                        <NextImage src={imageUrl} fill alt='your image' className='pointer-events-none'/>
                    </div>
                </Rnd>
            </div>
        </div>
    </div>
  )
}

export default DesignConfigurator