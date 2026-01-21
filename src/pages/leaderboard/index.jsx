"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

const MOCK_USERS = [
  {
    id: 1,
    rank: 1,
    name: "Alex Martinez",
    level: 45,
    points: 12450,
    avatar: "🧑‍💼",
  },
  {
    id: 2,
    rank: 2,
    name: "Sophie Anderson",
    level: 42,
    points: 11890,
    avatar: "👩‍🦱",
  },
  {
    id: 3,
    rank: 3,
    name: "Ryan Thompson",
    level: 40,
    points: 10567,
    avatar: "👨‍🦰",
  },
  {
    id: 4,
    rank: 4,
    name: "Lily Foster",
    level: 38,
    points: 9823,
    avatar: "👩‍🦳",
  },
  {
    id: 5,
    rank: 5,
    name: "Devin Cremin",
    level: 35,
    points: 9100,
    avatar: "👨‍🦱",
  },
  {
    id: 6,
    rank: 6,
    name: "Victor Wilderman",
    level: 32,
    points: 8823,
    avatar: "👨‍🦲",
  },
  { id: 7, rank: 7, name: "Hope Swift", level: 30, points: 8523, avatar: "👩‍🦱" },
  {
    id: 8,
    rank: 8,
    name: "Sharon Pfannerstill",
    level: 28,
    points: 7000,
    avatar: "👩‍🦲",
  },
  {
    id: 9,
    rank: 9,
    name: "Marcus Johnson",
    level: 27,
    points: 6800,
    avatar: "👨‍💼",
  },
  {
    id: 10,
    rank: 10,
    name: "Emma Davis",
    level: 26,
    points: 6500,
    avatar: "👩‍🦱",
  },
];

const generateAllUsers = () => {
  const users = [...MOCK_USERS];
  for (let i = MOCK_USERS.length; i < 72; i++) {
    users.push({
      id: i + 1,
      rank: i + 1,
      name: `User ${i + 1}`,
      level: Math.max(1, 50 - i),
      points: Math.max(1000, 13000 - i * 100),
      avatar: "👤",
    });
  }
  return users;
};

const getRankBadgeColor = (rank) => {
  if (rank <= 3) return "bg-orange-500";
  if (rank <= 5) return "bg-purple-500";
  return "bg-purple-400";
};

const getRowBackground = (rank) => {
  return rank % 2 === 1 ? "bg-yellow-50" : "bg-gray-50";
};

export default function Leaderboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const allUsers = useMemo(() => generateAllUsers(), []);

  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = allUsers.slice(startIndex, startIndex + usersPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full  mx-auto p-6  rounded-lg">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-gray-900">All Users</h1>

      {/* Leaderboard Table */}
      <div className="space-y-2 mb-6">
        {currentUsers.map((user) => (
          // <div
          //   key={user.id}
          //   className={`flex items-center justify-between px-6 py-4 rounded-lg ${getRowBackground(
          //     user.rank,
          //   )}`}
          // >
          //   {/* Left: Rank and User Info */}
          //   <div className="flex items-center gap-4">
          //     {/* Rank Badge */}
          //     <div
          //       className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ${getRankBadgeColor(
          //         user.rank,
          //       )}`}
          //     >
          //       {user.rank}
          //     </div>

          //     {/* Avatar */}
          //     <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
          //       {user.avatar}
          //     </div>

          //     {/* Name and Level */}
          //     <div>
          //       <p className="font-bold text-gray-900">{user.name}</p>
          //       <p className="text-sm text-gray-600">Level {user.level}</p>
          //     </div>
          //   </div>

          //   {/* Middle: Points */}
          //   <div className="flex flex-col items-center justify-center text-left">
          //     <p className="font-bold text-gray-900">
          //       {user.points.toLocaleString()}
          //     </p>
          //     <p className="text-sm text-gray-600">points</p>
          //   </div>

          //   {/* Right: View Details Link */}
          //   <Link to="/leaderboard/leaderboard-details">
          //     <div
          //       href="#"
          //       className="text-purple-600 hover:text-purple-700 font-bold text-sm"
          //     >
          //       View details
          //     </div>
          //   </Link>
          // </div>

          <div
            key={user.id}
            className={`flex items-center justify-between px-6 py-4 rounded-lg ${getRowBackground(
              user.rank,
            )} h-20`} // fixed row height
          >
            {/* Left: Rank and User Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Rank Badge */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ${getRankBadgeColor(
                  user.rank,
                )}`}
              >
                {user.rank}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-2xl flex-shrink-0">
                {user.avatar}
              </div>

              {/* Name and Level */}
              <div className="min-w-0">
                {" "}
                {/* min-w-0 + truncate prevents wrapping */}
                <p className="font-bold text-gray-900 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-sm text-gray-600 leading-tight">
                  Level {user.level}
                </p>
              </div>
            </div>

            {/* Middle: Points (fixed width and vertically centered) */}
            <div className="w-40 flex flex-col items-center justify-center h-full text-center">
              <p className="font-bold text-gray-900 leading-tight">
                {user.points.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 leading-tight">points</p>
            </div>

            {/* Right: View Details Link (fixed width, right aligned) */}
            <div className="w-40 text-right">
              <Link
                to="/leaderboard/leaderboard-details"
                className="text-purple-600 hover:text-purple-700 font-bold text-sm"
              >
                View details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-
          {Math.min(startIndex + usersPerPage, allUsers.length)} of{" "}
          {allUsers.length} users
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            const pageNum = currentPage + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`w-10 h-10 rounded font-medium text-sm ${
                  currentPage === pageNum
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
