import { Schema, model } from 'mongoose';

export interface IHubWallet {
  wallet_id: string,
  type: string,
  value: string
  createdAt: Date,

}
const hubWalletSchema = new Schema<IHubWallet>({
  wallet_id: { type: String },
  type: { type: String },
  value: { type: String },
  createdAt: { type: Date },
})

const HubWallet = model<IHubWallet>('hubwallet', hubWalletSchema);
export default HubWallet 