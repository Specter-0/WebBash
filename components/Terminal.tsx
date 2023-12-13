import Image from 'next/image'
import React, { Fragment, MouseEvent, TextareaHTMLAttributes, useEffect, useReducer, useState } from 'react'
import content_import from "./Content.json"
import { v4 } from "uuid"
import ScrollingText from './ScrollingText';

let content = content_import

function keyInObject(obj : object, keys : Array<string>) : boolean {
    if (keys.some(key => {
        if (obj.hasOwnProperty(key)) {
          return true
        }
    })) return true
      
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
            if (keyInObject(obj[prop], keys)) {
                return true;
            }
        }
    }
  
    return false;
}

function textareaCandl(textarea : HTMLTextAreaElement) {
    return {lines: textarea.value.split("\n"), chars:  textarea.value.length, lineLengths: textarea.value.split("\n").map(item => item.length)}
}

function caretToTop(textarea : HTMLTextAreaElement) {
    const candl = textareaCandl(textarea)
    let topIndex = Math.floor(textarea.scrollTop / textarea.offsetHeight) * 45
    const index = candl.lineLengths.slice(0, topIndex == 0 ? 30 : topIndex).reduce((acc, curr) => acc + curr, 0)
    textarea.setSelectionRange(index, index)
}

interface askInter {
    question: string,
    callback: Function
}

const Terminal = ({ setPrevCommandOuter = null,  redCallback = null, yellowCallback = null, greenCallback = null }) => {
    const [command, setCommand] = useState("")
    const [prevCommands, setPrevCommands] = useState([])

    const [ask, setAsk] = useState<askInter>({question: null, callback: null})

    const [prevInputs, setPrevInputs] = useState([])
    const [prevInputsIndex, setPrevInputsIndex] = useState(0)

    const [currentDir, setCurrentDir] = useState("root/home")
    const [user, setUser] = useState('user')

    const [suggestions, setSuggestions] = useState([])
    const [suggestionsItems, setSuggestionsItems] = useState([])
    const [suggesting, setSuggesting] = useState(false)
    const [suggested, setSuggested] = useState(-1)
    const [suggestionInsert, setSuggestionInsert] = useState<string>("")
    const [suggestionBase, setSuggestionBase] = useState<string>("")

    const [textEdit, setTextEdit] = useState(false)
    const [nanoText, setNanoText] = useState("")
    const [nanoReferance, setNanoReferance] = useState("")
    const [nanoHelp, setNanoHelp] = useState(false)
    const [nanoHelpPage, setNanoHelpPage] = useState(0)
    const [nanoPromptSave, setNanoPromptSave] = useState(false)

    useEffect(() => {
        if (window) {
            if (window.localStorage.getItem('content') !== null) {
                content = JSON.parse(window.localStorage.getItem('content'))
            }
            if (window.localStorage.getItem('userClass') !== null) {
                setUser(window.localStorage.getItem('userClass'))
            }
        }
    }, [])
    

    function appendValue(obj : object, [prop, ...path], [key, value], owner : null | string = null) : void {
        console.log(obj, prop, path)
        if (!prop) {
            console.log('saving')
            obj[0][key] = [value, owner != null ? { owner: owner, creationTime: "Date" } : obj[0][prop][0][key][1]]
        } else {
            if (prop === "root") {
                appendValue(obj, path as any, [key, value], owner)
                return
            }
            appendValue(obj[0][prop], path as any, [key, value], owner)
        }
    }

    function syntaxCheck(command : string, baseCommand : string, args : Array<string>, minArgs : number = 1, maxArgs : number = 1, noDirectory : boolean = false) {
        if (noDirectory && args.some(item => typeof getItem(item) == "object")) {
            return (
                <BasicOutput>
                    {baseCommand}: can't read directories
                </BasicOutput>
            )
        }
        
        if (minArgs == 0 && args.length == minArgs) {
            return null
        }
        if (args.length < minArgs) {
            return (
                <BasicOutput>
                    {baseCommand}: Missing argument
                </BasicOutput>
            )
        } 
        else if (args.length > maxArgs) {
            return (
                <BasicOutput>
                    {baseCommand}: To many arguments
                </BasicOutput>
            )
        } 
        else if (!keyInObject(content, args)) {
            return (
                <BasicOutput>
                    {baseCommand}: {args}: No such file or directory
                </BasicOutput>
            )
        } else {
            return null
        }
    }    

    function del(obj : object, [prop, ...path]) {
        if (!path.length) {
            delete obj[prop]
        } else {
            del(obj[prop][0], path as any)
        }
    }

    function getSuggestionItems() : Array<string> {
        const firstArg = getArgs()[0]
        const items = Object.keys(getCurrentDir()).map((item, index) => {
            if (getArgs().length == 0 || (!suggesting ? item.slice(0, firstArg.length) == firstArg : (!suggestionBase || item.slice(0, suggestionBase.length) === suggestionBase))) {
                if (item[0] != ".") return item
                else return undefined
            }
        }).filter(item => typeof item ==='string');
        return items
    }

    function evalSuggestions() : Array<string> {
        const items = getSuggestionItems()
        const suggestionsArray = items.map((item, index) => {
            return (
                <span className={`${typeof getItem(item) == "object" && 'text-[#23FEFF]'}`}
                    key={v4()}
                >
                    {item[0] != '.' && suggested == index ? <h1 className='underline-offset-4 underline'> {item} </h1> : item}
                </span>
            )
        })
        setSuggestions(suggestionsArray)
        if (suggestionInsert !== getArgs()[0]) {
            setSuggestionsItems(items)
            setSuggested(0)
            setSuggestionBase(getArgs()[0])
        }
        return items
    }

    function getMetadata(obj : object, [prop, ...path]) : string {
        if (!path.length) {
            return obj[prop][1]
        } else {
            return getMetadata(obj[prop][0], path as any)
        }
    }

    function getFlags() : Array<string> {
        const matched = command.match(/-\w+\b/g)
        return matched ? matched.map(match => match.trim()) : []
    }

    function getArgs() : Array<string> {
        const matched = command.match(/(?<=\s)\S+/g)
        return matched ? matched[0].trim().split(" ") : [] 
    }

    function dirPath(plussPath = "") {
        return `${currentDir}${plussPath.length != 0 ? '/' + plussPath : ""}`
    }

    function getCurrentDir(plussPath = "") {
        if (plussPath[0] == "/") {
            return `root${plussPath.length > 1 ? plussPath : ""}`.split("/").reduce((obj, key) => {
                return obj && obj[key][0]
            }, content)
        }

        return `${currentDir}${plussPath.length != 0 ? '/' + plussPath : ""}`.split("/").reduce((obj, key) => {
            console.log(obj)
            return obj && obj[key] ? obj[key][0] : undefined;
        }, content)
    }   

    function getItem(path : string) : string {
        if (path[0] == "/") {
            return path.replace("/", "").split("/").reduce((obj, key) => {
                return obj && obj[key][0]
            }, content)
        }

        return `${currentDir}/${path}`.split("/").reduce((obj, key) => {
            return obj && obj[key] ? obj[key][0] : undefined;
        }, content);
    }

    function flag(opFlags : object, matchFlags : Array<string>) : Array<any> {
        const matches : Array<any> = []
        for (const key in opFlags) {
            if (matchFlags.includes(key) && key !== "default") {
                matches.push(opFlags[key])
            }
        }
        if (matches.length != 0) return matches
        else return opFlags["default"];
    }

    function matchFlag(flags : Array<string>, matcher : string) {
        try {
            return flags.some(item => item.includes(matcher))
        }
        catch {
            return false
        }
    }

    async function runCommand(formData : FormData) {
        setPrevCommandOuter && setPrevCommandOuter(command)
        setPrevInputsIndex(0)
        setCommand("")
        setSuggestions([])
        setSuggested(-1)
        setSuggesting(false)

        if (Object.values(ask).every(item => item != null)) {
            const response = ask.callback(formData.get("askInput"))
            setPrevCommands(prevState => [...prevState, ["", response]])

            setAsk({ question: null, callback: null })
            return
        }

        setPrevInputs(prevState => [command, ...prevState])

        const win = document.getElementById("terminal-window")
        win.scrollTop == win.scrollHeight 


        const ranCommand = (
            <span className="relative before:absolute before:content-['>_'] before:top-0 before:-left-2 before:text-xl before:ml-2 pl-5"
                key={v4()}
            >
                <label className='outline-none w-full text-xl'>
                    { formData.get("command") as string }
                </label>
            </span>
        )

        let output = null
        if (command.split(" ")[1] == "--help") {
            output = (
                <BasicOutput>
                    you asked for help
                </BasicOutput>
            )
        } else {
        switch (command.split(" ")[0]) {
            case "ls":
                const flags = flag({
                    "-a": "a",
                    "-l": 'l',
                    "-la": 'la',
                    "default": ''
                }, getFlags())
                output = syntaxCheck(command, "ls", getArgs(), 0)
                if (!output) {
                    if (typeof getCurrentDir(getArgs()[0]) != "object") {
                        output = (
                            <BasicOutput>
                                {getArgs()[0]}
                            </BasicOutput>
                        )
                    } else {
                        output = (
                            <BasicOutput className='outline-none w-[40rem]'>
                                { matchFlag(flags, "l") ? 
                                Object.keys(getCurrentDir(getArgs()[0])).map(item => {
                                    const metadata = getMetadata(content, dirPath(item).split("/") as any) 
                                    if (matchFlag(flags, "a") || item[0] != '.') {
                                        return (
                                            <span className={`flex flex-row gap-5 ${typeof getItem(item) == "object" && 'text-[#23FEFF]'}`}
                                                key={v4()}
                                            >   
                                                <span>
                                                    { v4().slice(0, 10) }
                                                </span>
                                                <span>
                                                    { metadata['owner'] }
                                                </span>
                                                <span>
                                                    { metadata['creationTime'] }
                                                </span>
                                                <span>
                                                    { item }
                                                </span>
                                            </span>
                                        )
                                    }
                                })
                                :
                                Object.keys(getCurrentDir(getArgs()[0])).map(item => {
                                    console.log(item)
                                    if (matchFlag(flags, "a") || item[0] != '.') {
                                        return (
                                            <span className={`${typeof getItem(item) == "object" && 'text-[#23FEFF]'}`}
                                                key={v4()}
                                            >
                                                { item }
                                            </span>
                                        )
                                    }
                                })
                                }
                            </BasicOutput>
                        )
                    }
                } 
                break
            
            case "less":
                output = syntaxCheck(command, "less", getArgs(), 1, 1, true)
                if (!output) {
                    if (getItem(getArgs()[0]).length > 1000) {
                        setTextEdit(prevState => !prevState)
                        setNanoText(getItem(getArgs()[0]))
                    } else {
                        output = (
                            <BasicOutput>
                                { 
                                    getItem(getArgs()[0])
                                }
                            </BasicOutput>
                        )
                    }
                } 
                break

            case "show": 
                output = syntaxCheck(command, "show", getArgs())
                if (!output) {
                    output = (
                        <BasicOutput>
                            { 
                                ["jpeg", "png", ".jpg"].some(str => {
                                    console.log(getArgs())
                                    return getArgs()[0].split(".")[1] == str
                                })

                                ?
                                <Image src={getItem(getArgs()[0])} alt='image sould be here' width={500} height={500} className='rounded-xl shadow-2xl'/>
                                
                                :
                                getArgs()[0].includes("mp4")
                                
                                ?
                                <iframe width="750" height="500" className='rounded-xl shadow-2xl'
                                    src={getItem(getArgs()[0])}>
                                </iframe>

                                :
                                "Show: Invalid file type "
                            }
                        </BasicOutput>
                    )
                }
            
            case "cd":
                if (getArgs()[0] == undefined) {
                    setCurrentDir("root/home")
                    break
                }
                else if (getArgs()[0][0] == "/") {
                    setCurrentDir("root" + command.split("/")[1])
                    break
                }
                else {
                    if (getArgs()[0] == ".." && currentDir != "root") setCurrentDir(currentDir.split("/").slice(0, -1).join("/"))
                    else if (keyInObject(content, getArgs())) setCurrentDir(`${currentDir}/${getArgs()[0]}`)
                    else {
                        output = (
                            <BasicOutput>
                                cd: no such file or directory: {getArgs()[0]}
                            </BasicOutput>
                        )
                    }
                    break
                }
            
            case "open":
                output = syntaxCheck(command, "open", getArgs())
                if (!output && ["app"].includes(command.split(".")[1])) {
                    if (window) {
                        window.open(getItem(getArgs()[0]), '_blank').focus()
                    } else {
                        output = (
                            <BasicOutput>
                                error: window does not exits
                            </BasicOutput>
                        )
                    }
                } 
                else if (!["app"].includes(command.split(".")[1])) {
                    output = (
                        <BasicOutput>
                            open: file must be of type .app
                        </BasicOutput>
                    )
                }
                break
            
            case "wc":
                output = syntaxCheck(command, "wc", getArgs())
                if (!output && getArgs()[0] != null) {
                    const text = getItem(getArgs()[0])
                    const outputArray = flag({
                        "-c": [new Blob([text]).size],
                        "-m": [text.length],
                        "-l": [text.split(/\r\n|\r|\n/).length],
                        "-w": [text.split(" ").length],
                        "default": [text.split(/\r\n|\r|\n/).length, text.length, new Blob([text]).size]
                    }, getFlags()) as Array<number>

                    output = (
                        <BasicOutput>
                            {
                                outputArray.map(item => {
                                    return (
                                        <span
                                            key={v4()}
                                        >
                                            {item}
                                        </span>
                                    )
                                })
                            }
                        </BasicOutput>
                    )
                }
                break
            
            case "ipconfig":
                output = (
                    <BasicOutput>
                        {
                            fetch("https://api.ipify.org/")
                                .then(ipResponse => ipResponse.text())
                                .then(ip => {
                                    return ip
                                })
                        }
                    </BasicOutput>
                )
                break

            case "help":
                output = (
                    <BasicOutput className=''>
                        <span className='flex flex-col gap-2'> 
                            <span>
                                <Cmnd>ls</Cmnd>: Used to read what is in your current directory 
                            </span>
                            <span className='pl-10'>
                                <Args/>: Run empty will return all items in current directory 
                                <br /> can pass a directory path to see inside it
                            </span>
                            <span className='pl-10'>
                                <Flags/>: -a: Show files hidden with a '.' 
                                <br /> -l: Longform fileformat
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>cd</Cmnd>: Used to go into a directory 
                            </span>
                            <span className='pl-10'>
                                <Args/>: Directory too enter
                                <br /> Use '..' to go back to the previus directory
                                <br /> Use '/' to navigate from root
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>less</Cmnd>: Used to see what is inside of a file
                            </span>
                            <span className='pl-10'>
                                <Args/>: File to read
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>show</Cmnd>: Used to read an image file
                            </span>
                            <span className='pl-10'>
                                <Args/>: Image file to be shown
                            </span>
                            <span className='pl-10'>
                                <Warn/>: This command is not a real bash command and is exclusive for this example
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>open</Cmnd>: Used to open .app files
                            </span>
                            <span className='pl-10'>
                                <Args/>: File to open
                            </span>
                            <span className='pl-10'>
                                <Warn/>: This command is not a real bash command and is exclusive for this example
                            </span>
                        </span>
                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>wc</Cmnd>: Reads lines, charcters and bytes in a file
                            </span>
                            <span className='pl-10'>
                                <Args/>: File to read
                            </span>
                            <span className='pl-10'>
                                <Flags/>: -w: Count words
                                <br /> -c: Count bytes
                                <br /> -m: Count characters
                                <br /> -l: Count lines
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>ipconfig</Cmnd>: Gets user ip 
                            </span>
                            <span className='pl-10'>
                                <Args/>: None
                            </span>
                            <span className='pl-10'>
                                <Warn/>: This command is simplefied, the real command would be closer to: 
                                <br /> ' ifconfig | grep "inet " '
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>whoami</Cmnd>: Returns current user
                            </span>
                            <span className='pl-10'>
                                <Args/>: None
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>pwd</Cmnd>: pwd = 'print working directory', returns working directory
                            </span>
                            <span className='pl-10'>
                                <Args/>: None
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>rm</Cmnd>: Removes a file
                            </span>
                            <span className='pl-10'>
                                <Args/>: File or directory to remove
                            </span>
                            <span className='pl-10'>
                                <Flags/>: -TBD!
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>sudo</Cmnd>: Used to set admin privileges, requires the admin password (mystery?)
                            </span>
                            <span className='pl-10'>
                                <Args/>: None
                            </span>
                            <span className='pl-10'>
                                <Warn/>: sudo usage is different in a real terminal but achives the same result
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>clear</Cmnd>: Removes all previus input
                            </span>
                            <span className='pl-10'>
                                <Args/>: None
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>mkdir</Cmnd>: create 1 or multiple directories
                            </span>
                            <span className='pl-10'>
                                <Args/>: Name of a directory, can have multiple names, each creating a new directory
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>touch</Cmnd>: create 1 or multiple files
                            </span>
                            <span className='pl-10'>
                                <Args/>: Name of a file, can have multiple names, each creating a new file
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>nano</Cmnd>: open the nano text editor
                            </span>
                            <span className='pl-10'>
                                <Args/>: File to write to / read
                            </span>
                        </span>

                        <span className='flex flex-col gap-2 pt-7'> 
                            <span>
                                <Cmnd>start</Cmnd>: One off command for starting the tutorial
                            </span>
                            <span className='pl-10'>
                                <Args/>: The tutorial file ending in .tut
                            </span>
                            <span className='pl-10'>
                                <Warn/>: Not a real command
                            </span>
                        </span>
                        
                    </BasicOutput>
                )
                break
            
            case "uwu":
                const furrySong = new Audio("/sfx/furrySong.mp3")
                furrySong.play()

                const lyrics = "ok, i know this is a bad idea But..., im already here so...  here we- ffffff fucking go -gasp-  Rawr X3 nuzzles! pounces on U  UwU, U so warm  couldn't help but notice ur bulge from across the floor, nuzzles yo' necky wecky~ murr~ hehe unzips yo baggy ass pants off, baby U so musky take me home, pet me'n make me yours & don't forget to stuff me! :) see me wag my widdle baby tail, all for your bolgy wolgy kisses n lickies yo neck, i hope daddy likies! nuzzles n wuzzles yo chest i be getting thirsty hey i got a little itch, U think U can help me? only seven inches long, UwU, PLS ADOPT ME! paws on ur bulge as i lick me lips, (uwu punish me pls), bout hit'em with this furry shit, (he don't see it comin)"

                output = (<ScrollingText lyrics={lyrics}/>)
                break
            
            case "pwd":
                output = (
                    <BasicOutput className='text-cyan-300'>
                        {currentDir}
                    </BasicOutput>
                )
                if (getArgs()[0] != null) {
                    output = (
                        <>
                            {output}
                            <BasicOutput>
                                Warning: pwd: does not take arguments
                            </BasicOutput>
                        </>
                    )
                }
                break

            case 'start':
                output = syntaxCheck(command, 'start', getArgs(), 1, 1, true)
                if (!output) {
                    if (getArgs()[0] === "tutorial.tut") {
                        output = (
                            <BasicOutput>
                                Starting tutorial...
                            </BasicOutput>
                        )
                    } else {
                        output = (
                            <BasicOutput>
                                This file is not a tutorial!
                            </BasicOutput>
                        )
                    }
                }
                break

            case "whoami":
                output = (
                    <BasicOutput>
                        { user }
                    </BasicOutput>
                )
                break
            
            case "rm":
                console.log(dirPath(getArgs()[0] as any).split("/") as any)
                const rmFlags = flag({
                    "-r": "r",
                    "-f": "f",
                    "-rf": "rf",
                    "-i": "i"
                }, getFlags())
                output = syntaxCheck(command, "rm", getArgs())
                if (!output) {
                    if (getMetadata(content, dirPath(getArgs()[0] as any).split("/") as any)["owner"] == user || user == "admin") {
                        del(content, dirPath(getArgs()[0] as any).split("/") as any)
                        output = (
                            <BasicOutput> 
                                removed
                            </BasicOutput>
                        )
                    } else {
                        output = (
                            <BasicOutput> 
                                user not in sudoers file
                            </BasicOutput>
                        )
                    }
                }
                
                break
            
            case "sudo":
                setAsk({
                    question: "Password ~",
                    callback: password => {
                        if (password == "Minecraft") {
                            setUser("admin")
                            window && window.localStorage.setItem('userClass', 'admin')
                            return (
                                <BasicOutput>
                                    User is now Admin
                                </BasicOutput>
                            )
                        } else {
                            return (
                                <BasicOutput>
                                    Invalid Password
                                </BasicOutput>
                            )
                        }
                    }
                })
                setTimeout(() => document.getElementById("askInput").focus(), 200)
                break
            
            case "clear":
                setTimeout(() => {
                    setPrevCommands([])
                }, 20)
                break
            
            case "mkdir":
                for (let index = 0; index < getArgs().length; index++) {
                    appendValue(content.root, currentDir.split("/") as any, [getArgs()[index], {}], user)
                }
                break
            
            case "touch":
                for (let index = 0; index < getArgs().length; index++) {
                    if ( user !== "admin" && getArgs()[index].split(".")[1] != null && ["jpeg", "png", "jpg", "app"].includes(getArgs()[index].split(".")[1])) {
                        output = (
                            <BasicOutput>
                                Permissions Denied: User not in sudoers file <br />
                                cannot create a file with extension '.{getArgs()[index].split(".")[1]}'
                            </BasicOutput>
                        )
                    } else {
                        appendValue(content.root, currentDir.split("/") as any, [getArgs()[index], ""],  user)
                    }
                }
                break
            
            case "nano":
                output = syntaxCheck(command, "nano", getArgs(), 0)
                if (!output) {
                    setTextEdit(true)
                    setTimeout(() => {
                        document.getElementById("nanoTextEdit").focus()
                    }, 100)
                    if (!getArgs().length) {
                        setNanoText("")
                    } else {
                        setNanoText(getItem(getArgs()[0]))
                        setNanoReferance(getArgs()[0])
                    }
                }
                break
            
            default:
                output = (
                    <BasicOutput>
                        command not found: {command.split(" ")[0]}, Use 'help' for list of commands
                    </BasicOutput>
                )
        }}

        setPrevCommands(prevState => [...prevState, [ranCommand, output]])
        localStorage.setItem('content', JSON.stringify(content))
    }

    return (
        <main className='w-full h-full rounded-lg flex flex-col shadow-2xl ring-1 ring-zinc-200/10'>
            <section className='w-full h-10 px-4 bg-zinc-700 rounded-t-lg flex flex-row justify-between items-center'>
                <div className='w-28 flex flex-row gap-[1px]'>
                    <svg width="75" height="75" onClick={() => redCallback && redCallback()} style={redCallback && {cursor: 'pointer'}}>
                        <circle cx="50%" cy="50%" r="10" fill='#fe6057'/>
                    </svg>

                    <svg width="75" height="75" onClick={() => yellowCallback && yellowCallback()} style={yellowCallback && {cursor: 'pointer'}}>
                        <circle cx="50%" cy="50%" r="10" fill='#febc30'/>
                    </svg>

                    <svg width="75" height="75" onClick={() => greenCallback && greenCallback()} style={greenCallback && {cursor: 'pointer'}}>
                        <circle cx="50%" cy="50%" r="10" fill='#27c83f'/>
                    </svg>
                </div>
                <div className='text-xl font-bold'>
                    {
                        prevInputs[0]
                    }
                </div>
                <h1 className='text-2xl'> Bash terminal </h1>
            </section>
            { !textEdit ?
            <section className='w-full h-full bg-zinc-950 text-zinc-300 rounded-b-lg overflow-scroll'
                id="terminal-window"
                onClick={() => Object.values(ask).every(item => item == null)  ? document.getElementById("input").focus() : document.getElementById("askInput").focus()}
                onKeyDown={event => {
                    if (event.key == "ArrowUp" && prevInputs.length > prevInputsIndex) {
                        setCommand(prevInputs[prevInputsIndex])
                        setPrevInputsIndex(prevState => prevState + 1)
                    }
                    else if (event.key == "ArrowDown" && prevInputsIndex != 0) {
                        setCommand(prevInputs[prevInputsIndex - 1])
                        setPrevInputsIndex(prevState => prevState - 1)
                    }
                    else if (event.key == "ArrowDown" && prevInputsIndex == 0) {
                        setCommand("")
                    }

                    if (event.key == "Tab") {
                        event.preventDefault()
                        if (command.length != 0) {
                            
                            const items = evalSuggestions()
                            if (items.length == 0) return

                            if (!suggesting) {
                                setSuggesting(true)
                                setSuggestionBase(getArgs()[0])
                            } else {
                                if (suggested + 1 < suggestionsItems.length) setSuggested(suggested + 1)
                                else setSuggested(0)
                                
                                setCommand(prevState => `${prevState.split(" ")[0]} ${suggestionsItems[suggested]}`)
                            }

                            setSuggestionInsert(suggestionsItems[suggested])
                        }
                    }
                }}
            >
                <form action={runCommand} className="relative flex flex-col gap-2 p-2" 
                >   
                    {
                        prevCommands.map(items => {
                            return (
                                <Fragment key={v4()}>
                                    {items[0]}
                                    {items[1]}
                                </Fragment>
                            )
                        })
                    }
                    { Object.values(ask).every(item => item != null) ?
                    <>
                        <span className={`relative pl-5 flex flex-row text-xl`}>
                            <span className='w-40'> {ask.question} </span>
                            <input className='group/main outline-none w-full text-transparent bg-transparent' 
                                id="askInput"
                                name='askInput'
                                autoComplete="off"
                                type="text"
                            />
                        </span>
                        <button type='submit' className='appearance-none w-0 h-0'/>
                    </>
                    :
                    <>
                        <span className={`relative before:absolute before:content-['>_'] before:top-0 before:-left-2 before:text-xl before:ml-2 pl-5 flex flex-col`}>
                            <input className='group-focus/main:ring-1 group-focus/main:ring-zinc-200 outline-none w-full text-xl bg-transparent' 
                                value={command} 
                                id="input"
                                name='command'
                                autoComplete="off"
                                type="text"
                                onChange={event => setCommand(event.target.value)}
                            />
                            <span className='relative pl-5 flex flex-wrap gap-x-20 gap-y-3 text-lg outline-none w-[40rem]'>
                                {suggestions}
                            </span>
                        </span>
                        <button type='submit' className='appearance-none w-0 h-0' disabled={command.length == 0}/>
                    </>
                    }
                </form>
            </section>
            :
            <section className='relative w-full h-full p-2 bg-zinc-950 text-zinc-300 rounded-b-lg overflow-scroll'
                onKeyDown={event => {
                    const textarea = (event.target as HTMLTextAreaElement)
                    if (nanoHelp) return
                    
                    if (event.ctrlKey && event.key.toLowerCase() == "c") setNanoPromptSave(false)
                    else if (nanoPromptSave && ["y", "n"].includes(event.key)) {
                        event.preventDefault()
                        
                        if (event.key.toLowerCase() == "y") {
                            appendValue(content.root, currentDir.split("/") as any, [nanoReferance, nanoText], user)
                        } 
                        setTextEdit(prevState => !prevState)
                        setTimeout(() => {
                            document.getElementById("input").focus()
                        }, 100)
                        setNanoPromptSave(false)
                        
                    }
                    else if (event.ctrlKey && event.key == "x") {
                        event.preventDefault()
                        if (nanoText != getItem(nanoReferance)) {
                            setNanoPromptSave(true)
                        } else {
                            setTextEdit(prevState => !prevState)
                                setTimeout(() => {
                                    document.getElementById("input").focus()
                                }, 100)
                        }
                    } 
                    else if (event.ctrlKey && event.key == "h") {
                        setNanoHelp(true)
                        setTimeout(() => {
                            document.getElementById("help-container").focus()
                        }, 100)
                    } 
                    else if (event.ctrlKey && event.key == "y") {
                        event.preventDefault()
                        textarea.scrollTop -= textarea.offsetHeight / 1.5
                        textarea.setSelectionRange(textarea.scrollTop / 4, textarea.scrollTop / 4)
                        setTimeout(() => caretToTop(textarea), 200)
                    }
                    else if (event.ctrlKey && event.key == "v") {
                        event.preventDefault()
                        textarea.scrollTop += textarea.offsetHeight / 1.5
                        textarea.setSelectionRange(0, 4)
                        setTimeout(() => caretToTop(textarea), 200)
                    }
                    setTimeout(() => {
                        textarea.focus()
                    }, 200)
                }}
                
            >   
                { !nanoHelp ? 
                
                <div className='w-full h-full'
                    onClick={() => document.getElementById("nanoTextEdit").focus()}
                >
                    <textarea className='w-full bg-transparent outline-none appearance-none resize-none pointer-events-none'
                        style={nanoPromptSave ? { height: '88%' } : { height: '94%' }}
                        id='nanoTextEdit'
                        value={nanoText}
                        onChange={event => setNanoText(event.target.value)}
                    />
                    
                    { nanoPromptSave ?
                    <div className='w-full h-[12%]'>
                        <div className='w-full h-[23%] items-center bg-gray-300 text-black'>
                            <span> Save modified buffer (ANSWERING "No" WILL DESTROY CHANGES) ? </span>
                        </div>
                        <div className='w-full h-[77%] z-20 ml-8 flex flex-row items-end gap-12 text-xl'>
                            <span><GrayLetter>^c</GrayLetter> Cancel</span>
                            <div className='h-full w-20 flex flex-col justify-end'>
                                <span><GrayLetter>Y</GrayLetter> yes</span>
                                <span><GrayLetter>N</GrayLetter> no</span>
                            </div>
                        </div>
                    </div>
                    
                    :
                    <div className=' w-full h-[6%] z-20 ml-20 pb-3 flex flex-row items-end gap-12 text-xl'>
                        <span><GrayLetter>^x</GrayLetter> Exit</span>
                        <span><GrayLetter>^h</GrayLetter> Help</span>
                        <span><GrayLetter>^y</GrayLetter> Next Pg</span>
                        <span><GrayLetter>^v</GrayLetter> Prev Pg</span>
                    </div>
                    }
                    
                </div>
                :
                
                <section className='w-full h-full outline-none appearance-none'
                    onKeyDown={event => {
                        event.preventDefault()
                        if (event.ctrlKey && event.key == "x") {
                            setNanoHelp(false)
                            setTimeout(() => {
                                document.getElementById("nanoTextEdit").focus()
                            }, 400)
                        } 
                        else if (event.ctrlKey && event.key == "y") {
                            event.preventDefault()
                            setNanoHelpPage(prevState => Math.min(2, prevState + 1))
                        }
                        else if (event.ctrlKey && event.key == "v") {
                            event.preventDefault()
                            setNanoHelpPage(prevState => Math.max(0, prevState - 1))
                        }
                    }}
                    id='help-container'
                    tabIndex={0}
                >
                    <div className='w-full h-[94%] flex items-center justify-center'>
                        <div className='w-4/5 leading-loose h-full flex items-center justify-center text-center text-lg'>
                            {
                                [
                                    "Nano is a simple and user-friendly text editor that operates in a terminal environment. It provides basic text editing capabilities while maintaining an easy-to-use interface. Below are some essential commands",
                                    "Press Ctrl + O to write changes to the file, then press Enter to confirm.  \n \n Press Ctrl + X to exit Nano. If changes are unsaved, Nano will prompt you to save. \n \n Use Ctrl + V to move one page down and Ctrl + Y to move one page up.",
                                    "When you exit Nano, it will prompt you to save changes if any modifications were made. Follow the on-screen instructions to confirm or discard changes."
                                ][nanoHelpPage]
                            }
                        </div>
                    </div>
                    <div className=' w-full h-[6%] z-20 ml-20 pb-3 flex flex-row items-end gap-64 text-xl'>
                        <span><GrayLetter>^x</GrayLetter> Exit</span>
                        { nanoHelpPage < 2 && <span><GrayLetter>^y</GrayLetter> Next Pg</span>}
                        { nanoHelpPage > 0 && <span><GrayLetter>^v</GrayLetter> Prev Pg</span>}
                    </div>
                </section>
                }
            </section>
            }
        </main>
    )
}

export default Terminal

const GrayLetter = ({ children, className = null }) => (
    <span className={'bg-gray-300 text-black ' + className}>
        {children}
    </span>
)

export const FakeTerminal = () => {
    return (
        <main className='w-full md:w-3/4 h-3/4 rounded-lg flex flex-col shadow-2xl ring-1 ring-zinc-200/10'>
            <section className='w-full h-10 px-4 bg-zinc-700 rounded-t-lg flex flex-row justify-between items-center'>
                <div className='w-28 flex flex-row gap-[1px]'>
                    <svg width="75" height="75">
                        <circle cx="50%" cy="50%" r="10" fill='#5E5F64'/>
                    </svg>

                    <svg width="75" height="75">
                        <circle cx="50%" cy="50%" r="10" fill='#5E5F64'/>
                    </svg>

                    <svg width="75" height="75">
                        <circle cx="50%" cy="50%" r="10" fill='#5E5F64'/>
                    </svg>
                </div>
                <h1 className='text-2xl'> Access Denied </h1>
            </section>
            <section className='w-full h-full bg-zinc-950/40 text-zinc-300 rounded-b-lg overflow-hidden flex flex-col items-center justify-center gap-5 px-20'>
                <svg width="200px" height="200px" viewBox="0 -1 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>emoji_sad_simple [#456]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-144.000000, -6165.000000)" fill="#e0e0e0"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M96,6009 L100,6009 L100,6005 L96,6005 L96,6009 Z M88,6009 L92,6009 L92,6005 L88,6005 L88,6009 Z M99,6015 L97,6015 C97,6011 91,6011 91,6015 L89,6015 C89,6008 99,6008 99,6015 L99,6015 Z" id="emoji_sad_simple-[#456]"> </path> </g> </g> </g> </g></svg>
                <GrayLetter className="text-lg text-center">
                    This terminal is not accsesible on a mobile device, please use a pc
                </GrayLetter>
            </section>
        </main>
    )
}

export const BasicOutput = ({ children, className = "" }) => {
    return (
        <span className={'relative pl-5 overflow-wrap' + className}>
            <span className="max-w-full whitespace-normal break-all flex flex-wrap gap-x-20 gap-y-3 text-xl">
                {children}
            </span> 
        </span>
    )
} 


export const BarebonesOutput = ({ children, className = "" }) => {
    return (
        <span className={'relative pl-5 flex flex-wrap gap-x-20 gap-y-3 text-xl' + className}>
            {children}
        </span>
    )
}

const Cmnd = ({children}) => (
    <span className='text-cyan-300 font-bold text-[1.35rem]'> 
        {children} 
    </span>
)

const Flags = () => (
    <span className='text-red-300'> 
        Flags
    </span>
)

const Args = () => (
    <span className='text-emerald-300'> 
        Args
    </span>
)

const Warn = () => (
    <span className='text-yellow-300'> 
        Warning
    </span>
)