import random
import json
from web3 import Web3
from agent import Agent

# === Connect to Ganache ===
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
assert w3.is_connected(), "Web3 not connected!"

# === Load deployed contract addresses ===
with open("deployed.json") as f:
    addresses = json.load(f)

# === Load ABIs ===
with open("artifacts/contracts/AgentToken.sol/AgentToken.json") as f:
    token_artifact = json.load(f)
with open("artifacts/contracts/JobMarket.sol/JobMarket.json") as f:
    job_artifact = json.load(f)

token = w3.eth.contract(address=addresses["AgentToken"], abi=token_artifact["abi"])
job_market = w3.eth.contract(address=addresses["JobMarket"], abi=job_artifact["abi"])

# === Accounts and Private Keys ===
accounts = w3.eth.accounts
priv_keys = [
    "0x522e762fa9abd53bc2ad90d9365cc9eb8a6c12b7b92231c2ac413cc0c82364c2",
    "0x147eb7a3fcaf2d894c366196925fe51e5368c9c5d17a27fb94d4fd027b748c93",
    "0xfb58318e5a2f676307382c50162526dfdc2c19c82b99114dad4f7874c71155f2",
    "0xaa2cd87b274eb01ac2c8b7d545fd7c9e9f18cd9e9fe51d189def7995f392b480",
    "0xaaa485286dbdd930cb58295a71462da046a060cf279973260c167ad77d1275ef",
    "0xbcc2d58d065aa586ef2ae00f4444b1944526241993c338f8556f5ad3308d59f3",
    "0x721af74c1e0e4aa087bb90fb9c31e468ed36b8c23f5ac8d8553fb76703f0a7d9",
    "0xfdfde828a415e162812ac2f988ac9c0836b7a5eeda756799310f81389353871c",
]

# === Initialize Vendors and Workers ===
vendors = [Agent(f"Vendor{i}", priv_keys[i], accounts[i], w3, token, job_market) for i in range(3)]
workers = [Agent(f"Worker{i}", priv_keys[i+3], accounts[i+3], w3, token, job_market) for i in range(5)]

# === Step 1: Vendors post jobs ===
print("\n📤 Vendors posting jobs...")
for i, vendor in enumerate(vendors):
    vendor.post_job(f"Deliver package #{i}", 500 * 10**18)

# === Step 2: Workers accept random available jobs ===
print("\n👷 Workers accepting jobs...")
for i, worker in enumerate(workers):
    job_index = i % len(vendors)  # Spread workers across posted jobs
    try:
        worker.accept_job(job_index)
    except Exception as e:
        print(f"{worker.name} failed to accept job {job_index}: {str(e)}")

# === Step 3: Vendors complete jobs ===
print("\n✅ Vendors completing jobs...")
for i, vendor in enumerate(vendors):
    try:
        vendor.complete_job(i)
    except Exception as e:
        print(f"{vendor.name} failed to complete job {i}: {str(e)}")

# === Final Token Balances ===
print("\n💰 Final Token Balances:")
for vendor in vendors:
    balance = token.functions.balanceOf(vendor.address).call() // 10**18
    print(f"{vendor.name}: {balance} tokens")

for worker in workers:
    balance = token.functions.balanceOf(worker.address).call() // 10**18
    print(f"{worker.name}: {balance} tokens")
