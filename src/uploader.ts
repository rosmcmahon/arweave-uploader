import Arweave from 'arweave'
import Transaction from 'arweave/node/lib/transaction'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { logger } from './utils/logger'
import { getStatus, sleep } from './utils/utils'

const arweave = Arweave.init({
	host: 'arweave.net',
	protocol: 'https',
})


export const upload = async (tx: Transaction, wallet: JWKInterface): Promise<string> => {
	//sign & post
	await arweave.transactions.sign(tx, wallet);
	await arweave.transactions.post(tx)
	logger('New txid', tx.id)
	const tStart = new Date().valueOf()

	// start examining the status
	let status = await getStatus(tx.id)

	// 404s may change to 202s here, we'll wait 30 seconds total
	let wait = 6
	while(status === 404 && wait--){
		logger('Initial 404 detected. Waiting 5 seconds...', status)
		await sleep(5000) //5 secs
		try{
			status = await getStatus(tx.id)
		}catch(err){
			logger('Network error getting status. Ignoring & waiting...', status)
			wait++
			status = 404
		}
	}
	if(status === 400 || status === 404 || status === 410){
		logger('Invalid transaction detected. Status ' + status, 'Throwing error')
		throw new Error('Invalid transaction detected. Status ' + status)
	}

	while(status === 202){
		let now = (new Date().valueOf() - tStart) / (1000*60)
		logger("Mining for " + now.toFixed(1) + " mins. " + status)
		await sleep(30000) //sleep 30 secs
		try{
			status = await getStatus(tx.id)
		}catch(err){
			logger('Network error retrieving status.', status, 'Continuing...')
			status = 202
		}
	}

	logger('Finished mining period with status', status)

	if(status === 200){
		logger("Success", status)
		return tx.id
	}

	// we'll give it 2 minutes for propogation
	if(status === 404){
		let tries = 3
		do{
			await sleep(40000) //40 secs
			try{
				status = await getStatus(tx.id)
				logger('tries', tries, 'status', status)
			}catch(err){
				logger('Network error getting status. Ignoring & waiting...', status)
				tries++
				status = 404
			}
			if(status === 200){
				logger("Success", status)
				return tx.id
			}
		}while(--tries)
	}

	logger('Failure', status, '. Retrying post tx')
	tx.addTag('Upload-Attempt', new Date().toLocaleString() ) // this gives different txid too
	return await upload(tx, wallet)
}
