import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationFormZ } from "@/lib/applicationFormZod";
import Button from "@/components/ui/Button";
import axios from "axios";

// Import step components
import PersonalInfo from "./steps/PersonalInfo";
import Education from "./steps/Education";
import Experience from "./steps/Experience";
import References from "./steps/References";
import Review from "./steps/Review";

const MultiStepJobApplicationForm = ({ token, invite }) => {
  const [currentStep, setCurrentStep] = useState(0); // Renamed from 'step' for clarity
  const [success, setSuccess] = useState(false);
  const [formAlreadySubmitted, setFormAlreadySubmitted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);

  const form = useForm({
    resolver: zodResolver(applicationFormZ),
    mode: "onBlur", // or "onChange" as per your preference
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
    formState: { errors, isValid },
  } = form;

  // Check invite status on component mount or when invite prop changes
  useEffect(() => {
    console.log("DEBUG: MultiStepJobApplicationForm component received invite prop:", invite);
    if (invite && invite.invite) {
      setIsLoadingInvite(false);
      console.log("DEBUG: invite.invite.status inside useEffect:", invite.invite.status);
      if (invite.invite.status === "submitted") {
        setFormAlreadySubmitted(true);
        console.log("DEBUG: Application status is 'submitted'. Setting formAlreadySubmitted to true.");
      } else {
        setFormAlreadySubmitted(false);
        console.log("DEBUG: Application status is NOT 'submitted'. Status:", invite.invite.status);
      }
    } else {
      console.log("DEBUG: invite prop or invite.invite is null or undefined, waiting for it...");
    }
  }, [invite]); // Removed errors, isValid, isDirty, dirtyFields from dependency array as they cause unnecessary re-renders for invite check

  // Field array hooks for dynamic forms
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

  // Navigation functions
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  // Handle file input changes (kept in parent because state is here)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setPhotoError(null);
      setSelectedPhoto(null);
      setValue("personal.photo", null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension) && !file.type.startsWith("image/")) {
      setPhotoError("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      setSelectedPhoto(null);
      setValue("personal.photo", null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    setPhotoError(null);
    setSelectedPhoto(file);
    setValue("personal.photo", file, { shouldValidate: true, shouldDirty: true });
  };

  const deletePhoto = () => {
    setSelectedPhoto(null);
    setValue("personal.photo", null, { shouldValidate: true, shouldDirty: true });
    setPhotoError(null);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setResumeError(null);
      setSelectedResume(null);
      setValue("personal.resume", null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    const allowedExtensions = ["pdf"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension) && file.type !== "application/pdf") {
      setResumeError("Invalid file type. Please upload a PDF file.");
      setSelectedResume(null);
      setValue("personal.resume", null, { shouldValidate: true, shouldDirty: true });
      return;
    }

    setResumeError(null);
    setSelectedResume(file);
    setValue("personal.resume", file, { shouldValidate: true, shouldDirty: true });
  };

  const deleteResume = () => {
    setSelectedResume(null);
    setValue("personal.resume", null, { shouldValidate: true, shouldDirty: true });
    setResumeError(null);
  };

  if (isLoadingInvite) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Loading application...</h2>
        <p className="text-gray-700">Please wait while we check the invite status.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Your form is successfully submitted!</h2>
        <p className="text-gray-700">We’ve received your application. Thank you!</p>
      </div>
    );
  }

  if (formAlreadySubmitted) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">This application has already been submitted.</h2>
        <p className="text-gray-700">Thank you for your interest. Your application has already been received.</p>
      </div>
    );
  }

  const values = watch(); // Watch all form values for review step

  const onSubmit = async (data) => {
    console.log("FRONTEND DEBUG: onSubmit triggered with values (from React Hook Form):", data);
    console.log("FRONTEND DEBUG: Selected Photo State (local):", selectedPhoto);
    console.log("FRONTEND DEBUG: Selected Resume State (local):", selectedResume);

    console.log("FRONTEND DEBUG: JSON.stringify(data) content:", JSON.stringify(data, null, 2));

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(data));

      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }
      if (selectedResume) {
        formData.append("resume", selectedResume);
      }

      console.log("FRONTEND DEBUG: FormData entries being sent:");
      for (let pair of formData.entries()) {
        if (pair[0] === 'payload' && typeof pair[1] === 'string') {
          console.log(`  ${pair[0]}: ${pair[1].substring(0, 500)}... (truncated for brevity)`);
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }

      const response = await axios.post(`/api/invites/${token}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccess(true);
        console.log("✅ Form submitted successfully:", response.data);
        alert("Your application form is successfully submitted!");
      } else {
        console.error("⚠️ Unexpected response status:", response.status, response.data);
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("❌ Submission error (frontend caught):", error.response?.data || error.message);
      if (error.response?.status === 409) {
          alert("This application has already been submitted.");
          setFormAlreadySubmitted(true);
      } else {
          alert("Failed to submit application. Please check browser console for details.");
      }
    }
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfo
            register={register}
            errors={errors}
            selectedPhoto={selectedPhoto}
            handlePhotoChange={handlePhotoChange}
            deletePhoto={deletePhoto}
            photoError={photoError}
            selectedResume={selectedResume}
            handleResumeChange={handleResumeChange}
            deleteResume={deleteResume}
            resumeError={resumeError}
          />
        );
      case 1:
        return (
          <Education
            register={register}
            errors={errors}
            eduFields={eduFields}
            addEducation={addEducation}
            removeEducation={removeEducation}
          />
        );
      case 2:
        return (
          <Experience
            register={register}
            errors={errors}
            expFields={expFields}
            addExperience={addExperience}
            removeExperience={removeExperience}
          />
        );
      case 3:
        return (
          <References
            register={register}
            errors={errors}
            refFields={refFields}
            addReference={addReference}
            removeReference={removeReference}
          />
        );
      case 4:
        return (
          <Review
            data={values} // Pass all watched values to review
            errors={errors}
            isValid={isValid}
            selectedPhoto={selectedPhoto}
            selectedResume={selectedResume}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-4">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`text-xl ${idx === currentStep ? "font-bold text-blue-600" : "text-gray-400"}`}
          >
            {s}
          </div>
        ))}
      </div>

      {currentStep === steps.length - 1 ? (
        // Only wrap the last step in a form tag
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          
        >
          {renderStepComponent()}
          {/* Navigation Buttons for the last step */}
          <div className="flex items-center justify-between mt-6 space-x-4">
            <div>
              <Button text="Previous" type="button" onClick={prevStep} className="btn-secondary" />
            </div>
            <div className="ml-auto">
              <Button
                text="Submit Application"
                type="submit"
                className="btn-primary"
                disabled={!isValid}
              />
            </div>
          </div>
        </form>
      ) : (
        // For all other steps, render the component directly
        <>
          {renderStepComponent()}
          {/* Navigation Buttons for intermediate steps */}
          <div className="flex items-center justify-between mt-6 space-x-4">
            <div>
              {currentStep > 0 && (
                <Button text="Previous" type="button" onClick={prevStep} className="btn-secondary" />
              )}
            </div>
            <div className="ml-auto">
              <Button text="Next" type="button" onClick={nextStep} className="btn-primary" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiStepJobApplicationForm;