import { upload } from '../src/uploader'
import { assert, expect } from 'chai'
import sinon from 'sinon'
import jwk from '../src/secret/jwk.json'
import { JWKInterface } from 'arweave/node/lib/wallet'
import Arweave from 'arweave'
import { logger, setDebugMessagesOn } from '../src/utils/logger'
import * as Utils from '../src/utils/utils'
import Transactions from 'arweave/node/transactions'


const arweave = Arweave.init({ host: 'arweave.net', protocol: 'https' })


describe('arweave-uploader tests', () => {

	let badJwk1: JWKInterface
	let badJwk2: JWKInterface
	let goodJwk: JWKInterface = jwk

	before( async function () {
		this.timeout(20000)
		// create some ransom empty wallets
		badJwk1 = await arweave.wallets.generate()
		badJwk2 = await arweave.wallets.generate()
		logger('test wallet balance', arweave.ar.winstonToAr(
			await arweave.wallets.getBalance(
				await arweave.wallets.jwkToAddress(goodJwk)
			)
		))

		setDebugMessagesOn(true)
	})

	afterEach(() => {
		sinon.restore()
	})

	// it('throws an error if a data tx owner has no balance', async () => {
	// 	let result = { name: '', message: '' }

	// 	const tx = await arweave.createTransaction({ 
	// 		data: '123',
	// 	}, badJwk1)

	// 	try {
	// 		const txid = await upload(tx, badJwk1)
	// 	}catch(error){
	// 		result = error
	// 	}

	// 	expect(result.name).to.eq('Error')
	// 	expect(result.message).to.eq('Invalid transaction detected. Status 410')

	// }).timeout(40000)
	
	// it('throws an error if a value transfer tx owner has no balance', async () => {
	// 	let result = { name: '', message: '' }

	// 	const tx = await arweave.createTransaction({ 
	// 		quantity: arweave.ar.arToWinston('100'),
	// 		target: await arweave.wallets.jwkToAddress(badJwk2)
	// 	}, badJwk1)

	// 	try {
	// 		const txid = await upload(tx, badJwk1)
	// 	}catch(error){
	// 		result = error
	// 	}

	// 	expect(result.name).to.eq('Error')
	// 	expect(result.message).to.eq('Invalid transaction detected. Status 410')

	// }).timeout(40000)

	it('detects an upload failure after mining & returns a confirmed txid for a valid transaction', async () => {
		const tx = await arweave.createTransaction({ 
			data: '123',
		}, goodJwk)

		// let's fake the getStatus calls in upload function
		const fakeGetStatus = sinon.stub(Utils, 'getStatus')
			.onCall(0).resolves(404)
			.onCall(1).resolves(202)
			.onCall(2).resolves(202)
			.onCall(3).resolves(404)
			.onCall(4).resolves(404)
			.onCall(5).resolves(404)
			.onCall(6).resolves(400)
			.onCall(7).resolves(202)
			.onCall(8).resolves(202)
			.onCall(9).resolves(200)

		//let's save money 🤑
		const preventTxPost = sinon.stub(Transactions.prototype, 'post').resolves()

		//let's save time
		sinon.stub(Utils, 'sleep').resolves()

		const txid = await upload(tx, goodJwk, 'failure-retry')
		
		expect(fakeGetStatus.called).to.equal(true)
		expect(preventTxPost.called).to.equal(true)
		expect(txid).to.have.lengthOf(43)
	}).timeout(0)

	it('detects an upload failure before mining & returns a confirmed txid after failure recovery', async () => {
		const tx = await arweave.createTransaction({ 
			data: '123',
		}, goodJwk)

		// let's fake the getStatus calls in upload function
		const fakeGetStatus = sinon.stub(Utils, 'getStatus')
			.onCall(0).resolves(404)
			.onCall(1).resolves(404)
			.onCall(2).resolves(404)
			.onCall(3).resolves(404)
			.onCall(4).resolves(404)
			.onCall(5).resolves(404)
			.onCall(6).resolves(404)
			.onCall(7).resolves(202)
			.onCall(8).resolves(202)
			.onCall(9).resolves(202)
			.onCall(10).resolves(200)

		//let's save money 🤑
		const preventTxPost = sinon.stub(Transactions.prototype, 'post').resolves()

		//let's save time
		sinon.stub(Utils, 'sleep').resolves()

		const txid = await upload(tx, goodJwk, 'fail before retry')
		
		expect(fakeGetStatus.called).to.equal(true)
		expect(preventTxPost.called).to.equal(true)
		expect(txid).to.have.lengthOf(43)
	}).timeout(0)
	

	it('detects an upload failure but cannot recover :-(', async () => {
		const tx = await arweave.createTransaction({ 
			data: '123',
		}, goodJwk)

		// let's fake the getStatus calls in upload function
		const fakeGetStatus = sinon.stub(Utils, 'getStatus').resolves(410)

		//let's save money 🤑
		const preventTxPost = sinon.stub(Transactions.prototype, 'post').resolves()

		//let's save time
		sinon.stub(Utils, 'sleep').resolves()

		const txid = await upload(tx, goodJwk, 'fail before retry')
		
		expect(fakeGetStatus.called).to.equal(true)
		expect(preventTxPost.called).to.equal(true)
		expect(txid).to.have.lengthOf(43)
	}).timeout(0)
	
})