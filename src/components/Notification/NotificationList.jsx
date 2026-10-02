import React from "react";
import NotificationDetail from "./NotificationDetail";

export default function NotificationList({ notifications }) {
  return (
    <div className="overflow-x-auto">
    <table className="w-full min-w-[680px] font-satoshi">
      <thead className=" text-[#400167] text-left">
        <tr>
          <th className="py-2">Title</th>
          <th className="py-2">Body</th>
          <th className="py-2">Date sent</th>
          <th className="py-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((notification, index) => (
          <tr
            key={index}
            className=""
          >
            <td className="py-2 w-1/5">{notification.title}</td>
            <td className="py-2 w-1/3">{notification.body}</td>
            <td className="py-2 w-1/3">{notification.date}</td>
            <td className="py-2 w-1/3">
              <button
                onClick={NotificationDetail}
                className="bg-[#DDD3FF] text-[#5002D0] px-4 py-2 rounded-[12px]"
              >
                View details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
