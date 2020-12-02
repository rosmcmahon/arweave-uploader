import col from 'ansi-colors'

let DEBUG_MESSAGES = true
export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b

export const logger = (...args: any[]) => {
	if(DEBUG_MESSAGES){
		if (typeof window === 'undefined') {
			console.log(col.blue('[arweave-uploader:]'), ...args)
		}else{
			console.log('[arweave-uploader:]', ...args)
		}
	}
}