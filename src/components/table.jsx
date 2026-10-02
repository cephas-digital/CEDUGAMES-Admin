import React from "react";

const Table = ({ columns, data, rowKey = "id" }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-h-[360px] w-full min-w-[760px] rounded-xl border border-[#DBDEE5] bg-white shadow-sm">
        <thead>
          <tr className="border-b border-gray-300">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="text-left py-3 px-4 font-semibold text-gray-700 text-base"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row[rowKey] || idx}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              {columns.map((col) => (
                <td
                  key={col.accessor}
                  className="py-3 px-6 text-base text-[#61708A]"
                >
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
