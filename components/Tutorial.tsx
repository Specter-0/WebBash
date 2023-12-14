import React, { Fragment, useEffect, useState } from 'react'
import { motion, AnimatePresence, AnimateSharedLayout } from 'framer-motion'
import { v4 } from "uuid"

const currentStyle = {backgroundImage: 'linear-gradient(71deg, #0d1212, #3da077, #0d1212)'}
export const Step = ({ children = null, stage = null, placement = null }) => {
    return (            
        <motion.div className='group shadow-2xl rounded-xl flex items-center justify-center bg-gradient-to-b to-zinc-300 from-zinc-900'
            style={stage === placement ? currentStyle : { backgroundImage: 'linear-gradient(-20deg, #0d1212, rgba(210,210,210,1), #0d1212)', scale: 0.8 }}
            variants={stepVarients}
        >
            <div className={`group w-[99%] h-[98%] cardBg rounded-xl flex flex-wrap text-center items-center justify-center ${stage === placement ? 'text-xl' : 'text-[10px]'} py-5 px-1`}>
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
    "touch textfile.txt",
    "less textfile.txt",
    "nano textfile.txt",
    "less textfile.txt",
    "rm textfile.txt",
    "cd .admin",
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
                {stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            To run the tutorial, start it from its file. Locate the file using the <span className='font-bold'>'ls'</span> command.
                        </span>
                    </Step>
                }
                {stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            Now, as you view your current directory, you'll find a <span className='font-bold'>'tutorial.tut'</span> file.
                        </span>
                    </Step>
                }
                {stage < 2 &&
                    <Step stage={stage} placement={0}>
                        <span>
                            Run the file using the <span className='font-bold'>'start'</span> command, followed by the filename: <span className='font-bold'>'start tutorial.tut'</span>.
                        </span>
                    </Step>
                }
                {stage < 4 && stage > 2 &&
                    <Step stage={stage} placement={3}>
                        <span>
                            To learn about available commands, use the <span className='font-bold'>'help'</span> command. This displays all commands in the terminal.
                        </span>
                    </Step>
                }
                {stage < 5 && stage > 2 &&
                    <Step stage={stage} placement={4}>
                        <span>
                            If the terminal is cluttered, use the <span className='font-bold'>'clear'</span> command to visually clean it. Note that it doesn't affect previously run commands.
                        </span>
                    </Step>
                }
                {stage < 6 && stage > 2 &&
                    <Step stage={stage} placement={5}>
                        <span>
                            View the current directory with <span className='font-bold'>'ls'</span>. Files appear in white text, e.g., <span className='font-bold text-zinc-100'>file.txt</span>, and folders in blue text, e.g., <span className='font-bold text-[#23FEFF]'>Directory</span>.
                        </span>
                    </Step>
                }
                {stage < 7 && stage > 3 &&
                    <Step stage={stage} placement={6}>
                        <span>
                            Enter a directory using the <span className='font-bold'>'cd'</span> command. Try navigating to the <span className='text-[#23FEFF] font-bold'>'Documents'</span> folder. (Hint: Press <span className='font-bold'>'tab'</span> for suggestions.)
                        </span>
                    </Step>
                }
                {stage < 8 && stage > 4 &&
                    <Step stage={stage} placement={7}>
                        <span>
                            Use <span className='font-bold'>'pwd'</span> (Print Working Directory) to get the current directory.
                        </span>
                    </Step>
                }
                {stage < 9 && stage > 5 &&
                    <Step stage={stage} placement={8}>
                        <span>
                            To move out of a directory, use <span className='font-bold'>'cd ..'</span>. This command takes you one directory back, e.g., from <span className='font-bold'>'root/home/Documents'</span> to <span className='font-bold'>'root/home'</span>.
                        </span>
                    </Step>
                }
                {stage < 10 && stage > 6 &&
                    <Step stage={stage} placement={9}>
                        <span>
                            Create a new directory with <span className='font-bold'>'mkdir'</span>. Try <span className='font-bold'>'mkdir myFirstDir'</span>.
                        </span>
                    </Step>
                }
                {stage < 11 && stage > 7 &&
                    <Step stage={stage} placement={10}>
                        <span>
                            Enter the directory using <span className='font-bold'>'cd myFirstDir'</span>.
                        </span>
                    </Step>
                }
                {stage < 12 && stage > 8 &&
                    <Step stage={stage} placement={11}>
                        <span>
                            Great! You're inside your own directory. Now, create a file using <span className='font-bold'>'touch textfile.txt'</span>.
                        </span>
                    </Step>
                }
                {stage < 13 && stage > 9 &&
                    <Step stage={stage} placement={12}>
                        <span>
                            Attempt to read the file with <span className='font-bold'>'less textfile.txt'</span>. If it's empty, we'll add content using the nano text editor.
                        </span>
                    </Step>
                }
                {stage < 14 && stage > 10 &&
                    <Step stage={stage} placement={13}>
                        <span>
                            Open the nano editor with <span className='font-bold'>'nano textfile.txt'</span>.
                        </span>
                    </Step>
                }
                {stage < 15 && stage > 11 &&
                    <Step stage={stage} placement={14}>
                        <span>
                        Nano uses <span className='font-bold'>ctrl</span> shortcuts (denoted by <span className='font-bold'>^</span>). Use the help shortcut to learn more. Remember to save before exiting and then reread the file using <span className='font-bold'>'less textfile.txt'</span>.
                        </span>
                    </Step>
                }
                {stage < 16 && stage > 12 &&
                    <Step stage={stage} placement={15}>
                        <span>
                            You can remove the newly created file with the <span className='font-bold'>'rm textfile.txt'</span> command.
                        </span>
                    </Step>
                }
                {stage < 17 && stage > 13 &&
                    <Step stage={stage} placement={16}>
                        <span>
                            Congratulations on completing the tutorial! Explore other terminal features and try new commands using <span className='font-bold'>'help'</span>. Good Luck!
                        </span>
                    </Step>
                }

            </motion.div>
        </AnimatePresence>
    )
}

export default Tutorial
