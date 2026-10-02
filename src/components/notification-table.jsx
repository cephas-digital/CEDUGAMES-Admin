import React from "react";
import { Link } from "react-router-dom";

export default function NotificationTable() {
  const notifications = [
    {
      summary: "New Game Release: 'Adventure Island'",
      date: "2024-03-15",
      recipient: "All Users",
      type: "Email",
    },
    {
      summary: "Maintenance Alert: Server Upgrade",
      date: "2024-03-10",
      recipient: "All Users",
      type: "Push",
    },
    {
      summary: "Personalized Learning Path Update",
      date: "2024-03-05",
      recipient: "Premium Users",
      type: "Email",
    },
    {
      summary: "Achievement Unlocked: 'Puzzle Master'",
      date: "2024-02-28",
      recipient: "Individual User",
      type: "Email",
    },
    {
      summary: "Welcome New Users to BrainBuilders!",
      date: "2024-02-20",
      recipient: "New Users",
      type: "Push",
    },
    {
      summary: "Welcome New Users to BrainBuilders!",
      date: "2024-02-20",
      recipient: "New Users",
      type: "Push",
    },
    {
      summary: "New Game Release: 'Adventure Island'",
      date: "2024-03-15",
      recipient: "All Users",
      type: "Email",
    },
    {
      summary: "Welcome New Users to EduFun!",
      date: "2024-02-20",
      recipient: "New Users",
      type: "Push",
    },

    {
      summmary: "Welcome New Users to BrainBuilders!",
      date: "2024-02-20",
      recipient: "New Users",
      type: "Push",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-[#9B5DE5] bg-white">
      <table className="min-h-[711px] w-full min-w-[760px] text-left text-base">
        <thead className="bg-purple-50">
          <tr className="text-gray-700">
            <th className="p-4 font-medium">Summary</th>
            <th className="p-4 font-medium">Date</th>
            <th className="p-4 font-medium">Recipient Type</th>
            <th className="p-4 font-medium">Notification Type</th>
            <th className="p-4 font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {notifications.map((item, index) => (
            <tr
              key={index}
              className="border-t"
            >
              <td className="p-4 font-semibold text-gray-800">
                {item.summary}
              </td>
              <td className="p-4">{item.date}</td>
              <td className="p-4">{item.recipient}</td>
              <td className="p-4 font-semibold">{item.type}</td>
              <Link to="/notifications/view-notification">
                <td className="p-4">
                  <button className="text-purple-600 hover:underline text-base font-bold">
                    View details
                  </button>
                </td>
              </Link>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
