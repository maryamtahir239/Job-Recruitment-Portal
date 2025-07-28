import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import uploadSvgImage from "@/assets/images/svg/upload.svg";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Button from "@/components/ui/Button";
import SendInviteModal from "@/components/SendInviteModal";
import axios from "axios";
import { toast } from "react-toastify";


const headerMap = {
  name: ["name", "full name", "candidate name", "applicant name"],
  email: ["email", "e-mail", "mail", "candidate email"],
  phone: ["phone", "mobile", "contact", "cell"],
  designation: ["designation", "title", "position", "job title"],
  location: ["location", "city", "place", "area"],
};


function normalizeRow(rawRow, idx) {
  const tempId = `${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`;
  const norm = { tempId: tempId };

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
  const [candidates, setCandidates] = useState([]);
  const [importedCandidates, setImportedCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  // New state to track the count of unique emails that have been sent invites
  const [sentEmailsCount, setSentEmailsCount] = useState(0);

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles([]);
    setCandidates([]);
    setImportedCandidates([]);
    setSelectedIds(new Set());
    setSentEmailsCount(0); // Reset sent count on new file upload

    if (acceptedFiles.length === 0) {
      toast.warn("No files were accepted. Please upload Excel (.xlsx, .xls) or CSV (.csv).");
      return;
    }

    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      )
    );
    parseFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx", ".xls"],
      "text/csv": [".csv"],
    },
    onDrop,
    multiple: false,
  });

  const parseFile = (file) => {
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx" || fileExtension === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw = XLSX.utils.sheet_to_json(ws);

          if (raw.length === 0) {
            toast.warn("The uploaded Excel file is empty or has no data rows.");
            setCandidates([]);
            setSelectedIds(new Set());
            return;
          }

          const norm = raw.map((r, i) => normalizeRow(r, i));
          setCandidates(norm);
          setSelectedIds(new Set(norm.map((r) => r.tempId)));
          toast.success(`${norm.length} candidates parsed from Excel.`);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          toast.error("Failed to parse Excel file. Please ensure it's a valid format.");
          setCandidates([]);
          setSelectedIds(new Set());
        }
      };
      reader.readAsBinaryString(file);
    } else if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            console.warn("CSV parsing errors:", result.errors);
            toast.warn("Some issues detected in CSV file. Check console for details.");
          }
          if (result.data.length === 0) {
            toast.warn("The uploaded CSV file is empty or has no data rows.");
            setCandidates([]);
            setSelectedIds(new Set());
            return;
          }
          const norm = result.data.map((r, i) => normalizeRow(r, i));
          setCandidates(norm);
          setSelectedIds(new Set(norm.map((r) => r.tempId)));
          toast.success(`${norm.length} candidates parsed from CSV.`);
        },
        error: (err) => {
          console.error("Error parsing CSV file:", err);
          toast.error("Failed to parse CSV file. Please ensure it's a valid format.");
          setCandidates([]);
          setSelectedIds(new Set());
        },
      });
    } else {
      console.warn("Unsupported file type", fileExtension);
      toast.error("Unsupported file type. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      setCandidates([]);
      setSelectedIds(new Set());
      setImportedCandidates([]);
    }
  };

  const toggleRow = (tempId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };

  const toggleAll = (checked) => {
    const currentCandidatesList = importedCandidates.length > 0 ? importedCandidates : candidates;
    const allDisplayTempIds = currentCandidatesList.map((c) => c.tempId);
    setSelectedIds(checked ? new Set(allDisplayTempIds) : new Set());
  };

  async function importToServer() {
    if (isImporting) {
        toast.info("Import process already in progress. Please wait.");
        return [];
    }

    if (importedCandidates.length > 0) {
        return importedCandidates;
    }

    if (!candidates.length) {
        toast.warn("No candidates to import. Please upload a file first.");
        return [];
    }

    setIsImporting(true);

    try {
      const { data } = await axios.post("/api/candidates/import", { candidates });

      if (data.success) {
        setImportedCandidates(data.candidates); 
        return data.candidates;
      } else {
        toast.error(data.message || "Failed to import candidates to server.");
        return [];
      }
    } catch (err) {
      console.error("Import failed:", err);
      toast.error(err.response?.data?.message || "Server error during import. Please try again.");
      return [];
    } finally {
      setIsImporting(false);
    }
  }

  // Callback from SendInviteModal when invites are successfully sent
  const handleSendSuccess = (countSent) => {
    setSentEmailsCount(prevCount => prevCount + countSent);
    setModalOpen(false); // Close modal
  };

  const openSendModal = async () => {
    if (selectedIds.size === 0) {
      toast.warn("Please select at least one candidate to send invites.");
      return;
    }

    const importedResult = await importToServer();
    
    if (importedResult.length > 0 && selectedCandidates.length > 0) {
      setModalOpen(true);
    } else {
      if (selectedCandidates.length === 0 && selectedIds.size > 0) {
          toast.warn("Selected candidates either have duplicate emails or invalid data, no unique candidates found for invite.");
      } else {
          toast.error("Could not prepare selected candidates for sending invites. Please try again.");
      }
    }
  };

  const handleModalClose = () => setModalOpen(false);

  const selectedCandidates = useMemo(() => {
    let currentSelected = [];
    if (importedCandidates.length > 0) {
      currentSelected = importedCandidates.filter((c) => selectedIds.has(c.tempId));
    } else {
      currentSelected = candidates.filter(c => selectedIds.has(c.tempId));
    }

    const uniqueEmails = new Set();
    const deDuplicatedCandidates = [];
    currentSelected.forEach(candidate => {
      if (candidate.email && typeof candidate.email === 'string' && candidate.email.trim() !== '') {
        const lowerCaseEmail = candidate.email.toLowerCase().trim();
        if (!uniqueEmails.has(lowerCaseEmail)) {
          uniqueEmails.add(lowerCaseEmail);
          deDuplicatedCandidates.push(candidate);
        }
      }
    });
    return deDuplicatedCandidates;
  }, [importedCandidates, candidates, selectedIds]);


  const candidatesToDisplay = importedCandidates.length > 0 ? importedCandidates : candidates;

  const isAllSelected = useMemo(() => {
    if (candidatesToDisplay.length === 0) return false;
    return candidatesToDisplay.every(c => selectedIds.has(c.tempId));
  }, [candidatesToDisplay, selectedIds]);

  // Calculate the total number of unique candidates (by email) available in the current table
  const totalUniqueCandidatesInTable = useMemo(() => {
    const allCandidates = importedCandidates.length > 0 ? importedCandidates : candidates;
    const uniqueEmails = new Set();
    allCandidates.forEach(c => {
      if (c.email && typeof c.email === 'string' && c.email.trim() !== '') {
        uniqueEmails.add(c.email.toLowerCase().trim());
      }
    });
    return uniqueEmails.size;
  }, [candidates, importedCandidates]);

  // Determine if all unique candidates have been sent invites
  const areAllUniqueCandidatesSent = 
    totalUniqueCandidatesInTable > 0 && sentEmailsCount >= totalUniqueCandidatesInTable;

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 mt-10 w-full max-w-6xl">
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

        {/* Dropzone Area - Apply getRootProps and getInputProps to the main container */}
        <div 
          {...getRootProps({ className: "w-full text-center border-dashed border border-gray-400 rounded-lg py-[52px] flex flex-col justify-center items-center mb-4 cursor-pointer" })}
        >
          <input className="hidden" {...getInputProps()} />
          {files.length === 0 ? (
            <>
              <img src={uploadSvgImage} alt="Upload" className="mx-auto mb-4" />
              {isDragAccept ? (
                <p className="text-sm text-green-600">Drop the files here ...</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Drop files here or click to upload (Excel / CSV).
                </p>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-700">
              File uploaded: <span className="font-medium">{files[0].name}</span>
              <p className="text-xs text-gray-500 mt-1">
                (Click the upload area again to change file)
              </p>
            </div>
          )}
        </div>

        {/* Candidate Table */}
        <div className="mt-8 text-left">
          <h2 className="text-xl font-semibold mb-3 text-center">Candidate's Information</h2>
          {candidatesToDisplay.length === 0 ? (
            <p className="text-center text-gray-500">No candidates found. Please upload a valid file to get started.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border-r border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                      />
                    </th>
                    <th className="p-3 border-r border-gray-200 text-left text-gray-700 font-semibold">Name</th>
                    <th className="p-3 border-r border-gray-200 text-left text-gray-700 font-semibold">Email</th>
                    <th className="p-3 border-r border-gray-200 text-left text-gray-700 font-semibold">Phone</th>
                    <th className="p-3 border-r border-gray-200 text-left text-gray-700 font-semibold">Designation</th>
                    <th className="p-3 text-left text-gray-700 font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {candidatesToDisplay.map(
                    (candidate, index) => (
                      <tr key={candidate.tempId} className={`hover:bg-blue-50 transition duration-150 ease-in-out`}>
                        <td className="p-3 border-r border-gray-200 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(candidate.tempId)}
                            onChange={() => toggleRow(candidate.tempId)}
                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                          />
                        </td>
                        <td className="p-3 border-r border-gray-200">{candidate.name || '-'}</td>
                        <td className="p-3 border-r border-gray-200">{candidate.email || '-'}</td>
                        <td className="p-3 border-r border-gray-200">{candidate.phone || '-'}</td>
                        <td className="p-3 border-r border-gray-200">{candidate.designation || '-'}</td>
                        <td className="p-3">{candidate.location || '-'}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Send Form Link Button */}
        {(candidates.length > 0 || importedCandidates.length > 0) && (
          <div className="mt-6 flex justify-center">
            <Button
              text={
                areAllUniqueCandidatesSent
                  ? `Emails sent to all candidates (${sentEmailsCount})`
                  : isImporting
                    ? "Importing..."
                    : selectedCandidates.length
                      ? `Send Form Link (${selectedCandidates.length})`
                      : "Send Form Link"
              }
              className="px-6 py-2 btn-primary text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={openSendModal}
              // Disable if importing, no unique candidates selected, or all unique candidates already sent
              disabled={isImporting || selectedCandidates.length === 0 || areAllUniqueCandidatesSent}
            />
          </div>
        )}
      </div>

      {/* Send Invite Modal */}
      <SendInviteModal
        open={modalOpen}
        onClose={handleModalClose}
        selectedCandidates={selectedCandidates}
        onSendSuccess={handleSendSuccess} // Pass the new callback to the modal
      />
    </div>
  );
};

export default HRDashboard;