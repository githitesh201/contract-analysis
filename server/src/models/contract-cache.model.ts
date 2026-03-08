import mongoose, { Document, Schema } from "mongoose";

export interface IContractCache extends Document {
  contractId: string;
  data: unknown;
  expiresAt: Date;
}

const ContractCacheSchema: Schema = new Schema(
  {
    contractId: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export default mongoose.model<IContractCache>(
  "ContractCache",
  ContractCacheSchema
);
