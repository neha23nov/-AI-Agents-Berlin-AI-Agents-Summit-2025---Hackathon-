import React, { useEffect, useState } from "react";
import Web3 from "web3";
import AgentToken from "./abi/AgentToken.json";
import JobMarket from "./abi/JobMarket.json";
import { CONTRACT_ADDRESSES, AGENTS } from "./config";
import AgentCard from "./components/AgentCard";
import JobList from "./components/JobList";

const web3 = new Web3("http://localhost:8545");

function App() {
  const [balances, setBalances] = useState({});
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const token = new web3.eth.Contract(AgentToken, CONTRACT_ADDRESSES.token);
    const jobMarket = new web3.eth.Contract(JobMarket, CONTRACT_ADDRESSES.jobMarket);

    const fetchData = async () => {
      try {
        // Get token balances
        const newBalances = {};
        for (const agent of AGENTS) {
          const bal = await token.methods.balanceOf(agent.address).call();
          newBalances[agent.address] = parseInt(bal) / 1e18;
        }
        setBalances(newBalances);

        // Get job list
        const jobCount = await jobMarket.methods.jobCounter().call();
        const jobArray = [];

        for (let i = 0; i < jobCount; i++) {
          // ✅ USE getJob() instead of jobs()
          const job = await jobMarket.methods.getJob(i).call();
          jobArray.push({
            id: job.id,
            description: job.description,
            reward: parseInt(job.payment) / 1e18,
            employer: job.employer,
            worker: job.worker,
            status: job.isCompleted
              ? "Completed"
              : job.isTaken
              ? "Accepted"
              : "Posted",
          });
        }

        setJobs(jobArray);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePostJob = async () => {
    const token = new web3.eth.Contract(AgentToken, CONTRACT_ADDRESSES.token);
    const jobMarket = new web3.eth.Contract(JobMarket, CONTRACT_ADDRESSES.jobMarket);

    const sender = AGENTS[0].address; // Vendor0
    const desc = "Deliver documents to HQ";
    const amount = web3.utils.toWei("500", "ether");

    await token.methods.approve(CONTRACT_ADDRESSES.jobMarket, amount).send({ from: sender });
    await jobMarket.methods.postJob(desc, amount).send({ from: sender });
  };

  const handleAcceptJob = async () => {
    const jobMarket = new web3.eth.Contract(JobMarket, CONTRACT_ADDRESSES.jobMarket);
    const jobId = 0;
    const worker = AGENTS[2].address; // Worker0
    await jobMarket.methods.acceptJob(jobId).send({ from: worker });
  };

  const handleCompleteJob = async () => {
    const jobMarket = new web3.eth.Contract(JobMarket, CONTRACT_ADDRESSES.jobMarket);
    const jobId = 0;
    const sender = AGENTS[0].address; // Vendor0
    await jobMarket.methods.completeJob(jobId).send({ from: sender });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🌐 Agent Town Dashboard</h1>

      <h2>🧑‍🤝‍🧑 Agents</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {AGENTS.map(agent => (
          <AgentCard key={agent.address} agent={agent} balance={balances[agent.address] || 0} />
        ))}
      </div>

      <h2>📋 Job Market</h2>
      <JobList jobs={jobs} />

      <div className="mt-10 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-4">⚙️ Controls</h2>

        <button
          onClick={handlePostJob}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          📮 Post Job (Vendor0)
        </button>

        <button
          onClick={handleAcceptJob}
          className="ml-4 bg-yellow-600 text-white px-4 py-2 rounded shadow"
        >
          ✅ Accept Job #0 (Worker0)
        </button>

        <button
          onClick={handleCompleteJob}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          ✔️ Complete Job #0 (Vendor0)
        </button>
      </div>
    </div>
  );
}

export default App;
