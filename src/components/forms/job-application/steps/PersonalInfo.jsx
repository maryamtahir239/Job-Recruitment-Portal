import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Fileinput from '@/components/ui/Fileinput';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Select from '@/components/ui/Select';
import useDigitOnly from '@/hooks/useDigitOnly';

const PersonalInfo = ({
  register,
  errors,
  fieldErrors,
  selectedPhoto,
  handlePhotoChange,
  deletePhoto,
  photoError,
  selectedResume,
  handleResumeChange,
  deleteResume,
  resumeError,
  digitErrors: parentDigitErrors,
}) => {
  // Initialize digit-only validation hook
  const { validateDigitOnly, digitErrors } = useDigitOnly();
  
  // Use parent digit errors if provided, otherwise use local ones
  const finalDigitErrors = parentDigitErrors || digitErrors;

  // Clear field error when user starts typing
  const handleFieldChange = (fieldName) => {
    if (fieldErrors[fieldName]) {
      // Clear the specific field error when user starts typing
      // This will be handled by the parent component
    }
  };
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:user" className="mr-2" />
          Basic Information
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Textinput 
            label="Full Name" 
            register={register} 
            name="personal.full_name" 
            error={fieldErrors["personal.full_name"] ? { message: fieldErrors["personal.full_name"] } : (errors.personal?.full_name?.message ? { message: errors.personal.full_name.message } : null)}
            placeholder="Enter your full name"
            required={true}
          />
          <Textinput 
            label="Father's/Husband's Name" 
            register={register} 
            name="personal.father_name" 
            error={fieldErrors["personal.father_name"] ? { message: fieldErrors["personal.father_name"] } : (errors.personal?.father_name?.message ? { message: errors.personal.father_name.message } : null)}
            placeholder="Enter father's or husband's name"
            required={true}
          />
          <Textinput 
            label="CNIC" 
            register={register} 
            name="personal.cnic" 
            error={fieldErrors["personal.cnic"] ? { message: fieldErrors["personal.cnic"] } : (errors.personal?.cnic?.message ? { message: errors.personal.cnic.message } : null)}
            placeholder="00000-0000000-0"
            required={true}
            isDigitOnly={true}
            onDigitValidation={validateDigitOnly}
          />
          <Textinput 
            label="Date of Birth" 
            type="date" 
            register={register} 
            name="personal.dob" 
            id="personal-dob"
            error={fieldErrors["personal.dob"] ? { message: fieldErrors["personal.dob"] } : (errors.personal?.dob?.message ? { message: errors.personal.dob.message } : null)}
            required={true}
          />
          <div className="md:col-span-2">
            <Select
              label="Gender"
              name="personal.gender"
              options={genderOptions}
              error={fieldErrors["personal.gender"] ? { message: fieldErrors["personal.gender"] } : (errors.personal?.gender?.message ? { message: errors.personal.gender.message } : null)}
              width="w-48"
              placeholder="Select Gender"
              required={true}
              {...register("personal.gender")}
            />
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:phone" className="mr-2" />
          Contact Information
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Textinput 
            label="Email Address" 
            type="email" 
            register={register} 
            name="personal.email" 
            error={fieldErrors["personal.email"] ? { message: fieldErrors["personal.email"] } : (errors.personal?.email?.message ? { message: errors.personal.email.message } : null)}
            placeholder="your.email@example.com"
            required={true}
          />
          <Textinput 
            label="Phone Number" 
            register={register} 
            name="personal.phone" 
            error={fieldErrors["personal.phone"] ? { message: fieldErrors["personal.phone"] } : (errors.personal?.phone?.message ? { message: errors.personal.phone.message } : null) || (finalDigitErrors["personal.phone"] ? { message: finalDigitErrors["personal.phone"] } : null)}
            placeholder="+92-300-1234567"
            required={true}
            isDigitOnly={true}
            onDigitValidation={validateDigitOnly}
          />
          <Textinput 
            label="Emergency Contact Name" 
            register={register} 
            name="personal.emergency_contact_name" 
            error={errors.personal?.emergency_contact_name?.message ? { message: errors.personal.emergency_contact_name.message } : null}
            placeholder="Emergency contact person name"
          />
          <Textinput 
            label="Emergency Contact Phone" 
            register={register} 
            name="personal.emergency_contact_phone" 
            error={errors.personal?.emergency_contact_phone?.message ? { message: errors.personal.emergency_contact_phone.message } : (finalDigitErrors["personal.emergency_contact_phone"] ? { message: finalDigitErrors["personal.emergency_contact_phone"] } : null)}
            placeholder="+92-300-1234567"
            isDigitOnly={true}
            onDigitValidation={validateDigitOnly}
          />
        </div>
      </div>

      {/* Address Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:map-pin" className="mr-2" />
          Address Information
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Current Address <span className="text-red-500">*</span></label>
            <textarea
              {...register("personal.address")}
              className="input rounded border border-gray-300 w-full py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors duration-200"
              rows={4}
              placeholder="Enter your complete residential address"
            />
            {(fieldErrors["personal.address"] || errors.personal?.address?.message) && <p className="text-red-500 text-sm mt-1">{fieldErrors["personal.address"] || errors.personal?.address?.message}</p>}
          </div>
          <Textinput 
            label="City" 
            register={register} 
            name="personal.city" 
            error={fieldErrors["personal.city"] ? { message: fieldErrors["personal.city"] } : (errors.personal?.city?.message ? { message: errors.personal.city.message } : null)}
            placeholder="Enter your city"
            required={true}
          />
          <Textinput 
            label="Province/State" 
            register={register} 
            name="personal.province" 
            error={fieldErrors["personal.province"] ? { message: fieldErrors["personal.province"] } : (errors.personal?.province?.message ? { message: errors.personal.province.message } : null)}
            placeholder="Enter your province/state"
            required={true}
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:info" className="mr-2" />
          Additional Information
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          <Textinput 
            label="Nationality" 
            register={register} 
            name="personal.nationality" 
            error={fieldErrors["personal.nationality"] ? { message: fieldErrors["personal.nationality"] } : (errors.personal?.nationality?.message ? { message: errors.personal.nationality.message } : null)}
            placeholder="e.g., Pakistani"
            required={true}
          />
          <Textinput 
            label="Marital Status" 
            register={register} 
            name="personal.marital_status" 
            error={errors.personal?.marital_status?.message ? { message: errors.personal.marital_status.message } : null}
            placeholder="e.g., Single, Married"
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Icon icon="ph:upload" className="mr-2" />
          Documents
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Photo (JPG/PNG/WEBP) <span className="text-red-500">*</span></label>
            {!selectedPhoto ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Fileinput
                  name="personal.photo"
                  selectedFile={selectedPhoto}
                  preview={false}
                  onChange={handlePhotoChange}
                  className="cursor-pointer"
                >
                  <div className="space-y-2">
                    <Icon icon="ph:camera" className="text-3xl text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                  </div>
                </Fileinput>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={URL.createObjectURL(selectedPhoto)} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedPhoto.name}</p>
                    <p className="text-xs text-gray-500">{(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    text="Remove"
                    className="btn-danger btn-sm"
                    onClick={deletePhoto}
                  />
                </div>
              </div>
            )}
                         {(errors.personal?.photo?.message || photoError) && <p className="text-red-500 text-sm mt-1">{errors.personal?.photo?.message || photoError}</p>}
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Resume/CV (PDF) <span className="text-red-500">*</span></label>
            {!selectedResume ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Fileinput
                  name="personal.resume"
                  selectedFile={selectedResume}
                  preview={false}
                  onChange={handleResumeChange}
                  className="cursor-pointer"
                >
                  <div className="space-y-2">
                    <Icon icon="ph:file-pdf" className="text-3xl text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload resume</p>
                    <p className="text-xs text-gray-500">PDF format, Max size: 5MB</p>
                  </div>
                </Fileinput>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon icon="ph:file-pdf" className="text-3xl text-red-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{selectedResume.name}</p>
                    <p className="text-xs text-gray-500">{(selectedResume.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    text="Remove"
                    className="btn-danger btn-sm"
                    onClick={deleteResume}
                  />
                </div>
              </div>
            )}
                         {(errors.personal?.resume?.message || resumeError) && <p className="text-red-500 text-sm mt-1">{errors.personal?.resume?.message || resumeError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;