from web3 import Web3

class Agent:
    def __init__(self, name, private_key, address, web3, token_contract, job_market_contract):
        self.name = name
        self.private_key = private_key
        self.address = address
        self.w3 = web3
        self.token = token_contract
        self.market = job_market_contract

    def post_job(self, description, payment):
        # Approve token transfer
        nonce = self.w3.eth.get_transaction_count(self.address)
        approve_tx = self.token.functions.approve(self.market.address, payment).build_transaction({
            'from': self.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.to_wei('2', 'gwei')
        })
        signed_approve = self.w3.eth.account.sign_transaction(approve_tx, self.private_key)
        self.w3.eth.send_raw_transaction(signed_approve.raw_transaction)
        self.w3.eth.wait_for_transaction_receipt(signed_approve.hash)

        # Post job
        nonce += 1
        job_tx = self.market.functions.postJob(description, payment).build_transaction({
            'from': self.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.to_wei('2', 'gwei')
        })
        signed_job = self.w3.eth.account.sign_transaction(job_tx, self.private_key)
        self.w3.eth.send_raw_transaction(signed_job.raw_transaction)
        self.w3.eth.wait_for_transaction_receipt(signed_job.hash)

        print(f"✅ {self.name} posted a job: {description} for {payment // 10**18} tokens")

    def accept_job(self, job_id):
        nonce = self.w3.eth.get_transaction_count(self.address)
        tx = self.market.functions.acceptJob(job_id).build_transaction({
            'from': self.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.to_wei('2', 'gwei')
        })
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        self.w3.eth.wait_for_transaction_receipt(signed_tx.hash)

        print(f"✅ {self.name} accepted job #{job_id}")

    def complete_job(self, job_id):
        nonce = self.w3.eth.get_transaction_count(self.address)
        tx = self.market.functions.completeJob(job_id).build_transaction({
            'from': self.address,
            'nonce': nonce,
            'gas': 2000000,
            'gasPrice': self.w3.to_wei('2', 'gwei')
        })
        signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
        self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        self.w3.eth.wait_for_transaction_receipt(signed_tx.hash)

        print(f"✅ {self.name} completed job #{job_id}")
