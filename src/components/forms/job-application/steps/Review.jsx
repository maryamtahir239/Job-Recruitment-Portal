import React from 'react';

const Review = ({ data, errors, isValid, selectedPhoto, selectedResume }) => {
  return (
    <div className="bg-gray-50 p-6 rounded shadow-sm space-y-4">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Review Your Information</h3>
      {/* ⭐ ADDED: Console log to debug autofill values ⭐ */}
      {console.log("DEBUG: Values on Review Page:", data)}
      {!isValid && Object.keys(errors).length > 0 && (
        <div className="text-danger-500 mb-4">
          Please correct the errors in the form before submitting.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <p><strong>Full Name:</strong> {data.personal?.full_name}</p>
        <p><strong>Father's Name:</strong> {data.personal?.father_name}</p>
        <p><strong>CNIC:</strong> {data.personal?.cnic}</p>
        <p><strong>Email:</strong> {data.personal?.email}</p>
        <p><strong>Phone:</strong> {data.personal?.phone}</p>
        <p><strong>Date of Birth:</strong> {data.personal?.dob}</p>
        <p><strong>Gender:</strong> {data.personal?.gender}</p>
        <p className="col-span-2"><strong>Address:</strong> {data.personal?.address}</p>

        <p className="col-span-2"><strong>Education:</strong></p>
        {data.education.length > 0 ? (
          <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
            {data.education.map((edu, i) => (
              <li key={i}>{edu.level} at {edu.institution} ({edu.course_of_study}, {edu.passing_year})</li>
            ))}
          </ul>
        ) : (
          <p className="col-span-2 text-gray-500 italic">None</p>
        )}

        <p className="col-span-2"><strong>Experience:</strong></p>
        {data.experience.length > 0 ? (
          <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
            {data.experience.map((exp, i) => (
              <li key={i}>{exp.position_held} at {exp.company_name} (From: {exp.from}, To: {exp.to})</li>
            ))}
          </ul>
        ) : (
          <p className="col-span-2 text-gray-500 italic">None</p>
        )}
        <p className="col-span-2"><strong>References:</strong></p>
        {data.references.length > 0 ? (
          <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
            {data.references.map((ref, i) => (
              <li key={i}>{ref.ref_name} - {ref.ref_phone}</li>
            ))}
          </ul>
        ) : (
          <p className="col-span-2 text-gray-500 italic">None</p>
        )}
        {selectedPhoto && (
            <p><strong>Photo:</strong> {selectedPhoto.name}</p>
        )}
        {selectedResume && (
            <p><strong>Resume:</strong> {selectedResume.name}</p>
        )}
      </div>
    </div>
  );
};

export default Review;