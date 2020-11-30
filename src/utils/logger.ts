import col from 'ansi-colors'

let DEBUG_MESSAGES = true
export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b

export const logger = (...args: any[]) => {
	if(DEBUG_MESSAGES){
		console.log(col.blue('[arweave-uploader:]'), ...args)
	}
}