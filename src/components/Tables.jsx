import React from "react";
import { Link } from "react-router-dom";

// Table Component from Dashboad page and student page
export function Table({ user }) {
  return (
    <>
      <tr className="text-black items-center font-Nunito text-xs">
        <td className=" flex gap-2 items-center">
          <img
            className=" w-6 rounded-full h-6"
            src={user.image}
            alt="userImage"
          />
          <td className="py-2 font-semibold">{user.name}</td>
        </td>
        <td className="py-2 px-4">{user.phoneNumber}</td>
        {/* <td className="py-2 px-4">{user.dateCreated} </td> */}
        <td className="py-2 px-4">{user.email}</td>
        <td className="py-2 px-4">
          <Link to="/student/user-details">
            <button className="bg-[#DDD3FF] text-xs text-[#400167] hover:text-purple-100 px-4 py-2 rounded-[12px]">
              {user.action}
            </button>
          </Link>
        </td>
      </tr>
    </>
  );
}

// Category of Table Component from lesson page
export function TableCategory({ categories }) {
  return (
    <div className="mt-10 overflow-x-auto">
    <table className="w-full min-w-[640px] bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 bg-purple-100 text-left text-[#400167] text-[16px] font-semibold">
            Name
          </th>
          <th className="py-2 px-4 bg-purple-100 text-left text-[#400167] text-[16px] font-semibold">
            Date Created
          </th>
          <th className="py-2 px-4 bg-purple-100 text-left text-[#400167] text-[16px] font-semibold">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category, index) => (
          <tr
            key={index}
            className={`${index === categories.length - 1 ? "last-row" : ""}`}
          >
            <td className="py-4 px-4">{category.name}</td>
            <td className="py-4 px-4 w-[80%]">{category.dateCreated}</td>
            <td className="py-4 px-4 text-[#5002D0] font-semibold cursor-pointer hover:underline">
              View details
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

export const TableClassroom = ({
  data,
  searchTerm,
  selectedRow,
  setSelectedRow,
  onViewDetails,
}) => {
  const filteredData = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] bg-white">
      <thead>
        <tr>
          <th className="text-left py-3 px-2 uppercase font-semibold text-sm">
            Name
          </th>
          <th className="text-left py-3 px-2 uppercase font-semibold text-sm">
            Date Created
          </th>
          <th className="text-left py-3 px-2 uppercase font-semibold text-sm">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((item, index) => (
          <TableRow
            key={index}
            item={item}
            isSelected={selectedRow === index}
            onClick={() => setSelectedRow(index)}
            onViewDetails={onViewDetails}
          />
        ))}
      </tbody>
    </table>
    </div>
  );
};

export const TableRow = ({ item, onViewDetails, onClick }) => (
  <tr
    className={``}
    onClick={onClick}
  >
    <td className="py-3 px-2  text-[14px]">{item.name}</td>
    <td className="py-3 px-2 w-[70%] text-[14px]">{item.date}</td>
    <td className="py-3 px-2 text-purple-600 cursor-pointer  text-[14px] font-semibold">
      <button onClick={onViewDetails}>View Details</button>
    </td>
  </tr>
);
