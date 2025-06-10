import React from "react";

const statusColors = {
  Posted: "bg-blue-100 text-blue-800",
  Accepted: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
};

const JobList = ({ jobs }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">📋 Active Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-semibold">{job.description}</div>
            <div className="text-gray-600 mt-1">
              💰 <span className="font-medium">{job.reward}</span> tokens
            </div>
            <div className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${statusColors[job.status]}`}>
              {job.status}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              👷 Worker: {job.worker === "0x0000000000000000000000000000000000000000" ? "—" : job.worker.slice(0, 6) + "..." + job.worker.slice(-4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobList;
