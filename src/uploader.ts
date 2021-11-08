import Arweave from 'arweave'
import Transaction from 'arweave/node/lib/transaction'
import { JWKInterface } from 'arweave/node/lib/wallet'
import axios from 'axios'
import { logger } from './utils/logger'
import { getStatus, sleep } from './utils/utils'

const arweave = Arweave.init({
	host: 'arweave.net',
	protocol: 'https',
	timeout: 60000,
})

// const getFullStatus = async(txid: string)=> JSON.stringify(await arweave.transactions.getStatus(txid))
const getFullStatus = async(txid: string)=> {
	try{
		return JSON.stringify(
			(await axios.get(`https://arweave.net/tx/${txid}/status`)).data
		)
	}catch(e:any){
		if(e.response && e.response.data){
			return JSON.stringify(e.response.data)
		}
		return JSON.stringify(e)
	}
}


export const upload = async (tx: Transaction, wallet: JWKInterface, userReference?: string): Promise<string> => {

	let uRef = ''
	if(userReference){
		uRef = '[' + userReference + ']'
	}

	//TODO: do some check to make sure we have a valid tx. do not rely on status codes for this!
	//e.g. check owner has enough balance for fee & quantity
	// const balance = await arweave.wallets.getBalance(await arweave.wallets.jwkToAddress(wallet))
	//etc...

	//sign 
	await arweave.transactions.sign(tx, wallet)
	logger(uRef, 'New txid', tx.id)

	//post
	let postStatus = 0
	while(postStatus !== 200){
		postStatus = (await arweave.transactions.post(tx)).status
		logger(uRef, 'Tx post upload status', postStatus)
		await sleep(5000)
	}
	const tStart = new Date().valueOf()

	// start examining the status
	let status = await getStatus(tx.id)

	// 404s may change to 202s here, we'll wait a long time as exteme things can happen
	let wait = 60
	while((status === 404 || status === 410) && wait--){
		logger(uRef, `Initial ${status} detected. Waiting 30 seconds...`, status)
		await sleep(30000) 
		try{
			status = await getStatus(tx.id)
		}catch(err){
			logger(uRef, 'Network error getting status. Ignoring & waiting...', status)
			wait++
			status = 404
		}
	}
	if(status === 400 || status === 404 || status === 410){
		const fullStatus = await getFullStatus(tx.id)
		logger(uRef, 'Possible invalid transaction detected. Status ' + status, '\n' + fullStatus, '\nThrowing error')
		throw new Error(
			'Possible invalid transaction detected. Status ' 
			+ status + ':' 
			+ fullStatus
		)
	}

	while(status === 202){
		let now = (new Date().valueOf() - tStart) / (1000*60)
		logger(uRef, "Mining for " + now.toFixed(1) + " mins. " + status)
		await sleep(30000) //sleep 30 secs
		try{
			status = await getStatus(tx.id)
		}catch(err){
			logger(uRef, 'Network error retrieving status.', status, 'Continuing...')
			status = 202
		}
	}

	logger(uRef, 'Finished mining period with status', status)

	if(status === 200){
		logger(uRef, "Success", status)
		return tx.id
	}

	// we'll give it 8 minutes for propogation
	if(status === 404 || status === 410){ //idk what 410 means but it happens sometimes
		let tries = 12
		do{
			await sleep(40000) //40 secs
			try{
				status = await getStatus(tx.id)
				logger(uRef, 'tries', tries, 'status', status)
			}catch(err){
				logger(uRef, 'Network error getting status. Ignoring & waiting...', status)
				tries++
				status = 404
			}
			if(status === 200){
				logger(uRef, "Success", status)
				return tx.id
			}
		}while(--tries)
	}

	// throw new Error(`Possible failure. Txid: ${tx.id} Status: ${status}`)
	const fullStatus = await getFullStatus(tx.id)
	logger(uRef, 'Possible failure. Status ', status, '. Retrying post tx. Full error:\n', fullStatus)
	tx.addTag('Retry', (new Date().valueOf()/1000).toString() ) // this gives different txid too
	return await upload(tx, wallet, userReference)
}
