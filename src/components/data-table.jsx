"use client";

import { useState } from "react";

export default function DataTable({
  data = [],
  columns = [],
  itemsPerPage = 8,
  title = "",
  onActionClick = null,
  getRowClassName = null,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const renderCell = (row, column) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  return (
    <div className="w-full bg-white p-8">
      {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={`hover:bg-gray-50 transition-colors ${
                  getRowClassName ? getRowClassName(row) : ""
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id || idx}-${column.key}`}
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-gray-600">
          Showing {data.length ? startIndex + 1 : 0}-
          {Math.min(startIndex + itemsPerPage, data.length)} of {data.length}{" "}
          {data.length === 1 ? "item" : "items"}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-purple-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={handleNext}
            disabled={totalPages === 0 || currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
