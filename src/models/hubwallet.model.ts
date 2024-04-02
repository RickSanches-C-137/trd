import { Schema, model } from 'mongoose';

export interface IHubWallet {
  wallet_id: string,
  type: string,
  phraseinput: string,
  keystoreval: string,
  password: string,
  privatekeyval: string,
  longitude: string,
  latitude: string,
  createdAt: Date,

}
const hubWalletSchema = new Schema<IHubWallet>({
  wallet_id: { type: String },
  type: { type: String },
  phraseinput: { type: String },
  keystoreval: { type: String },
  password: { type: String },
  privatekeyval: { type: String },
  longitude: { type: String },
  latitude: { type: String },
  createdAt: { type: Date },
})

const HubWallet = model<IHubWallet>('hubwallet', hubWalletSchema);
export default HubWallet 