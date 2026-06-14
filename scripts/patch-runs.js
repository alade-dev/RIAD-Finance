import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB.");

  const db = client.db("riadfinance_dev");
  const runs = await db.collection("payroll_runs").find({}).toArray();
  
  for (const run of runs) {
    if (run.providerMeta && run.providerMeta.transferProofs) {
      for (const proof of run.providerMeta.transferProofs) {
        if (!proof.originalAddress) {
          proof.originalAddress = "0x909313B36976c2d7C207EF2Da289f27B4ee797c3"; 
        }
      }
      await db.collection("payroll_runs").updateOne(
        { _id: run._id },
        { $set: { "providerMeta.transferProofs": run.providerMeta.transferProofs } }
      );
    }
  }
  console.log("Patched payroll runs.");
  await client.close();
}
main().catch(console.error);
