import React, { useState, useEffect } from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import useDigitOnly from '@/hooks/useDigitOnly';

const References = ({ register, errors, fieldErrors, refFields, addReference, removeReference, watch, setValue, digitErrors: parentDigitErrors }) => {
  // Initialize digit-only validation hook
  const { validateDigitOnly, digitErrors } = useDigitOnly();
  
  // Use parent digit errors if provided, otherwise use local ones
  const finalDigitErrors = parentDigitErrors || digitErrors;
  
  const [skipReferences, setSkipReferences] = useState(false);
  const [showReferenceForm, setShowReferenceForm] = useState(false);

  // Watch for changes in refFields and reset state when all forms are removed
  useEffect(() => {
    if (refFields.length === 0 && showReferenceForm) {
      setShowReferenceForm(false);
      // Reset skipReferences state to allow user to choose again
      setSkipReferences(false);
      setValue("hasReferences", false);
    }
  }, [refFields.length, showReferenceForm, setValue]);

  // Sync local state with form values
  useEffect(() => {
    const formSkipReferences = watch("hasReferences");
    setSkipReferences(formSkipReferences || false);
  }, [watch("hasReferences")]);

  const relationshipTypes = [
    { value: "Former Manager", label: "Former Manager" },
    { value: "Former Colleague", label: "Former Colleague" },
    { value: "Former Supervisor", label: "Former Supervisor" },
    { value: "Professor/Teacher", label: "Professor/Teacher" },
    { value: "Client", label: "Client" },
    { value: "Business Partner", label: "Business Partner" },
    { value: "Friend", label: "Friend" },
    { value: "Family Member", label: "Family Member" },
    { value: "Other", label: "Other" }
  ];

  const noticePeriodOptions = [
    { value: "Immediately Available", label: "Immediately Available" },
    { value: "1 week", label: "1 week" },
    { value: "2 weeks", label: "2 weeks" },
    { value: "1 month", label: "1 month" },
    { value: "2 months", label: "2 months" },
    { value: "3 months", label: "3 months" },
    { value: "Other", label: "Other" }
  ];

  const handleSkipReferencesToggle = (checked) => {
    setSkipReferences(checked);
    if (checked) {
      // Clear all reference fields and set hasReferences to true (meaning skip)
      setValue("references", []);
      setValue("hasReferences", true);
      setShowReferenceForm(false);
    } else {
      setValue("hasReferences", false);
    }
  };

  const handleAddReference = () => {
    setSkipReferences(false);
    setValue("hasReferences", false);
    setShowReferenceForm(true);
    addReference({ 
      ref_name: "", 
      ref_phone: "",
      ref_email: "",
      relationship: "",
      known_duration: ""
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:users" className="mr-2" />
          Professional References
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please provide professional references who can vouch for your work and character. 
          <span className="text-red-500 font-medium"> You must either add references or select that you don't have references to provide.</span>
        </p>
        
        {/* Validation Error Display - Moved to top */}
        {(fieldErrors.references || errors.references?.message) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Icon icon="ph:warning" className="text-red-500 mr-2" />
              <p className="text-red-700 text-sm font-medium">
                {fieldErrors.references || errors.references?.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Skip References Option */}
        {!showReferenceForm && refFields.length === 0 && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={skipReferences}
                  onChange={(e) => handleSkipReferencesToggle(e.target.checked)}
                  className="mr-3 h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  I don't have references to provide <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
            {skipReferences && (
              <p className="text-sm text-green-600 mt-2 ml-8">
                ✓ You've selected that you don't have references. This is completely fine and your application will proceed without references.
              </p>
            )}
          </div>
        )}
        
        {/* Add Reference Button */}
        {!skipReferences && !showReferenceForm && refFields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white dark:bg-gray-900">
            <Icon icon="ph:users" className="text-4xl text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No references added yet</p>
            <p className="text-sm text-gray-500 mb-4">Choose an option below to proceed</p>
            <Button 
              text="Add Reference" 
              type="button" 
              onClick={handleAddReference}
              className="btn-primary"
              icon="ph:plus"
            />
          </div>
        )}
        
        {/* Reference Forms */}
        {showReferenceForm && (
          <>
            {/* Back to Options Button */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  <Icon icon="ph:info" className="inline mr-2" />
                  You can go back to choose between adding references or skipping this step
                </span>
                <Button 
                  text="Back to Options" 
                  type="button" 
                  onClick={() => {
                    setShowReferenceForm(false);
                    setSkipReferences(false);
                    setValue("hasReferences", false);
                    setValue("references", []);
                  }}
                  className="btn-outline btn-sm"
                  icon="ph:arrow-left"
                />
              </div>
            </div>
            
            {refFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Reference #{index + 1}</h4>
                  <Button 
                    text="Remove" 
                    type="button" 
                    onClick={() => removeReference(index)} 
                    className="btn-danger btn-sm"
                    icon="ph:trash"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Textinput 
                    label="Reference Name" 
                    register={register} 
                    name={`references.${index}.ref_name`} 
                    error={fieldErrors[`references.${index}.ref_name`] ? { message: fieldErrors[`references.${index}.ref_name`] } : (errors.references?.[index]?.ref_name?.message ? { message: errors.references[index].ref_name.message } : null)}
                    placeholder="e.g., John Smith"
                    required={true}
                  />
                  
                  <Select
                    label="Relationship"
                    name={`references.${index}.relationship`}
                    options={relationshipTypes}
                    error={fieldErrors[`references.${index}.relationship`] ? { message: fieldErrors[`references.${index}.relationship`] } : (errors.references?.[index]?.relationship?.message ? { message: errors.references[index].relationship.message } : null)}
                    width="w-48"
                    placeholder="Select Relationship"
                    required={true}
                    {...register(`references.${index}.relationship`)}
                  />
                  
                  <Textinput 
                    label="Phone Number" 
                    register={register} 
                    name={`references.${index}.ref_phone`} 
                    error={fieldErrors[`references.${index}.ref_phone`] ? { message: fieldErrors[`references.${index}.ref_phone`] } : (errors.references?.[index]?.ref_phone?.message ? { message: errors.references[index].ref_phone.message } : null) || (finalDigitErrors[`references.${index}.ref_phone`] ? { message: finalDigitErrors[`references.${index}.ref_phone`] } : null)}
                    placeholder="+92-300-1234567"
                    required={true}
                    isDigitOnly={true}
                    onDigitValidation={validateDigitOnly}
                  />
                  
                  <Textinput 
                    label="Email Address" 
                    type="email"
                    register={register} 
                    name={`references.${index}.ref_email`} 
                    error={fieldErrors[`references.${index}.ref_email`] ? { message: fieldErrors[`references.${index}.ref_email`] } : (errors.references?.[index]?.ref_email?.message ? { message: errors.references[index].ref_email.message } : null)}
                    placeholder="reference@example.com"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">How long have you known this person?</label>
                  <textarea
                    {...register(`references.${index}.known_duration`)}
                    className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    rows={3}
                    placeholder="e.g., 3 years as my direct supervisor at ABC Company"
                  />
                  {(fieldErrors[`references.${index}.known_duration`] || errors.references?.[index]?.known_duration?.message) && (
                    <p className="text-red-500 text-sm mt-1">{fieldErrors[`references.${index}.known_duration`] || errors.references[index].known_duration.message}</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        
        {/* Add More Reference Button */}
        {showReferenceForm && (
          <Button 
            text="Add More Reference" 
            type="button" 
            onClick={() => addReference({ 
              ref_name: "", 
              ref_phone: "",
              ref_email: "",
              relationship: "",
              known_duration: ""
            })} 
            className="btn-primary mt-4"
            icon="ph:plus"
          />
        )}
      </div>

      {/* Additional Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:info" className="mr-2" />
          Additional Information
        </h3>
        <p className="text-sm text-gray-600 mb-4">Any additional information you'd like to share with potential employers.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Why are you interested in this position?</label>
            <textarea
              {...register("additional.why_interested")}
              className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
              rows={4}
              placeholder="Explain your interest in this specific position and company"
            />
            {(fieldErrors["additional.why_interested"] || errors.additional?.why_interested?.message) && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors["additional.why_interested"] || errors.additional.why_interested.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Expected Salary Range (Optional)</label>
            <input
              {...register("additional.expected_salary")}
              type="text"
              className="input rounded border border-gray-300 w-[40%] py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="e.g., Rs 40,000 - 60,000 per month"
              onKeyPress={(e) => {
                // Allow: digits, dots, commas, spaces, hyphens, backspace, delete, arrow keys
                const allowedKeys = [
                  'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                  'Tab', 'Enter', 'Home', 'End'
                ];
                
                // Check if the pressed key is allowed
                if (allowedKeys.includes(e.key)) {
                  return true;
                }
                
                // Check if the character is a digit or allowed symbol
                const digitRegex = /[\d.,\s-]/;
                if (!digitRegex.test(e.key)) {
                  e.preventDefault();
                  return false;
                }
              }}
            />
            {(fieldErrors["additional.expected_salary"] || errors.additional?.expected_salary?.message) && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors["additional.expected_salary"] || errors.additional.expected_salary.message}</p>
            )}
          </div>
          
          <div>
            <Select
              label="Notice Period"
              name="additional.notice_period"
              options={noticePeriodOptions}
              error={fieldErrors["additional.notice_period"] ? { message: fieldErrors["additional.notice_period"] } : (errors.additional?.notice_period?.message ? { message: errors.additional.notice_period.message } : null)}
              width="w-48"
              placeholder="Select Notice Period"
              {...register("additional.notice_period")}
            />
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default References;