import { useEffect, useState } from "react"
import { BarebonesOutput } from "./Terminal"

const ScrollingText = ({ lyrics }) => {
    const [duration, setDuration] = useState(-60)
    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prevState => prevState + 1)
            if (duration == lyrics.length) {
                clearInterval(timer)
            }
        }, 135)
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

export default ScrollingText