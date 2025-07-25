// src/pages/dashboard/HRDashboard.jsx
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import uploadSvgImage from "@/assets/images/svg/upload.svg";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Button from "@/components/ui/Button";
import SendInviteModal from "@/components/SendInviteModal";
import axios from "axios";

// Normalize header names from uploaded file to internal keys
const headerMap = {
  name: ["name", "full name", "candidate name", "applicant name"],
  email: ["email", "e-mail", "mail", "candidate email"],
  phone: ["phone", "mobile", "contact", "cell"],
  designation: ["designation", "title", "position", "job title"],
  location: ["location", "city", "place", "area"],
};

function normalizeRow(rawRow, idx) {
  const norm = { tempId: `${Date.now()}_${idx}` }; // Temporary ID
  const lowerKeys = Object.keys(rawRow).reduce((acc, k) => {
    acc[k.toLowerCase().trim()] = rawRow[k];
    return acc;
  }, {});
  for (const key in headerMap) {
    const candidates = headerMap[key];
    const found = candidates.find((cand) => lowerKeys.hasOwnProperty(cand));
    norm[key] = found ? lowerKeys[found] : "";
  }
  return norm;
}


const HRDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [files, setFiles] = useState([]);
  const [candidates, setCandidates] = useState([]); // parsed candidates (before import)
  const [importedCandidates, setImportedCandidates] = useState([]); // DB candidates with IDs
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  // Dropzone handler
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )
    );
    if (acceptedFiles.length) parseFile(acceptedFiles[0]);
  }, []);

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
    } else {
      console.warn("Unsupported file type", fileExtension);
    }
  };

  
  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  
  const toggleAll = (checked) => {
    const ids = importedCandidates.length
      ? importedCandidates.map((c) => c.id)
      : candidates.map((c) => c.tempId);
    setSelectedIds(checked ? new Set(ids) : new Set());
  };

  // Import candidate list to backend
  async function importToServer() {
    if (!candidates.length) return [];
    try {
      const { data } = await axios.post("/api/candidates/import", { candidates });
      setImportedCandidates(data.candidates);
      setSelectedIds(new Set(data.candidates.map((c) => c.id)));
      return data.candidates;
    } catch (err) {
      console.error("Import failed", err);
      return [];
    }
  }

  // Open send invite modal
  const openSendModal = async () => {
    const imported = await importToServer();
    if (imported.length > 0) setModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => setModalOpen(false);

  // Prepare selected candidates (always from importedCandidates after DB import)
  const selectedCandidates = importedCandidates.filter((c) => selectedIds.has(c.id));

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
          Upload a candidate list (Excel / CSV), review details, and send application form links.
        </p>

        {/* Dropzone */}
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
                <p className="text-sm text-gray-500">
                  Drop files here or click to upload (Excel / CSV).
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
                    <th className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size ===
                          (importedCandidates.length || candidates.length)
                        }
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Phone</th>
                    <th className="p-2 border">Designation</th>
                    <th className="p-2 border">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {(importedCandidates.length > 0 ? importedCandidates : candidates).map(
                    (candidate) => (
                      <tr key={candidate.id || candidate.tempId} className="border-t hover:bg-gray-50">
                        <td className="p-2 border text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(candidate.id || candidate.tempId)}
                            onChange={() => toggleRow(candidate.id || candidate.tempId)}
                          />
                        </td>
                        <td className="p-2 border">{candidate.name}</td>
                        <td className="p-2 border">{candidate.email}</td>
                        <td className="p-2 border">{candidate.phone}</td>
                        <td className="p-2 border">{candidate.designation}</td>
                        <td className="p-2 border">{candidate.location}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Send Form Link */}
        {(candidates.length > 0 || importedCandidates.length > 0) && (
          <div className="mt-6 flex justify-center">
            <Button
              text={
                selectedIds.size
                  ? `Send Form Link (${selectedIds.size})`
                  : "Send Form Link"
              }
              className="btn-primary px-6 py-2"
              onClick={openSendModal}
            />
           
          </div>
        )}
      </div>

      <SendInviteModal
        open={modalOpen}
        onClose={handleModalClose}
        selectedCandidates={selectedCandidates}
      />
    </div>
  );
};

export default HRDashboard;
