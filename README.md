# arweave-uploader

Arweave Uploader - detect and handle arweave upload failures 

## Installation

```
npm install arweave-uploader
```

## Example Usage

```
import Arweave from 'arweave'

const arweave = ...

const main = async () => {

	/* create you transaction as normal */

	const tx = await arweave.createTransaction({ data: "123" }, wallet)
	tx.addTag('App-Name', 'my-app-name')
	tx.addTag('Content-Type', 'application/json')

	try {

		/* no need to sign or post, just call "uploadTx" with your wallet */

		const txid = await uploadTx(tx, wallet) // this will taka long time!
		
		console.log('tx upload success with id ' + txid)

	}catch(e){
		
		/* bad tx found (e.g. wallet does not enough AR for tx fee) */
		
		console.error(e.name + ': ' + e.message)
	}
}
```

## Options

`setDebugOutput(false)` to turn off console messages - not advised, but possible.