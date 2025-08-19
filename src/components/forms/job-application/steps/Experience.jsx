import React, { useState, useEffect } from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import useDigitOnly from '@/hooks/useDigitOnly';

const Experience = ({ register, errors, fieldErrors, expFields, addExperience, removeExperience, watch, setValue, digitErrors: parentDigitErrors }) => {
  // Initialize digit-only validation hook
  const { validateDigitOnly, digitErrors } = useDigitOnly();
  
  // Use parent digit errors if provided, otherwise use local ones
  const finalDigitErrors = parentDigitErrors || digitErrors;
  
  const [isFresher, setIsFresher] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  // Watch for changes in expFields and reset state when all forms are removed
  useEffect(() => {
    if (expFields.length === 0 && showExperienceForm) {
      setShowExperienceForm(false);
      // Reset fresher state to allow user to choose again
      setIsFresher(false);
      setValue("isFresher", false);
    }
  }, [expFields.length, showExperienceForm, setValue]);

  // Sync local state with form values
  useEffect(() => {
    const formIsFresher = watch("isFresher");
    setIsFresher(formIsFresher || false);
  }, [watch("isFresher")]);

  const employmentTypes = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Internship", label: "Internship" },
    { value: "Freelance", label: "Freelance" },
    { value: "Temporary", label: "Temporary" },
    { value: "Other", label: "Other" }
  ];

  const handleFresherToggle = (checked) => {
    setIsFresher(checked);
    if (checked) {
      // Clear all experience fields and set fresher
      setValue("experience", []);
      setValue("isFresher", true);
      setShowExperienceForm(false);
    } else {
      setValue("isFresher", false);
    }
  };

  const handleAddExperience = () => {
    setIsFresher(false);
    setValue("isFresher", false);
    setShowExperienceForm(true);
    addExperience({ 
      company_name: "", 
      position_held: "", 
      employment_type: "",
      industry: "",
      from: "", 
      to: "",
      is_current: false,
      salary: "",
      reason_for_leaving: "",
      job_description: "",
      achievements: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:briefcase" className="mr-2" />
          Work Experience
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your work experience, starting with the most recent position. 
          <span className="text-red-500 font-medium"> You must either add experience or select that you are a fresher.</span>
        </p>
        
        {/* Validation Error Display - Moved to top */}
        {(fieldErrors.experience || errors.experience?.message) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Icon icon="ph:warning" className="text-red-500 mr-2" />
              <p className="text-red-700 text-sm font-medium">
                {fieldErrors.experience || errors.experience?.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Fresher Option */}
        {!showExperienceForm && expFields.length === 0 && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isFresher}
                  onChange={(e) => handleFresherToggle(e.target.checked)}
                  className="mr-3 h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  I am a fresher (no work experience) <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
            {isFresher && (
              <p className="text-sm text-green-600 mt-2 ml-8">
                ✓ You've selected that you are a fresher. This will be noted in your application.
              </p>
            )}
          </div>
        )}
        
        {/* Add Experience Button */}
        {!isFresher && !showExperienceForm && expFields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white dark:bg-gray-900">
            <Icon icon="ph:briefcase" className="text-4xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No work experience added yet</p>
            <p className="text-sm text-gray-500 mb-4">Choose an option below to proceed</p>
            <Button 
              text="Add Experience" 
              type="button" 
              onClick={handleAddExperience}
              className="btn-primary"
              icon="ph:plus"
            />
          </div>
        )}
        
        {/* Experience Forms */}
        {showExperienceForm && (
          <>
            {/* Back to Options Button */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  <Icon icon="ph:info" className="inline mr-2" />
                  You can go back to choose between fresher or experience options
                </span>
                <Button 
                  text="Back to Options" 
                  type="button" 
                  onClick={() => {
                    setShowExperienceForm(false);
                    setIsFresher(false);
                    setValue("isFresher", false);
                    setValue("experience", []);
                  }}
                  className="btn-outline btn-sm"
                  icon="ph:arrow-left"
                />
              </div>
            </div>
            
            {expFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Experience #{index + 1}</h4>
              <Button 
                text="Remove" 
                type="button" 
                onClick={() => removeExperience(index)} 
                className="btn-danger btn-sm"
                icon="ph:trash"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Textinput 
                label="Company/Organization Name" 
                register={register} 
                name={`experience.${index}.company_name`} 
                error={fieldErrors[`experience.${index}.company_name`] ? { message: fieldErrors[`experience.${index}.company_name`] } : (errors.experience?.[index]?.company_name?.message ? { message: errors.experience[index].company_name.message } : null)}
                placeholder="e.g., Tech Solutions Inc."
                required={true}
              />
              
              <Textinput 
                label="Job Title/Position" 
                register={register} 
                name={`experience.${index}.position_held`} 
                error={fieldErrors[`experience.${index}.position_held`] ? { message: fieldErrors[`experience.${index}.position_held`] } : (errors.experience?.[index]?.position_held?.message ? { message: errors.experience[index].position_held.message } : null)}
                placeholder="e.g., Senior Software Developer"
                required={true}
              />
              
              <Select
                label="Employment Type"
                name={`experience.${index}.employment_type`}
                options={employmentTypes}
                error={fieldErrors[`experience.${index}.employment_type`] ? { message: fieldErrors[`experience.${index}.employment_type`] } : (errors.experience?.[index]?.employment_type?.message ? { message: errors.experience[index].employment_type.message } : null)}
                width="w-40"
                placeholder="Select Type"
                required={true}
                {...register(`experience.${index}.employment_type`)}
              />
              
              <Textinput 
                label="Industry/Sector" 
                register={register} 
                name={`experience.${index}.industry`} 
                error={fieldErrors[`experience.${index}.industry`] ? { message: fieldErrors[`experience.${index}.industry`] } : (errors.experience?.[index]?.industry?.message ? { message: errors.experience[index].industry.message } : null)}
                placeholder="e.g., Information Technology"
              />
              
              <Textinput 
                label="Start Date" 
                type="date" 
                register={register} 
                name={`experience.${index}.from`} 
                error={fieldErrors[`experience.${index}.from`] ? { message: fieldErrors[`experience.${index}.from`] } : (errors.experience?.[index]?.from?.message ? { message: errors.experience[index].from.message } : null)}
                required={true}
              />
              
              <Textinput 
                label="End Date" 
                type="date" 
                register={register} 
                name={`experience.${index}.to`} 
                error={fieldErrors[`experience.${index}.to`] ? { message: fieldErrors[`experience.${index}.to`] } : (errors.experience?.[index]?.to?.message ? { message: errors.experience[index].to.message } : null)}
              />
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Current Position</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`experience.${index}.is_current`)}
                      className="mr-2"
                    />
                    <span className="text-sm">I currently work here</span>
                  </label>
                </div>
              </div>
              
              <Textinput 
                label="Salary (Optional)" 
                register={register} 
                name={`experience.${index}.salary`} 
                error={fieldErrors[`experience.${index}.salary`] ? { message: fieldErrors[`experience.${index}.salary`] } : (errors.experience?.[index]?.salary?.message ? { message: errors.experience[index].salary.message } : null) || (finalDigitErrors[`experience.${index}.salary`] ? { message: finalDigitErrors[`experience.${index}.salary`] } : null)}
                placeholder="e.g., Rs 50,000 per year"
                isDigitOnly={true}
                onDigitValidation={validateDigitOnly}
              />
              
              <Textinput 
                label="Reason for Leaving" 
                register={register} 
                name={`experience.${index}.reason_for_leaving`} 
                error={fieldErrors[`experience.${index}.reason_for_leaving`] ? { message: fieldErrors[`experience.${index}.reason_for_leaving`] } : (errors.experience?.[index]?.reason_for_leaving?.message ? { message: errors.experience[index].reason_for_leaving.message } : null)}
                placeholder="e.g., Career growth, Company closure"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Job Description & Responsibilities <span className="text-red-500">*</span></label>
                                <textarea
                    {...register(`experience.${index}.job_description`)}
                    className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    rows={4}
                    placeholder="Describe your role, responsibilities, and key achievements in this position"
                  />
              {(fieldErrors[`experience.${index}.job_description`] || errors.experience?.[index]?.job_description?.message) && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors[`experience.${index}.job_description`] || errors.experience[index].job_description.message}</p>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Key Achievements</label>
                                <textarea
                    {...register(`experience.${index}.achievements`)}
                    className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    rows={3}
                    placeholder="List your key achievements, projects completed, or awards received"
                  />
              {(fieldErrors[`experience.${index}.achievements`] || errors.experience?.[index]?.achievements?.message) && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors[`experience.${index}.achievements`] || errors.experience[index].achievements.message}</p>
              )}
            </div>
          </div>
        ))}
          </>
        )}
        
        {/* Add More Experience Button */}
        {showExperienceForm && (
          <Button 
            text="Add More Experience" 
            type="button" 
            onClick={() => addExperience({ 
              company_name: "", 
              position_held: "", 
              employment_type: "",
              industry: "",
              from: "", 
              to: "",
              is_current: false,
              salary: "",
              reason_for_leaving: "",
              job_description: "",
              achievements: ""
            })} 
            className="btn-primary mt-4"
            icon="ph:plus"
          />
        )}
      </div>
      
      
    </div>
  );
};

export default Experience;