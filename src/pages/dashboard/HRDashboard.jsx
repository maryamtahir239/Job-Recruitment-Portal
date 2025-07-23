import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import uploadSvgImage from "@/assets/images/svg/upload.svg";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Button from "../../components/ui/Button";

const HRDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [files, setFiles] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const handleReset = () => {
    setFiles([]);
    setCandidates([]);
  };

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: {
      "image/*": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "text/csv": [],
    },
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      parseFile(acceptedFiles[0]);
    },
  });

  const parseFile = (file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        setCandidates(data);
      };
      reader.readAsBinaryString(file);
    } else if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (result) => {
          setCandidates(result.data);
        },
      });
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6">
       
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.name || "HR"}!
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          You are logged in as{" "}
          <span className="font-semibold text-blue-600">{user?.role}</span>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Manage HR tasks and perform your duties effectively through the dashboard.
        </p>

        {/* DropZone Section */}
        <div className="w-full text-center border-dashed border border-gray-400 rounded-lg py-[52px] flex flex-col justify-center items-center mb-4">
          {files.length === 0 ? (
            <div {...getRootProps({ className: "dropzone" })}>
              <input className="hidden" {...getInputProps()} />
              <img src={uploadSvgImage} alt="Upload" className="mx-auto mb-4" />
              {isDragAccept ? (
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Drop the files here ...
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Drop files here or click to upload (Images, Excel, Word).
                </p>
              )}
            </div>
          ) : (
            <p className="text-blue-600 font-medium text-sm">
              File uploaded successfully!
            </p>
          )}
        </div>

        
        {files.length === 0 && (
          <p className="text-sm text-gray-600">Upload Candidate List</p>
        )}

       
        <div className="mt-8">
          {candidates.length > 0 && (
            <h2 className="text-xl font-semibold mb-3">Candidate Information</h2>
          )}
          {candidates.length === 0 ? (
            <p>No candidates found. Please upload a valid file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Designation</th>
                    <th className="p-2 border">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <tr key={index}>
                      <td className="p-2 border">{candidate.name}</td>
                      <td className="p-2 border">{candidate.email}</td>
                      <td className="p-2 border">{candidate.phone}</td>
                      <td className="p-2 border">{candidate.designation}</td>
                      <td className="p-2 border">{candidate.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Buttons */}
          {(candidates.length > 0 || files.length > 0) && (
            <div className="mt-6 flex justify-center gap-4">
              {candidates.length > 0 && (
                <Button
                  text="Send Form Link"
                  className="btn-primary px-6 py-2"
                />
              )}
              <Button
                onClick={handleReset}
                className="btn-primary px-6 py-2"
                 text="Reset"
              />
               
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
