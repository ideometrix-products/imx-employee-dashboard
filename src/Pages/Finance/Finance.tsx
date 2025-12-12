import React from 'react';

const financeData = [
  {
    month: 'January',
    income: '$5000',
    description: 'Freelance Projects',
    status: 'Received',
  },
  {
    month: 'February',
    income: '$3200',
    description: 'Web App Payment',
    status: 'Pending',
  },

];

const Finance = () => {
  return (
    <div className="p-6  min-h-screen text-black">
      <h2 className="text-2xl font-semibold mb-4">Finance Overview</h2>
      <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
        <table className="min-w-full table-auto text-left">
          <thead>
            <tr className="border-b border-[#f4f7fa]">
              <th className="py-2 px-4">Month</th>
              <th className="py-2 px-4">Income</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {financeData.map((entry, index) => (
              <tr key={index} className="border-t border-[#f4f7fa]0">
                <td className="py-2 px-4">{entry.month}</td>
                <td className="py-2 px-4">{entry.income}</td>
                <td className="py-2 px-4">{entry.description}</td>
                <td className="py-2 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${entry.status === 'Received'
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-500 text-white'
                      }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finance;
