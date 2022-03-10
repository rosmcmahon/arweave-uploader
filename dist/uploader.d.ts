import Transaction from 'arweave/node/lib/transaction';
import { JWKInterface } from 'arweave/node/lib/wallet';
export declare const upload: (tx: Transaction, wallet: JWKInterface, userReference?: string | undefined) => Promise<string>;
