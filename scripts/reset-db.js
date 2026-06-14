const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: "/Users/alade/Developer/RIAD-Finance/.env" });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "riadfinance";

const WALLET = "0x64bc8917fdc3fb5b452dd805b0d295755a88e489".toLowerCase();

async function resetCompany() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    const collections = [
      { name: "companies", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "company_keys", query: { wallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "employers", query: { wallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "employees", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "streams", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "transfers", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_runs", query: { wallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_runs_real", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_run_items_real", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "cashout_requests", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_profiles", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_cycles", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "payroll_cycle_items", query: { employerWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "setup_actions", query: { wallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "claim_records", query: { wallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } },
      { name: "compliance_events", query: { actorWallet: { $regex: new RegExp(`^${WALLET}$`, "i") } } }
    ];

    for (const coll of collections) {
      const collection = db.collection(coll.name);
      const result = await collection.deleteMany(coll.query);
      console.log(`Deleted ${result.deletedCount} documents from ${coll.name}`);
    }

    console.log("Company reset successful.");
  } catch (err) {
    console.error("Error resetting company:", err);
  } finally {
    await client.close();
  }
}

resetCompany();
