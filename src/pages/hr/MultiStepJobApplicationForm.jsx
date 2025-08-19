// src/components/forms/MultiStepJobApplicationForm.jsx
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationFormZ } from "@/lib/applicationFormZod";
import Button from "@/components/ui/Button";
import Textinput from "@/components/ui/Textinput";
import Fileinput from "@/components/ui/Fileinput";
import axios from "axios";

const MultiStepJobApplicationForm = ({ token, invite }) => {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  const form = useForm({
    resolver: zodResolver(applicationFormZ),
    mode: "onBlur",
    defaultValues: {
      personal: {
        full_name: invite?.candidate?.name || "",
        father_name: "",
        cnic: "",
        email: invite?.candidate?.email || "",
        phone: "",
        dob: "",
        gender: "Male",
        address: "",
        photo: null,
        resume: null,
      },
      education: [{ level: "", institution: "", course_of_study: "", passing_year: "" }],
      experience: [],
      references: [],
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { fields: eduFields, append: addEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education",
  });

  const { fields: expFields, append: addExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience",
  });

  const { fields: refFields, append: addReference, remove: removeReference } = useFieldArray({
    control,
    name: "references",
  });

  const steps = [
    "Personal Information",
    "Education",
    "Experience",
    "References",
    "Review & Submit",
  ];

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (values) => {
    // Ensure experience and references are not empty arrays if no items are added
    // This part might need adjustment based on your Zod schema if it expects specific types
    if (values.experience.length === 0) values.experience = []; // Keep as empty array if schema expects array
    if (values.references.length === 0) values.references = []; // Keep as empty array if schema expects array

    const formData = new FormData();
    formData.append("token", token);
    formData.append("payload", JSON.stringify(values));
    formData.append("photo", selectedPhoto);
    formData.append("resume", selectedResume);

    try {
      await axios.post(`/api/invites/${token}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      // Using a custom message box or toast instead of alert()
      // For this example, we'll just log to console, but in a real app,
      // you'd show a user-friendly message on the UI.
      console.error("Submission failed. Please check your fields and try again.");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setSelectedPhoto(file);
    setValue("personal.photo", file);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeName(file.name);
    setSelectedResume(file);
    setValue("personal.resume", file);
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Your form was successfully submitted!</h2>
        <p className="text-gray-700">We’ve received your application. Thank you!</p>
      </div>
    );
  }

  // Watch all form values for the review step
  const values = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-4">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`text-sm ${idx === step ? "font-bold text-blue-600" : "text-gray-400"}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Step 0: Personal Info */}
      {step === 0 && (
        <div className="grid md:grid-cols-2 gap-5">
          <Textinput label="Full Name" register={register} name="personal.full_name" />
          <Textinput label="Father's Name" register={register} name="personal.father_name" />
          <Textinput label="CNIC" register={register} name="personal.cnic" />
          <Textinput label="Email" type="email" register={register} name="personal.email" />
          <Textinput label="Phone" register={register} name="personal.phone" />
          <Textinput label="Date of Birth" type="date" register={register} name="personal.dob" />

          {/* ----- MODIFIED SECTION FOR GENDER AND ADDRESS ----- */}
          {/* This div now spans both columns of the outer md:grid-cols-2 to control its internal layout */}
          <div className="md:col-span-2">
            {/* Inner grid for Gender and Address to manage their relative positioning and widths */}
            <div className="grid grid-cols-3 gap-5">
              {/* Gender field - takes 1/3 of the inner grid's width */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select {...register("personal.gender")} className="input rounded border-gray-300 w-full">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              {/* An empty div to push the Address to the next line within this inner grid.
                  This empty div takes the remaining 2/3 of the first row to maintain alignment. */}
              <div className="col-span-2"></div>

              {/* Address field - starts on a new line and takes 2/3 of the inner grid's width */}
              {/* It's on a new line because the previous elements filled the first row of the grid. */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea
                  {...register("personal.address")}
                  className="input rounded border-gray-300 w-full"
                  rows={4}
                  placeholder=" Residential Address"
                />
              </div>
            </div>
          </div>
          {/* ----- END OF MODIFIED SECTION ----- */}

          {/* Photo Upload */}
          <div className="cursor-pointer">
            <label className="block text-sm font-medium mb-1">Photo (JPG/PNG)</label>
            <Fileinput
              name="photo"
              selectedFile={photoPreview}
              preview
              onChange={handlePhotoChange}
            >
              <Button
                div
                icon="ph:upload"
                text="Choose Photo"
                iconClass="text-2xl"
                className="cursor-pointer bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
              />
            </Fileinput>
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Photo Preview"
                className="w-24 h-24 mt-2 border rounded object-cover"
              />
            )}
          </div>

          {/* Resume Upload */}
          <div className="cursor-pointer">
            <label className="block text-sm font-medium mb-1">Resume (.PDF)</label>
            <Fileinput
              name="resume"
              selectedFile={resumeName}
              preview={false}
              onChange={handleResumeChange}
            >
              <Button
                div
                icon="ph:upload"
                text="Upload Resume"
                iconClass="text-2xl"
                className="cursor-pointer bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
              />
            </Fileinput>
            {resumeName && <p className="text-sm mt-2 text-gray-600">{resumeName}</p>}
          </div>
        </div>
      )}

      {/* Step 1: Education */}
      {step === 1 && (
        <div>
          {eduFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-4 gap-4 mb-4">
              <Textinput label="Level" register={register} name={`education.${index}.level`} />
              <Textinput label="Institution" register={register} name={`education.${index}.institution`} />
              <Textinput label="Course" register={register} name={`education.${index}.course_of_study`} />
              <Textinput label="Passing Year" register={register} name={`education.${index}.passing_year`} />
              <div className="col-span-4 text-right">
                <Button text="Remove" type="button" onClick={() => removeEducation(index)} className="btn-danger btn-sm" />
              </div>
            </div>
          ))}
          <Button text="Add Education" type="button" onClick={() => addEducation({})} className="btn-primary mt-2" />
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div>
          {expFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-4 gap-4 mb-4">
              <Textinput label="Organization" register={register} name={`experience.${index}.organization`} />
              <Textinput label="Designation" register={register} name={`experience.${index}.designation`} />
              <Textinput label="From" type="date" register={register} name={`experience.${index}.from`} />
              <Textinput label="To" type="date" register={register} name={`experience.${index}.to`} />
              <div className="col-span-4 text-right">
                <Button text="Remove" type="button" onClick={() => removeExperience(index)} className="btn-danger btn-sm" />
              </div>
            </div>
          ))}
          <Button text="Add Experience" type="button" onClick={() => addExperience({})} className="btn-primary mt-2" />
        </div>
      )}

      {/* Step 3: References */}
      {step === 3 && (
        <div>
          {refFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-2 gap-4 mb-4">
              <Textinput label="Reference Name" register={register} name={`references.${index}.ref_name`} />
              <Textinput label="Phone" register={register} name={`references.${index}.ref_phone`} />
              <div className="col-span-2 text-right">
                <Button text="Remove" type="button" onClick={() => removeReference(index)} className="btn-danger btn-sm" />
              </div>
            </div>
          ))}
          <Button text="Add Reference" type="button" onClick={() => addReference({})} className="btn-primary mt-2" />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="bg-gray-50 p-6 rounded shadow-sm space-y-4">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Review Your Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p><strong>Full Name:</strong> {values.personal.full_name}</p>
            <p><strong>Father's Name:</strong> {values.personal.father_name}</p>
            <p><strong>CNIC:</strong> {values.personal.cnic}</p>
            <p><strong>Email:</strong> {values.personal.email}</p>
            <p><strong>Phone:</strong> {values.personal.phone}</p>
            <p><strong>Date of Birth:</strong> {values.personal.dob}</p>
            <p><strong>Gender:</strong> {values.personal.gender}</p>
            <p className="col-span-2"><strong>Address:</strong> {values.personal.address}</p>
            <p className="col-span-2"><strong>Education:</strong></p>
            <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
              {values.education.map((edu, i) => (
                <li key={i}>{edu.level} at {edu.institution} ({edu.course_of_study}, {edu.passing_year})</li>
              ))}
            </ul>
            <p className="col-span-2"><strong>Experience:</strong></p>
            {values.experience.length > 0 ? (
              <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
                {values.experience.map((exp, i) => (
                  <li key={i}>{exp.designation} at {exp.organization} ({exp.from} to {exp.to})</li>
                ))}
              </ul>
            ) : (
              <p className="col-span-2 text-gray-500 italic">None</p>
            )}
            <p className="col-span-2"><strong>References:</strong></p>
            {values.references.length > 0 ? (
              <ul className="col-span-2 list-disc list-inside text-sm text-gray-700">
                {values.references.map((ref, i) => (
                  <li key={i}>{ref.ref_name} - {ref.ref_phone}</li>
                ))}
              </ul>
            ) : (
              <p className="col-span-2 text-gray-500 italic">None</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6 space-x-4">
        <div>
          {step > 0 && (
            <Button text="Previous" type="button" onClick={prevStep} className="btn-secondary" />
          )}
        </div>
        <div className="ml-auto">
          {step < steps.length - 1 ? (
            <Button text="Next" type="button" onClick={nextStep} className="btn-primary" />
          ) : (
            <Button text="Submit Application" type="submit" className="btn-primary" />
          )}
        </div>
      </div>
    </form>
  );
};

export default MultiStepJobApplicationForm;