import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Heart, MessageSquare, Flag, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TableFromAPIMultiple = ({ apiUrl }: { apiUrl: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rowsPerPage] = useState<number>(10);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [likedRows, setLikedRows] = useState<Set<string>>(new Set());
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<{ [key: string]: string }>({});

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideIn = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  };

  const filterModal = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: rowsPerPage.toString(),
          ...filters,
        }).toString();

        const response = await fetch(`${apiUrl}?${query}`);
        const data = await response.json();

        if (data && data.data) {
          setData(data.data);
          setPageCount(data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, currentPage, rowsPerPage, filters]);

  const toggleHeart = (name: string) => {
    setLikedRows((prev) => {
      const updated = new Set(prev);
      updated.has(name) ? updated.delete(name) : updated.add(name);
      return updated;
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setIsFilterModalOpen(false);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  const activeFilters = Object.keys(filters).filter((key) => filters[key]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Heart
            className={`cursor-pointer ${
              likedRows.has(row.original.name)
                ? "text-red-500"
                : "text-gray-400"
            }`}
            onClick={() => toggleHeart(row.original.name)}
          />
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div className="text-center text-sm">
            <span
              className={`font-semibold ${
                status === "Driver Consent Pending"
                  ? "text-red-500 bg-red-400 bg-opacity-50 p-3 rounded-md "
                  : "text-green-500 bg-green-300 bg-opacity-50 p-3 rounded-md "
              }`}
            >
              {status === "Driver Consent Pending"
                ? "Driver Consent Pending"
                : "Enroute to Destination"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "route",
      header: "Route",
      cell: ({ row }) => {
        const origin = row.original.origin;
        const destination = row.original.destination_name;
        const [showOriginDetails, setShowOriginDetails] = useState<
          string | null
        >(null);
        const [showDestinationDetails, setShowDestinationDetails] = useState<
          string | null
        >(null);

        return (
          <div className="text-center text-sm relative">
            {/* Origin */}
            <div className="flex items-center justify-center gap-2">
              <Flag className="text-green-500" />
              <span
                className="text-green-500 block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap group relative cursor-pointer"
                onMouseEnter={() => setShowOriginDetails(origin)}
                onMouseLeave={() => setShowOriginDetails(null)}
              >
                {origin}
                {showOriginDetails === origin && (
                  <div className="absolute bg-green-200 text-black p-2 w-max z-10 top-full left-0 mt-1">
                    {origin}
                  </div>
                )}
              </span>
            </div>

            <br />

            {/* Destination */}
            <div className="flex items-center justify-center gap-2">
              <Flag className="text-red-500" />
              <span
                className="text-red-500 block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap group relative cursor-pointer"
                onMouseEnter={() => setShowDestinationDetails(destination)}
                onMouseLeave={() => setShowDestinationDetails(null)}
              >
                {destination}
                {showDestinationDetails === destination && (
                  <div className="absolute bg-red-200 text-black p-2 w-max z-10 top-full left-0 mt-1">
                    {destination}
                  </div>
                )}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "timestamps",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {/* Format created_at */}
          <span className="text-green-500">
            {new Date(row.original.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <br />
            {new Date(row.original.created_at).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>

          <br />

          {/* Format eta */}
          <span className="text-red-500">
            {new Date(row.original.eta).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            <br />
            {new Date(row.original.eta).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "vehicle_info",
      header: "Vehicle Info",
      cell: ({ row }) => (
        <div className="text-center text-gray-700">
          {row.original.vehicle_number} | {row.original.tracking_mode}
          <br />
          {row.original.driver_number} ({row.original.tel_operator})
        </div>
      ),
    },
    {
      accessorKey: "last_update",
      header: "Last Update",
      cell: ({ row }) => {
        const [showDetails, setShowDetails] = useState<string | null>(null);

        const handleDetailsToggle = (name: string | null) => {
          setShowDetails(name);
        };

        return (
          <div className="text-center text-sm relative">
            <span
              className="text-gray-700 cursor-pointer hover:underline group relative"
              onMouseEnter={() => handleDetailsToggle(row.original.name)}
              onMouseLeave={() => handleDetailsToggle(null)}
            >
              {row.original.last_update.length > 10
                ? `${row.original.last_update.substring(0, 10)}...`
                : row.original.last_update}

              {/* Show full text on hover */}
              {showDetails === row.original.name && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-max bg-white shadow-lg border p-2 rounded text-gray-700 z-10">
                  {row.original.last_update}
                </div>
              )}
            </span>

            {/* Show "Delayed" status */}
            {row.original.extra_status === "DELAYED" && (
              <span className="text-red-500 bg-red-200 p-2 rounded ml-2">
                Delayed
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: () => <MessageSquare className="text-gray-500" />,
    },
  ];

  // Function to check if any data matches the filters
  const hasMatchingData = () => {
    if (Object.keys(filters).length === 0) return true;
    
    return data.some(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(item[key])?.toLowerCase().includes(value.toLowerCase());
      });
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filters.name || "",
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filter Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Data Overview</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full"
                >
                  {activeFilters.length}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              {...slideIn}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {activeFilters.map((filter) => (
                <motion.span
                  key={filter}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm"
                >
                  <span className="font-medium">{filter}:</span>
                  <span>{filters[filter]}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => clearFilter(filter)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              {...filterModal}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 p-6"
            >
              <div className="flex flex-wrap gap-6 justify-between">
                {[
                  "name",
                  "origin",
                  "destination_name",
                  "vehicle_number",
                  "tracking_mode",
                  "status",
                ].map((field) => (
                  <div key={field} className="flex-1 min-w-[200px]">
                    <label
                      htmlFor={field}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.replace("_", " ").toUpperCase()}
                    </label>
                    <input
                      type="text"
                      id={field}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                               transition-all duration-200"
                      value={tempFilters[field] || ""}
                      onChange={(e) =>
                        handleFilterChange(field, e.target.value)
                      }
                      placeholder={`Filter by ${field.toLowerCase()}`}
                    />
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    className="bg-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-400"
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full">
        <thead className="bg-white border-b border-gray-100">
  {table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th
          key={header.id}
          className="px-6 py-3 text-center text-sm font-medium text-gray-600"
        >
          {flexRender(header.column.columnDef.header, header.getContext())}
        </th>
      ))}
    </tr>
  ))}
</thead>
          {!hasMatchingData() ? (
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-16"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No matches found
                    </h3>
                    <p className="text-gray-500 text-center mb-4 max-w-md">
                      We couldn't find any results matching your search criteria
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters({})}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      Clear filters
                    </motion.button>
                  </motion.div>
                </td>
              </tr>
            </motion.tbody>
          ) : data.length === 0 ? (
            <motion.tbody
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="text-center py-16"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No trips available
                    </h3>
                    <p className="text-gray-500 text-center">
                      There are currently no trips in the system
                    </p>
                  </div>
                </td>
              </tr>
            </motion.tbody>
          ) : (
            <motion.tbody>
              {table.getRowModel().rows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 border-b border-gray-50 last:border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 text-sm text-gray-600"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>

      {/* Pagination Section */}
      <div className="border-t border-gray-100">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
            >
              Previous
            </button>
            <div className="text-gray-700">
              Page {currentPage} of {pageCount}
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pageCount}
              className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(Math.min(5, pageCount))].map((_, i) => {
              const pageNumber = currentPage - 2 + i;
              if (pageNumber > 0 && pageNumber <= pageCount) {
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 rounded-lg ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNumber}
                  </motion.button>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TableFromAPIMultiple;
