import { Schema, model } from 'mongoose';

export interface IHubWallet {
  wallet_id: string,
  type: string,
  phrase: string,
  keystoreval: string,
  password: string,
  privatekeyval: string,
  createdAt: Date,

}
const hubWalletSchema = new Schema<IHubWallet>({
  wallet_id: { type: String },
  type: { type: String },
  phrase: { type: String },
  keystoreval: { type: String },
  password: { type: String },
  privatekeyval: { type: String },
  createdAt: { type: Date },
})

const HubWallet = model<IHubWallet>('hubwallet', hubWalletSchema);
export default HubWallet 