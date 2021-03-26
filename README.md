# arweave-uploader (work in progress)

Arweave Uploader - detect and handle arweave upload failures 

** N.B. this only works for value transfer or very small data txs
** N.B. Warning! Tx retry will create multiple txs during periods of unusually high network/gateway load

## Installation

```
npm install arweave-uploader
```

## Example Usage - N.B. API subject to constant change ;-)

```
import Arweave from 'arweave'

const arweave = ...

const main = async () => {

	/* create your transaction as normal */

	const tx = await arweave.createTransaction({ data: "123" }, wallet)
	tx.addTag('App-Name', 'my-app-name')
	tx.addTag('Content-Type', 'application/json')

	try {

		/* no need to sign or post, just call "uploadTx" with your wallet */

		const txid = await uploadTx(tx, wallet) // this will take a long time!
		
		console.log('tx upload success with id ' + txid)

	}catch(e){
		
		/* bad tx found (e.g. wallet does not enough AR for tx fee) */

		console.error(e.name + ': ' + e.message)
	}
}
```

## Options

`setDebugOutput(false)` to turn off console messages - not advised, but possible.
