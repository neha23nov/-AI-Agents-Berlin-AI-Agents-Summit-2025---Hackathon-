// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgentToken.sol";

contract JobMarket {
    struct Job {
        uint id;
        address employer;
        address worker;
        string description;
        uint payment;
        bool isTaken;
        bool isCompleted;
    }

    AgentToken public token;
    uint public jobCounter;
    mapping(uint => Job) public jobs;

    event JobPosted(uint jobId, address employer, uint payment, string description);
    event JobAccepted(uint jobId, address worker);
    event JobCompleted(uint jobId);

    /// @notice Set token address during deployment
    constructor(address tokenAddress) {
        token = AgentToken(tokenAddress);
    }

    /// @notice Post a new job (must approve tokens first)
    function postJob(string memory desc, uint payment) external {
        require(payment > 0, "Payment must be > 0");
        require(bytes(desc).length > 0, "Description required");

        // Transfer tokens from employer to this contract
        require(token.transferFrom(msg.sender, address(this), payment), "Token transfer failed");

        jobs[jobCounter] = Job({
            id: jobCounter,
            employer: msg.sender,
            worker: address(0),
            description: desc,
            payment: payment,
            isTaken: false,
            isCompleted: false
        });

        emit JobPosted(jobCounter, msg.sender, payment, desc);
        jobCounter++;
    }

    /// @notice Accept an available job
    function acceptJob(uint jobId) external {
        require(jobId < jobCounter, "Invalid jobId");
        Job storage job = jobs[jobId];
        require(!job.isTaken, "Job already taken");

        job.worker = msg.sender;
        job.isTaken = true;

        emit JobAccepted(jobId, msg.sender);
    }

    /// @notice Mark job as complete and transfer payment
    function completeJob(uint jobId) external {
        require(jobId < jobCounter, "Invalid jobId");
        Job storage job = jobs[jobId];

        require(msg.sender == job.employer, "Only employer can confirm");
        require(job.isTaken && !job.isCompleted, "Invalid job state");

        job.isCompleted = true;

        // Send tokens from contract to worker
        require(token.transfer(job.worker, job.payment), "Token payout failed");

        emit JobCompleted(jobId);
    }

    /// @notice Get job details
    function getJob(uint jobId) external view returns (Job memory) {
        require(jobId < jobCounter, "Invalid jobId");
        return jobs[jobId];
    }
}
