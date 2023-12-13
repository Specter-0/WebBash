import React, { Fragment, useEffect, useState } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import { v4 } from "uuid"

const currentStyle = {backgroundImage: 'linear-gradient(160deg, rgba(198,255,241,1) 17%, rgba(248,249,172,1) 35%, rgba(255,188,188,1) 55%, rgba(207,169,254,1) 77%, rgba(255,176,227,1) 93%)'}
export const Step = ({ children = null, stage = null, placement = null }) => {
    return (
        <motion.div className='group bg-gradient-to-b rounded-xl flex items-center justify-center to-zinc-300 from-zinc-900'
            style={stage === placement ? currentStyle : { backgroundImage: 'linear-gradient(149deg, rgba(210,210,210,1) 1%, rgba(27,27,27,1) 19%, rgba(131,130,130,1) 28%, rgba(187,187,187,1) 42%, rgba(0,0,0,1) 55%, rgba(255,255,255,1) 60%, rgba(57,55,55,1) 93%)' }}
            variants={stepVarients}
        >
            <div className={`group w-[99%] h-[98%] bg-zinc-900 rounded-xl flex flex-wrap text-center items-center justify-center ${stage === placement ? 'text-xl' : 'text-[10px]'} py-5 px-1`}>
                {children}
            </div>
        </motion.div>
    )
}

const stepVarients = {
    hidden: {
        y: 200,
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
    },
    exit: {
        y: 200,
        opacity: 0,
    }
}

export const containerVarients = {
    hidden: { 
        opacity: 0 
    },

    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.5
        }
    },

    exit: {
        opacity: 0,
        transition: {
            staggerChildren: 0.5
        }
    }
}

const steps = [
    "start tutorial.tut",
    "start tutorial.tut",
    "start tutorial.tut",
    "help",
    "clear",
    "ls",
    "cd Documents",
    "pwd",
    "cd ..",
    "mkdir myFirstDir",
    "cd myFirstDir",
    "touch me.txt",
    "nano me.txt",
    "less me.txt",
    "rm me.txt",
]


const Tutorial = ({ prevCommand }) => {
    const [stage, setStage] = useState(0)

    useEffect(() => {
        if (prevCommand === steps[stage]) {
            if (stage < 3) setStage(3)
            else setStage(prevV => prevV + 1)
        }
    }, [prevCommand])

    return (
        <AnimatePresence mode='wait'>
            <motion.div className='w-full h-full flex flex-col items-center justify-center p-5 gap-10'
                variants={containerVarients}
                initial={'hidden'}
                animate={'visible'}
                exit={'exit'}
            >
                { stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            To run the tutorial you need to start it form its file, aka you need to find it, To find the file, use the <span className='font-bold'> 'ls' </span> command
                        </span>
                    </Step>
                }
                { stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            Now you are viewing your current directory, you will see a <span className='font-bold'> 'tutorial.tut' </span> file
                        </span>
                    </Step>
                }
                { stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            To run this file use the <span className='font-bold'> 'start' </span> command, followed by the filename of the tutorial, like this: <span className='font-bold'> 'start tutorial.tut' </span>
                        </span>
                    </Step>
                }
                { stage < 4 && stage > 2 &&
                    <Step stage={stage} placement={3}>
                        <span>
                            To learn about the commands and how they work, use the <span className='font-bold'> 'help' </span> command, this will show you all of the commands available in this terminal
                        </span>
                    </Step>
                }
                { stage < 5 && stage > 2 &&
                    <Step stage={stage} placement={4}>
                        <span>
                            Now, the terminal is very packed with text, to get back to an empty terminal use the <span className='font-bold'> 'clear' </span> command, this commands cleans the terminal but only visualy, it does nothing to commands previusly run
                        </span>
                    </Step>
                }
                {  stage < 6 && stage > 2 &&
                    <Step stage={stage} placement={5}>
                        <span>
                            Now you can view your current directory with the <span className='font-bold'> 'ls' </span>  command, you are currently in the home directory, files are denoted by white text <span className='font-bold text-zinc-100'> file.txt </span> while folders are by blue text <span className='font-bold text-[#23FEFF]'> Directory </span>
                        </span>
                    </Step>
                }
                { stage < 7 && stage > 3 &&
                    <Step stage={stage} placement={6}>
                        <span>
                            To enter a directory use the <span className='font-bold'> 'cd' </span> command, this command takes one argument for witch directory to navigate to, try to navigate to the <span className='text-[#23FEFF] font-bold'> 'Documents' </span> folder
                        </span>
                    </Step>
                }
                { stage < 8 && stage > 4 &&
                    <Step stage={stage} placement={7}>
                        <span>
                            You can use the command <span className='font-bold'> 'pwd' </span> short for 'Print working directory' to get your current directory, try it!
                        </span>
                    </Step>
                }
                { stage < 9 && stage > 5 &&
                    <Step stage={stage} placement={8}>
                        <span>
                            Now to navigate out of the directory, use the <span className='font-bold'> 'cd' </span> command but the argument of 2 dots <span className='font-bold'> '..' </span> this will move you one directory back. So if you are in 'root/home/Documents', you will be moved to 'root/home' 
                        </span>
                    </Step>
                }
                { stage < 10 && stage > 6 &&
                    <Step stage={stage} placement={9}>
                        use the 'mkdir' command to make a direcotry called 'myFirstDir'
                    </Step>
                }
                { stage < 11 && stage > 7 &&
                    <Step stage={stage} placement={10}>
                        go into the directory using cd
                    </Step>
                }
                {  stage < 12 && stage > 8 &&
                    <Step stage={stage} placement={11}>
                        create a file inside this directory named me.txt with the command 'touch' [filename]
                    </Step>
                }
                { stage < 13 && stage > 9 &&
                    <Step stage={stage} placement={12}>
                        to edit the file, use the nano text editor with the 'nano' [filename] 
                    </Step>
                }
                { stage < 14 && stage > 10 &&
                    <Step stage={stage} placement={13}>
                        To learn the nano text editor, use the shortcut ctrl + h,
                        then after exiting use the 'less' command with 'me.txt' as an argument
                    </Step>
                }
                { stage < 16 && stage > 11 &&
                    <Step stage={stage} placement={14}>
                        To delete a file use the 'rm' command with a file you created
                    </Step>
                }
            </motion.div>
        </AnimatePresence>
    )
}

export default Tutorial
