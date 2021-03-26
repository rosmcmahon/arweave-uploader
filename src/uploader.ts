import Arweave from 'arweave'
import Transaction from 'arweave/node/lib/transaction'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { logger } from './utils/logger'
import { getStatus, sleep } from './utils/utils'

const arweave = Arweave.init({
	host: 'lon-1.arweave.net',
	protocol: 'http',
	port: 1984
})


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

	//post
	await arweave.transactions.post(tx)
	logger(uRef, 'New txid', tx.id)
	const tStart = new Date().valueOf()

	// start examining the status
	let status = await getStatus(tx.id)

	// 404s may change to 202s here, we'll wait 30 seconds total
	let wait = 6
	while((status === 404 || status === 410) && wait--){
		logger(uRef, 'Initial 4XX detected. Waiting 5 seconds...', status)
		await sleep(5000) //5 secs
		try{
			status = await getStatus(tx.id)
		}catch(err){
			logger(uRef, 'Network error getting status. Ignoring & waiting...', status)
			wait++
			status = 404
		}
	}
	if(status === 400 || status === 404 || status === 410){
		logger(uRef, 'Invalid transaction detected. Status ' + status, 'Throwing error')
		throw new Error('Possible invalid transaction detected. Status ' + status)
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

	// we'll give it 4 minutes for propogation
	if(status === 404 || status === 410){ //idk what 410 means but it happens sometimes
		let tries = 6
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

	// if(status === 404){
	// 	tx.addTag('Retry', (new Date().valueOf()/1000).toString() ) // this gives different txid too
	// 	return await upload(tx, wallet)
	// }
	logger(uRef, 'Possible failure, no retry. Status ', status)//, '. Retrying post tx')
	throw new Error(`Possible failure. Txid: ${tx.id} Status: ${status}`)
}
