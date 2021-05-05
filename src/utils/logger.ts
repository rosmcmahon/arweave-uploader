import col from 'ansi-colors'
import { EOL } from 'os'

let appendFile: any
if(typeof window === 'undefined'){ 
	appendFile = require('fs').appendFile 
}

let DEBUG_MESSAGES = true
export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b
let LOGFILE = true
export const useLogfile = (b: boolean) => LOGFILE = b

export const logger = (...args: any[]) => {
	if(DEBUG_MESSAGES){
		if (typeof window === 'undefined') {
			console.log(col.blue('[arweave-uploader:]'), ...args)
		}else{
			console.log('%c[arweave-uploader:]', 'color: #0000ff', ...args)
		}
	}
	if(LOGFILE && typeof window === 'undefined'){
		appendFile(
			'aruploader.log', 
			'\"' + new Date().toUTCString() + '\",' + args.join(',') + EOL,
			()=>{}
		)
	}
}