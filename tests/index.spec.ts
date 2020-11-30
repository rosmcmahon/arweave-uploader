import { upload } from '../src/uploader'
import { assert, expect } from 'chai'
import nock from 'nock'
import jwk from '../src/secret/jwk.json'
import { JWKInterface } from 'arweave/node/lib/wallet'
import Arweave from 'arweave'
import { logger, setDebugMessagesOn } from '../src/utils/logger'


const arweave = Arweave.init({ host: 'arweave.net', protocol: 'https' })

// public getStatus(id: string): Promise<TransactionStatusResponse> {
// 	return this.api.get(`tx/${id}/status`).then(response => {
// 		if (response.status == 200) {
// 			return {
// 				status: 200,
// 				confirmed: response.data
// 			};
// 		}
// 		return {
// 			status: response.status,
// 			confirmed: null
// 		};
// 	});
// }

// const scope = nock('https://arweave.net')
// 	.get(/tx\/.*\/status/)
// 	.reply(200, { status: 200, confirmed: 'dummy' })

describe('arweave-uploader tests', () => {

	let badJwk1: JWKInterface
	let badJwk2: JWKInterface
	let goodJwk: JWKInterface = jwk

	before( async function () {
		this.timeout(20000)
		// create some ransom empty wallets
		badJwk1 = await arweave.wallets.generate()
		badJwk2 = await arweave.wallets.generate()

		setDebugMessagesOn(true)
	})

	it('throws an error if a data tx owner has no balance', async () => {
		let result = { name: '', message: '' }

		const tx = await arweave.createTransaction({ 
			data: '123',
		}, badJwk1)

		try {
			const txid = await upload(tx, badJwk1)
		}catch(error){
			result = error
		}

		expect(result.name).to.eq('Error')
		expect(result.message).to.eq('Invalid transaction detected. Status 410')

	}).timeout(20000)
	
	it('throws an error if a value transfer tx owner has no balance', async () => {
		let result = { name: '', message: '' }

		const tx = await arweave.createTransaction({ 
			quantity: arweave.ar.arToWinston('100'),
			target: await arweave.wallets.jwkToAddress(badJwk2)
		}, badJwk1)

		try {
			const txid = await upload(tx, badJwk1)
		}catch(error){
			result = error
		}

		expect(result.name).to.eq('Error')
		expect(result.message).to.eq('Invalid transaction detected. Status 410')

	}).timeout(20000)

	it('detects an upload failure & returns a confirmed txid for a valid transaction', async () => {
		const tx = await arweave.createTransaction({ 
			data: '123',
		}, goodJwk)
		const txid = await upload(tx, goodJwk)

		expect(txid).to.have.lengthOf(43)
	}).timeout(0)
	
})