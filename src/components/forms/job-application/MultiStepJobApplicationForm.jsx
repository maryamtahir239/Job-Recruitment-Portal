import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationFormZ } from "@/lib/applicationFormZod";
import Button from "@/components/ui/Button";
import axios from "axios";
import { toast } from "react-toastify";

// Import step components
import PersonalInfo from "./steps/PersonalInfo";
import Education from "./steps/Education";
import Experience from "./steps/Experience";
import References from "./steps/References";
import Review from "./steps/Review";

const MultiStepJobApplicationForm = ({ token, invite }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [formAlreadySubmitted, setFormAlreadySubmitted] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(true);
  const [validationError, setValidationError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const form = useForm({
    resolver: zodResolver(applicationFormZ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      personal: {
        full_name: invite?.candidate?.name || "",
        father_name: "",
        cnic: "",
        email: invite?.candidate?.email || "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        city: "",
        province: "",
        nationality: "",
        marital_status: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        photo: null,
        resume: null,
      },
      education: [{ 
        level: "", 
        institution: "", 
        course_of_study: "", 
        passing_year: "",
        gpa: "",
        status: "",
        additional_details: ""
      }],
      experience: [],
      isFresher: false,
      references: [],
      hasReferences: false,
      additional: {
        why_interested: "",
        career_goals: "",
        expected_salary: "",
        notice_period: ""
      }
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = form;

  // Check invite status on component mount or when invite prop changes
  useEffect(() => {
    if (invite && invite.invite) {
      setIsLoadingInvite(false);
      if (invite.invite.status === "submitted") {
        setFormAlreadySubmitted(true);
      } else {
        setFormAlreadySubmitted(false);
      }
    } else {
    }
  }, [invite]);

  // Trigger validation for current step fields when step changes
  useEffect(() => {
    const validateCurrentStep = async () => {
      const fieldsToValidate = stepValidationFields[currentStep];
      if (fieldsToValidate.length > 0) {
        await trigger(fieldsToValidate);
      }
    };
    
    // Small delay to ensure form is ready
    const timer = setTimeout(validateCurrentStep, 100);
    return () => clearTimeout(timer);
  }, [currentStep, trigger]);

  // Validate all fields on form load to show initial errors
  useEffect(() => {
    const validateAllFields = async () => {
      const allFields = Object.values(stepValidationFields).flat();
      if (allFields.length > 0) {
        await trigger(allFields);
      }
    };
    
    // Delay to ensure form is fully initialized
    const timer = setTimeout(validateAllFields, 500);
    return () => clearTimeout(timer);
  }, [trigger]);

  // Add a function to validate current step fields on blur
  const validateFieldOnBlur = async (fieldName) => {
    await trigger(fieldName);
  };

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

  // Ensure field arrays are initialized properly
  useEffect(() => {
    if (eduFields.length === 0) {
      addEducation({ 
        level: "", 
        institution: "", 
        course_of_study: "", 
        passing_year: "",
        gpa: "",
        status: "",
        additional_details: ""
      });
    }
    

  }, []);

  const steps = [
    "Personal Information",
    "Education",
    "Experience",
    "References",
    "Review & Submit",
  ];

  // Define required fields for each step
  const stepValidationFields = {
    0: [
      "personal.full_name",
      "personal.father_name", 
      "personal.cnic",
      "personal.email",
      "personal.phone",
      "personal.dob",
      "personal.gender",
      "personal.address",
      "personal.city",
      "personal.province",
      "personal.nationality",
      "personal.photo",
      "personal.resume"
    ],
    1: [
      "education.0.level",
      "education.0.institution",
      "education.0.course_of_study",
      "education.0.passing_year"
    ],
    2: ["isFresher"], // Experience step - either isFresher or experience data required
    3: ["hasReferences"], // References step - either hasReferences or references data required
    4: [] // Review step - no additional validation needed
  };

  // Navigation functions with validation
  const nextStep = async () => {
    setValidationError("");
    setPhotoError(null);
    setResumeError(null);
    setFieldErrors({});
    
    console.log("Next step clicked, current step:", currentStep);
    
    try {
      // Custom validation for current step
      const currentStepData = watch();
      let hasErrors = false;
      
      if (currentStep === 0) {
        // Validate Personal Information
        const personal = currentStepData.personal;
        const requiredFields = ['full_name', 'father_name', 'cnic', 'email', 'phone', 'dob', 'gender', 'address', 'city', 'province', 'nationality'];
        const newFieldErrors = {};
        
        for (const field of requiredFields) {
          let fieldValue = personal[field];
          
          // Special handling for date fields
          if (field === 'dob') {
            console.log(`Date field value: "${fieldValue}"`, typeof fieldValue);
            if (!fieldValue || fieldValue === '') {
              console.log(`Missing required field: ${field}`);
              const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              newFieldErrors[`personal.${field}`] = `${fieldName} is required`;
              hasErrors = true;
            }
          } else {
            // For non-date fields, use trim() to check for empty strings
            if (!fieldValue || fieldValue.trim() === '') {
              console.log(`Missing required field: ${field}`);
              const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
              newFieldErrors[`personal.${field}`] = `${fieldName} is required`;
              hasErrors = true;
            }
          }
        }
        
        if (!selectedPhoto) {
          setPhotoError("Please upload a profile photo.");
          hasErrors = true;
        }
        
        if (!selectedResume) {
          setResumeError("Please upload your resume/CV.");
          hasErrors = true;
        }
        
        setFieldErrors(newFieldErrors);
      }
      
      if (currentStep === 1) {
        // Validate Education
        const education = currentStepData.education;
        const newFieldErrors = {};
        
        if (!education || !Array.isArray(education) || education.length === 0) {
          hasErrors = true;
        } else {
          // Check each education entry
          education.forEach((edu, index) => {
            if (!edu) return;
            
            if (!edu.level || edu.level.trim() === '') {
              newFieldErrors[`education.${index}.level`] = "Education level is required";
              hasErrors = true;
            }
            
            if (!edu.institution || edu.institution.trim() === '') {
              newFieldErrors[`education.${index}.institution`] = "Institution name is required";
              hasErrors = true;
            }
            
            if (!edu.course_of_study || edu.course_of_study.trim() === '') {
              newFieldErrors[`education.${index}.course_of_study`] = "Course of study is required";
              hasErrors = true;
            }
            
            if (!edu.passing_year || edu.passing_year.trim() === '') {
              newFieldErrors[`education.${index}.passing_year`] = "Passing year is required";
              hasErrors = true;
            } else if (!/^\d{4}$/.test(edu.passing_year.trim())) {
              newFieldErrors[`education.${index}.passing_year`] = "Invalid year format (YYYY)";
              hasErrors = true;
            }
          });
        }
        
        setFieldErrors(newFieldErrors);
      }
      
      if (currentStep === 2) {
        // Validate Experience
        const experience = currentStepData.experience;
        const isFresher = currentStepData.isFresher;
        const newFieldErrors = {};
        
        // User must either be a fresher OR have at least one complete experience entry
        if (!isFresher && (!experience || !Array.isArray(experience) || experience.length === 0)) {
          newFieldErrors.experience = "Please add at least one work experience or select 'I am a fresher'";
          hasErrors = true;
        } else if (!isFresher && experience && Array.isArray(experience) && experience.length > 0) {
          // Check each experience entry
          experience.forEach((exp, index) => {
            if (!exp) return;
            
            if (!exp.company_name || exp.company_name.trim() === '') {
              newFieldErrors[`experience.${index}.company_name`] = "Company name is required";
              hasErrors = true;
            }
            
            if (!exp.position_held || exp.position_held.trim() === '') {
              newFieldErrors[`experience.${index}.position_held`] = "Job title is required";
              hasErrors = true;
            }
            
            if (!exp.employment_type || exp.employment_type.trim() === '') {
              newFieldErrors[`experience.${index}.employment_type`] = "Employment type is required";
              hasErrors = true;
            }
            
            if (!exp.from || exp.from.trim() === '') {
              newFieldErrors[`experience.${index}.from`] = "Start date is required";
              hasErrors = true;
            }
            
            if (!exp.job_description || exp.job_description.trim() === '') {
              newFieldErrors[`experience.${index}.job_description`] = "Job description is required";
              hasErrors = true;
            }
          });
        }
        
        setFieldErrors(newFieldErrors);
      }
      
      if (currentStep === 3) {
        // Validate References
        const references = currentStepData.references;
        const skipReferences = currentStepData.hasReferences; // hasReferences=true means skip
        const newFieldErrors = {};
        
        // User must either skip references OR have at least one complete reference entry
        if (!skipReferences && (!references || !Array.isArray(references) || references.length === 0)) {
          newFieldErrors.references = "Please add at least one reference or select 'I don't have references to provide'";
          hasErrors = true;
        } else if (!skipReferences && references && Array.isArray(references) && references.length > 0) {
          // Check each reference entry
          references.forEach((ref, index) => {
            if (!ref) return;
            
            if (!ref.ref_name || ref.ref_name.trim() === '') {
              newFieldErrors[`references.${index}.ref_name`] = "Reference name is required";
              hasErrors = true;
            }
            
            if (!ref.ref_phone || ref.ref_phone.trim() === '') {
              newFieldErrors[`references.${index}.ref_phone`] = "Reference phone number is required";
              hasErrors = true;
            }
            
            if (!ref.relationship || ref.relationship.trim() === '') {
              newFieldErrors[`references.${index}.relationship`] = "Relationship is required";
              hasErrors = true;
            }
            
            if (ref.ref_email && ref.ref_email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.ref_email.trim())) {
              newFieldErrors[`references.${index}.ref_email`] = "Invalid email format";
              hasErrors = true;
            }
          });
        }
        
        setFieldErrors(newFieldErrors);
      }
      
      if (hasErrors) {
        console.log("Validation failed, showing errors");
        // Don't trigger Zod validation to avoid errors
        // Just show the custom validation errors
        setTimeout(() => {
          const firstErrorElement = document.querySelector('.text-red-500');
          if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }

      // Additional step-specific validation
      if (currentStep === 0) {
        console.log("Validating step 0 - Personal Info");
        const personalData = watch("personal");
        console.log("Personal data:", personalData);
        
        // Check if all required fields are filled
        const requiredFields = [
          'full_name', 'father_name', 'cnic', 'email', 'phone', 
          'dob', 'gender', 'address', 'city', 'province', 'nationality'
        ];
        
        const missingFields = requiredFields.filter(field => 
          !personalData[field] || personalData[field].trim() === ''
        );
        
        if (missingFields.length > 0) {
          console.log("Missing fields:", missingFields);
          // Trigger validation for missing fields
          await trigger(missingFields.map(field => `personal.${field}`));
          setTimeout(() => {
            const firstErrorElement = document.querySelector('.text-red-500');
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
        
        // Check if photo and resume are uploaded
        if (!selectedPhoto) {
          console.log("Photo not uploaded");
          setPhotoError("Please upload a profile photo.");
          setTimeout(() => {
            const photoErrorElement = document.querySelector('[name="personal.photo"]');
            if (photoErrorElement) {
              photoErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
        if (!selectedResume) {
          console.log("Resume not uploaded");
          setResumeError("Please upload your resume/CV.");
          setTimeout(() => {
            const resumeErrorElement = document.querySelector('[name="personal.resume"]');
            if (resumeErrorElement) {
              resumeErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
        
        console.log("Step 0 validation passed");
      }

      if (currentStep === 1) {
        console.log("Validating step 1 - Education");
        // Check if at least one education entry is complete
        const educationData = watch("education");
        console.log("Education data:", educationData);
        
        if (!educationData || !Array.isArray(educationData)) {
          console.log("Education data is not an array");
          // Trigger validation for education fields to show errors
          await trigger(["education.0.level", "education.0.institution", "education.0.course_of_study", "education.0.passing_year"]);
          setTimeout(() => {
            const firstErrorElement = document.querySelector('.text-red-500');
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
        
        const hasValidEducation = educationData.some(edu => 
          edu && edu.level && edu.level.trim() !== '' &&
          edu.institution && edu.institution.trim() !== '' &&
          edu.course_of_study && edu.course_of_study.trim() !== '' &&
          edu.passing_year && edu.passing_year.trim() !== ''
        );
        
        console.log("Has valid education:", hasValidEducation);
        
        if (!hasValidEducation) {
          console.log("No valid education entry found");
          // Trigger validation for education fields to show errors
          await trigger(["education.0.level", "education.0.institution", "education.0.course_of_study", "education.0.passing_year"]);
          setTimeout(() => {
            const firstErrorElement = document.querySelector('.text-red-500');
            if (firstErrorElement) {
              firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          return;
        }
        
        console.log("Step 1 validation passed");
      }

      if (currentStep === 3) {
        console.log("Validating step 3 - References");
        const currentStepData = watch();
        const skipReferences = currentStepData.hasReferences; // hasReferences=true means skip
        
        // If user has chosen to skip references, allow proceeding
        if (skipReferences) {
          console.log("User has chosen to skip references, allowing to proceed");
        } else {
          // Check if at least one reference is complete
          const referencesData = watch("references");
          console.log("References data:", referencesData);
          
          if (!referencesData || !Array.isArray(referencesData)) {
            console.log("References data is not an array");
            // Trigger validation for reference fields to show errors
            await trigger(["references.0.ref_name", "references.0.ref_phone", "references.0.relationship"]);
            setTimeout(() => {
              const firstErrorElement = document.querySelector('.text-red-500');
              if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
            return;
          }
          
          const hasValidReference = referencesData.some(ref => 
            ref && ref.ref_name && ref.ref_name.trim() !== '' &&
            ref.ref_phone && ref.ref_phone.trim() !== '' &&
            ref.relationship && ref.relationship.trim() !== ''
          );
          
          console.log("Has valid reference:", hasValidReference);
          
          if (!hasValidReference) {
            console.log("No valid reference entry found");
            // Trigger validation for reference fields to show errors
            await trigger(["references.0.ref_name", "references.0.ref_phone", "references.0.relationship"]);
            setTimeout(() => {
              const firstErrorElement = document.querySelector('.text-red-500');
              if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
            return;
          }
        }
        
        console.log("Step 3 validation passed");
      }

      // If all validation passes, move to next step
      console.log("All validation passed, moving to next step");
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    } catch (error) {
      console.error("Validation error:", error);
      setValidationError("An error occurred during validation. Please try again.");
    }
  };

  const prevStep = () => {
    setValidationError("");
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  // Handle file input changes
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
        <p className="text-gray-700">We've received your application. Thank you!</p>
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

  const values = watch();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify(data));

      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }
      if (selectedResume) {
        formData.append("resume", selectedResume);
      }

      const response = await axios.post(`/api/invites/${token}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        setSuccess(true);
        toast.success("Your application form is successfully submitted!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("This application has already been submitted.");
          setFormAlreadySubmitted(true);
      } else {
        toast.error("Failed to submit application. Please check browser console for details.");
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
            fieldErrors={fieldErrors}
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
            fieldErrors={fieldErrors}
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
            fieldErrors={fieldErrors}
            expFields={expFields}
            addExperience={addExperience}
            removeExperience={removeExperience}
            watch={watch}
            setValue={setValue}
          />
        );
      case 3:
        return (
          <References
            register={register}
            errors={errors}
            fieldErrors={fieldErrors}
            refFields={refFields}
            addReference={addReference}
            removeReference={removeReference}
            watch={watch}
            setValue={setValue}
          />
        );
      case 4:
        return (
          <Review
            data={values}
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
      <div className="mb-8">
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
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Step Numbers */}
        <div className="flex justify-between mt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                idx <= currentStep 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {idx + 1}
            </div>
          ))}
        </div>
        
        {/* Step Completion Status */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {steps.map((_, idx) => {
            const fieldsToCheck = stepValidationFields[idx];
            let isComplete = false; // Start with false, only set to true if conditions are met
            
            // Step 0: Personal Information
            if (idx === 0) {
              const personalData = watch("personal");
              const hasRequiredFields = personalData && 
                personalData.full_name && personalData.full_name.trim() !== '' &&
                personalData.father_name && personalData.father_name.trim() !== '' &&
                personalData.cnic && personalData.cnic.trim() !== '' &&
                personalData.email && personalData.email.trim() !== '' &&
                personalData.phone && personalData.phone.trim() !== '' &&
                personalData.dob && personalData.dob.trim() !== '' &&
                personalData.gender && personalData.gender.trim() !== '' &&
                personalData.address && personalData.address.trim() !== '' &&
                personalData.city && personalData.city.trim() !== '' &&
                personalData.province && personalData.province.trim() !== '' &&
                personalData.nationality && personalData.nationality.trim() !== '';
              
              const hasFiles = selectedPhoto && selectedResume;
              const hasNoErrors = !errors.personal?.photo && !errors.personal?.resume;
              
              isComplete = hasRequiredFields && hasFiles && hasNoErrors;
            }
            
            // Step 1: Education
            else if (idx === 1) {
              const educationData = watch("education");
              if (educationData && Array.isArray(educationData)) {
                const hasValidEducation = educationData.some(edu => 
                  edu && edu.level && edu.level.trim() !== '' &&
                  edu.institution && edu.institution.trim() !== '' &&
                  edu.course_of_study && edu.course_of_study.trim() !== '' &&
                  edu.passing_year && edu.passing_year.trim() !== ''
                );
                isComplete = hasValidEducation;
              }
            }
            
            // Step 2: Experience (show complete if user is fresher OR has valid experience)
            else if (idx === 2) {
              const experienceData = watch("experience");
              const isFresher = watch("isFresher");
              
              if (isFresher) {
                // User has selected they are a fresher
                isComplete = true;
              } else if (experienceData && Array.isArray(experienceData) && experienceData.length > 0) {
                // Check if at least one experience entry is complete
                const hasValidExperience = experienceData.some(exp => 
                  exp && exp.company_name && exp.company_name.trim() !== '' &&
                  exp.position_held && exp.position_held.trim() !== '' &&
                  exp.employment_type && exp.employment_type.trim() !== '' &&
                  exp.from && exp.from.trim() !== '' &&
                  exp.job_description && exp.job_description.trim() !== ''
                );
                isComplete = hasValidExperience;
              }
            }
            
            // Step 3: References (show complete if user skips OR has valid references)
            else if (idx === 3) {
              const referencesData = watch("references");
              const skipReferences = watch("hasReferences"); // hasReferences=true means skip
              
              if (skipReferences) {
                // User has chosen to skip references
                isComplete = true;
              } else if (referencesData && Array.isArray(referencesData) && referencesData.length > 0) {
                // Check if at least one reference entry is complete
                const hasValidReference = referencesData.some(ref => 
                  ref && ref.ref_name && ref.ref_name.trim() !== '' &&
                  ref.ref_phone && ref.ref_phone.trim() !== '' &&
                  ref.relationship && ref.relationship.trim() !== ''
                );
                isComplete = hasValidReference;
              }
            }
            
            // Step 4: Review & Submit (show complete only when user reaches this step)
            else if (idx === 4) {
              isComplete = currentStep === 4;
            }
            
            return (
              <div key={idx} className="text-center">
                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
                  isComplete ? "bg-green-500" : "bg-gray-300"
                }`}></div>
                <span className={isComplete ? "text-green-600" : "text-gray-400"}>
                  {isComplete ? "Complete" : "Incomplete"}
                </span>
              </div>
            );
          })}
        </div>
      </div>



      {/* Current Step Validation Summary */}
      {(() => {
        const currentStepErrors = [];
        const fieldsToCheck = stepValidationFields[currentStep];
        
        if (fieldsToCheck && fieldsToCheck.length > 0) {
          fieldsToCheck.forEach(field => {
            const fieldError = errors[field.split('.')[0]]?.[field.split('.')[1]];
            if (fieldError) {
              currentStepErrors.push(fieldError.message);
            }
          });
        }

        // Check for file upload errors in step 0
        if (currentStep === 0) {
          if (errors.personal?.photo) {
            currentStepErrors.push(errors.personal.photo.message);
          }
          if (errors.personal?.resume) {
            currentStepErrors.push(errors.personal.resume.message);
          }
        }

        // Check for array field errors
        if (currentStep === 1 && errors.education) {
          if (Array.isArray(errors.education)) {
            errors.education.forEach((eduError, index) => {
              if (eduError) {
                Object.values(eduError).forEach(error => {
                  if (error && error.message) {
                    currentStepErrors.push(`Education ${index + 1}: ${error.message}`);
                  }
                });
              }
            });
          }
        }

        if (currentStep === 3 && errors.references) {
          if (Array.isArray(errors.references)) {
            errors.references.forEach((refError, index) => {
              if (refError) {
                Object.values(refError).forEach(error => {
                  if (error && error.message) {
                    currentStepErrors.push(`Reference ${index + 1}: ${error.message}`);
                  }
                });
              }
            });
          }
        }

        if (currentStepErrors.length > 0) {
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Required Fields to Complete ({currentStepErrors.length} errors)
                    </h3>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      {currentStepErrors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {currentStepErrors.length > 5 && (
                        <li>... and {currentStepErrors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-yellow-600">
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <div className="text-xs text-yellow-600">
                    {Math.round(((currentStepErrors.length === 0 ? 1 : 0) / 1) * 100)}% Complete
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {currentStep === steps.length - 1 ? (
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
        <>
          {renderStepComponent()}
          <div className="flex items-center justify-between mt-6 space-x-4">
            <div>
              {currentStep > 0 && (
                <Button text="Previous" type="button" onClick={prevStep} className="btn-secondary" />
              )}
            </div>
            <div className="ml-auto">
                             <Button 
                 text="Next" 
                 type="button" 
                 onClick={nextStep} 
                 className="btn-primary"
               />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiStepJobApplicationForm;