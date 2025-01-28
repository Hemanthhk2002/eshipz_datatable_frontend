import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Flag, X } from "lucide-react";

const TableFromAPIMultiple = ({ apiUrl }: { apiUrl: string }) => {
  const [apiData, setApiData] = useState<any[]>([]); // State to hold API data
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [currentPage, setCurrentPage] = useState<number>(1); // State for current page
  const [rowsPerPage] = useState<number>(10); // Number of rows to show per page
  const [likedRows, setLikedRows] = useState<Set<number>>(new Set()); // State for heart icon toggle
  const [filters, setFilters] = useState<any>({
    ID: "",
    vehicle_number: "",
    origin: "",
    destination_name: "",
    tracking_mode: "",
    status: "",
    extrastatus: "",
  });

  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ totalPages: 0, currentPage: 1 }); // Pagination state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          ...filters,
        }).toString();

        const response = await fetch(`${apiUrl}?${query}`); // Send filters and pagination in query
        const data = await response.json();

        if (data && data.data) {
          setApiData(data.data);
          setPagination(data.pagination); // Set pagination data from response
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, currentPage, rowsPerPage, filters]);

  const toggleHeart = (id: number) => {
    setLikedRows((prevLikedRows) => {
      const updatedLikes = new Set(prevLikedRows);
      if (updatedLikes.has(id)) {
        updatedLikes.delete(id);
      } else {
        updatedLikes.add(id);
      }
      return updatedLikes;
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFilters((prevFilters: Record<string, string>) => {
      const updatedFilters = { ...prevFilters, [field]: e.target.value };
      updateActiveFilters(updatedFilters);
      return updatedFilters;
    });
  };

  const updateActiveFilters = (updatedFilters: any) => {
    const appliedFilters = Object.keys(updatedFilters)
      .filter((key) => updatedFilters[key] !== "")
      .map((key) => ({
        key,
        value: updatedFilters[key],
      }));
    setActiveFilters(appliedFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6">
        {/* Filter options */}
        <div className="w-full flex flex-col sm:flex-row justify-between mb-6 px-6">
          <div className="flex flex-wrap gap-4 mb-4 sm:mb-0">
            {/* Input fields for filters */}
            {["name", "vehicle_number", "origin", "destination_name", "tracking_mode", "status", "extrastatus"].map(
              (field) => (
                <div key={field} className="w-full sm:w-56">
                  <input
                    type="text"
                    placeholder={`${field}`}
                    value={filters[field]}
                    onChange={(e) => handleFilterChange(e, field)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )
            )}
          </div>

          {/* Applied filters and their count */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700">Filters Applied:</span>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-md"
                >
                  <span>{filter.key}: {filter.value}</span>
                  <X
                    onClick={() => {
                      const updatedFilters = { ...filters, [filter.key]: "" };
                      setFilters(updatedFilters);
                      updateActiveFilters(updatedFilters);
                    }}
                    className="cursor-pointer text-red-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto shadow-lg rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Name</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Status</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Route</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Created At</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Vehicle Info</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Last Update</th>
                <th className="px-6 py-3 text-center text-sm font-medium tracking-wide uppercase border-b border-gray-200">Comments</th>
              </tr>
            </thead>
            <tbody>
              {apiData.map((row, rowIndex) => (
                <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-indigo-100`}>
                  {/* Name with Heart Icon */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <Heart
                        className={`cursor-pointer ${likedRows.has(rowIndex) ? "text-red-500" : "text-gray-400"}`}
                        onClick={() => toggleHeart(rowIndex)}
                      />
                      {row.name}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    <div className="flex items-center justify-center">
                      <span
                        className={`font-semibold ${
                          row.status === "Driver Consent Pending"
                            ? "text-red-500 bg-red-400 bg-opacity-50 p-3 rounded-full"
                            : "text-green-500 bg-green-300 bg-opacity-50 p-3 rounded-full"
                        } flex items-center justify-center text-xs`}
                      >
                        <span>.{/* Big dot */}</span>
                        <span className="ml-2">
                          {row.status === "Driver Consent Pending"
                            ? "Driver Consent Pending"
                            : "Enroute to Destination"}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200 relative">
                    <div className="flex items-center justify-center gap-2">
                      {/* Green Flag for Origin */}
                      <Flag className="text-green-500" />
                      {/* Truncated Origin Text with Hover Box */}
                      <span className="text-green-500 block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap group relative">
                        {row.origin}
                        {/* Full Text on Hover */}
                        <div className="absolute hidden group-hover:block bg-green-200 text-black p-2 w-max z-10 top-full left-0 mt-1">
                          {row.origin}
                        </div>
                      </span>
                    </div>
                    <br />
                    <div className="flex items-center justify-center gap-2">
                      {/* Red Flag for Destination */}
                      <Flag className="text-red-500" />
                      {/* Truncated Destination Text with Hover Box */}
                      <span className="text-red-500 block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap group relative">
                        {row.destination_name}
                        {/* Full Text on Hover */}
                        <div className="absolute hidden group-hover:block bg-red-200 text-black p-2 w-max z-10 top-full left-0 mt-1">
                          {row.destination_name}
                        </div>
                      </span>
                    </div>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    <span className="text-green-500">.{row.created_at}</span>
                    <br />
                    <span className="text-red-500">.{row.eta}</span>
                  </td>

                  {/* Vehicle Info */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    {row.vehicle_number} | {row.tracking_mode}
                    <br />
                    {row.driver_number} ({row.tel_operator})
                  </td>

                  {/* Last Update */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    <span className={`text-gray-700 `}>{row.last_update}</span>
                    {/* If status is "DELAYED", show "Delayed" with red background */}
                    {row.extra_status === "DELAYED" && (
                      <span className="text-red-500 bg-red-200 p-2 rounded ml-2">
                        . Delayed
                      </span>
                    )}
                  </td>

                  {/* Comments */}
                  <td className="px-6 py-4 text-center text-sm text-gray-700 border-b border-gray-200">
                    <MessageSquare className="cursor-pointer text-blue-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 gap-4 pb-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Prev
          </button>
          <span className="flex items-center justify-center text-lg text-gray-700">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableFromAPIMultiple;
