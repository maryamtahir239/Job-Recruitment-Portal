import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import useDigitOnly from '@/hooks/useDigitOnly';

const Education = ({ register, errors, fieldErrors, eduFields, addEducation, removeEducation, digitErrors: parentDigitErrors }) => {
  // Initialize digit-only validation hook
  const { validateDigitOnly, digitErrors } = useDigitOnly();
  
  // Use parent digit errors if provided, otherwise use local ones
  const finalDigitErrors = parentDigitErrors || digitErrors;

  const educationLevels = [
    { value: "Primary School", label: "Primary School" },
    { value: "Middle School", label: "Middle School" },
    { value: "High School", label: "High School" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Bachelor's Degree", label: "Bachelor's Degree" },
    { value: "Master's Degree", label: "Master's Degree" },
    { value: "PhD/Doctorate", label: "PhD/Doctorate" },
    { value: "Diploma", label: "Diploma" },
    { value: "Certificate", label: "Certificate" },
    { value: "Other", label: "Other" }
  ];

  const statusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Discontinued", label: "Discontinued" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:graduation-cap" className="mr-2" />
          Education History
        </h3>
        <p className="text-sm text-gray-600 mb-4">Please provide your complete educational background, starting with the most recent.</p>
        
        {eduFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">Education #{index + 1}</h4>
              {eduFields.length > 1 && (
                <Button 
                  text="Remove" 
                  type="button" 
                  onClick={() => removeEducation(index)} 
                  className="btn-danger btn-sm"
                  icon="ph:trash"
                />
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Education Level"
                name={`education.${index}.level`}
                options={educationLevels}
                error={fieldErrors[`education.${index}.level`] ? { message: fieldErrors[`education.${index}.level`] } : (errors.education?.[index]?.level?.message ? { message: errors.education[index].level.message } : null)}
                width="w-full"
                placeholder="Select Education Level"
                required={true}
                {...register(`education.${index}.level`)}
              />
              
              <Textinput 
                label="Institution Name" 
                register={register} 
                name={`education.${index}.institution`} 
                error={fieldErrors[`education.${index}.institution`] ? { message: fieldErrors[`education.${index}.institution`] } : (errors.education?.[index]?.institution?.message ? { message: errors.education[index].institution.message } : null)}
                placeholder="e.g., University of Karachi"
                required={true}
              />
              
              <Textinput 
                label="Course/Major/Subject" 
                register={register} 
                name={`education.${index}.course_of_study`} 
                error={fieldErrors[`education.${index}.course_of_study`] ? { message: fieldErrors[`education.${index}.course_of_study`] } : (errors.education?.[index]?.course_of_study?.message ? { message: errors.education[index].course_of_study.message } : null)}
                placeholder="e.g., Computer Science"
                required={true}
              />
              
              <Textinput 
                label="Passing Year" 
                register={register} 
                name={`education.${index}.passing_year`} 
                error={fieldErrors[`education.${index}.passing_year`] ? { message: fieldErrors[`education.${index}.passing_year`] } : (errors.education?.[index]?.passing_year?.message ? { message: errors.education[index].passing_year.message } : null) || (finalDigitErrors[`education.${index}.passing_year`] ? { message: finalDigitErrors[`education.${index}.passing_year`] } : null)}
                placeholder="YYYY"
                required={true}
                isDigitOnly={true}
                onDigitValidation={validateDigitOnly}
              />
              
              <Textinput 
                label="CGPA/Grade" 
                register={register} 
                name={`education.${index}.gpa`} 
                error={fieldErrors[`education.${index}.gpa`] ? { message: fieldErrors[`education.${index}.gpa`] } : (errors.education?.[index]?.gpa?.message ? { message: errors.education[index].gpa.message } : null) || (finalDigitErrors[`education.${index}.gpa`] ? { message: finalDigitErrors[`education.${index}.gpa`] } : null)}
                placeholder="e.g., 3.5/4.0 or A+"
                isDigitOnly={true}
                onDigitValidation={validateDigitOnly}
              />
              
              <Select
                label="Status"
                name={`education.${index}.status`}
                options={statusOptions}
                error={fieldErrors[`education.${index}.status`] ? { message: fieldErrors[`education.${index}.status`] } : (errors.education?.[index]?.status?.message ? { message: errors.education[index].status.message } : null)}
                width="w-40"
                placeholder="Select Status"
                {...register(`education.${index}.status`)}
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Additional Details</label>
              <textarea
                {...register(`education.${index}.additional_details`)}
                className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                rows={3}
                placeholder="Any additional information about your education (achievements, projects, etc.)"
              />
              {(fieldErrors[`education.${index}.additional_details`] || errors.education?.[index]?.additional_details?.message) && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors[`education.${index}.additional_details`] || errors.education[index].additional_details.message}</p>
              )}
            </div>
          </div>
        ))}
        
        <Button 
          text="Add Education" 
          type="button" 
          onClick={() => addEducation({ 
            level: "", 
            institution: "", 
            course_of_study: "", 
            passing_year: "",
            gpa: "",
            status: "",
            additional_details: ""
          })} 
          className="btn-primary mt-4"
          icon="ph:plus"
        />
      </div>


      
      {(fieldErrors.education || errors.education?.message) && (
        <p className="text-red-500 text-sm mt-1">{fieldErrors.education || errors.education?.message}</p>
      )}
    </div>
  );
};

export default Education;