import { useEffect, useState } from "react"

const ScrollingText = ({ lyrics }) => {
    const [duration, setDuration] = useState(-60)
    
    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prevState => prevState + 1)
            if (duration == lyrics.length) {
                clearInterval(timer)
            }
        }, 135)

        return () => clearInterval(timer);
    }, [])

    return (
        <BarebonesOutput>
            <span className="text-2xl w-[30rem] leading-[3.5rem]">
                { duration > 0 &&
                    lyrics.slice(0, duration)
                }
            </span>
        </BarebonesOutput>
    )
}


const BarebonesOutput = ({ children, className = "" }) => {
    return (
        <span className={'relative pl-5 flex flex-wrap gap-x-20 gap-y-3 text-xl' + className}>
            {children}
        </span>
    )
}

export default ScrollingText