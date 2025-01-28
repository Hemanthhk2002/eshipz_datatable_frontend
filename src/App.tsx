// src/App.tsx
import React from "react";
import DataTable from "./components/DataTable";
import "./index.css";

const App: React.FC = () => {
  const apiUrl = "http://localhost:5001/data";
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-6xl font-medium text-center  text-black mb-6">Data Table</h1>
        <DataTable apiUrl={apiUrl}/>
      </div>
    </div>
  );
};

export default App;
