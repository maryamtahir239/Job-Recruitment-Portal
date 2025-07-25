import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Fileinput from '@/components/ui/Fileinput';
import Button from '@/components/ui/Button'; // Assuming Button is also in ui

const PersonalInfo = ({
  register,
  errors,
  selectedPhoto,
  handlePhotoChange,
  deletePhoto,
  photoError,
  selectedResume,
  handleResumeChange,
  deleteResume,
  resumeError,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      <Textinput label="Full Name" register={register} name="personal.full_name" error={errors.personal?.full_name?.message} />
      <Textinput label="Father's/Husband's Name" register={register} name="personal.father_name" error={errors.personal?.father_name?.message} />
      <Textinput label="CNIC" register={register} name="personal.cnic" error={errors.personal?.cnic?.message} />
      <Textinput label="Email" type="email" register={register} name="personal.email" error={errors.personal?.email?.message} />
      <Textinput label="Phone" register={register} name="personal.phone" error={errors.personal?.phone?.message} />
      <Textinput label="Date of Birth" type="date" register={register} name="personal.dob" error={errors.personal?.dob?.message} />

      <div className="md:col-span-2">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              {...register("personal.gender")}
              className="input rounded border-gray-300 w-full"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.personal?.gender && <p className="text-red-500 text-sm mt-1">{errors.personal.gender.message}</p>}
          </div>
          <div className="col-span-2"></div> {/* Empty div for layout */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              {...register("personal.address")}
              className="input rounded border-gray-300 w-full"
              rows={4}
              placeholder=" Residential Address"
            />
            {errors.personal?.address && <p className="text-red-500 text-sm mt-1">{errors.personal.address.message}</p>}
          </div>
        </div>
      </div>

      {/* Photo Upload */}
      <div className="cursor-pointer">
        <label className="block text-sm font-medium mb-1">Photo (JPG/PNG/WEBP)</label>
        {!selectedPhoto ? (
          <Fileinput
            name="personal.photo"
            selectedFile={selectedPhoto}
            preview={false}
            onChange={handlePhotoChange}
            error={errors.personal?.photo?.message || photoError}
          >
            <Button
              div
              icon="ph:upload"
              text="Choose Photo"
              iconClass="text-2xl"
              className="cursor-pointer bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
            />
          </Fileinput>
        ) : (
          <div>
            <p className="text-sm mt-2 text-gray-600">{selectedPhoto.name}</p>
            <Button
              type="button"
              text="Delete Photo"
              className="btn-danger btn-sm mt-2"
              onClick={deletePhoto}
            />
          </div>
        )}
        {errors.personal?.photo && <p className="text-red-500 text-sm mt-1">{errors.personal.photo.message}</p>}
      </div>

      {/* Resume Upload */}
      <div className="cursor-pointer">
        <label className="block text-sm font-medium mb-1">Resume (.PDF)</label>
        {!selectedResume ? (
          <Fileinput
            name="personal.resume"
            selectedFile={selectedResume}
            preview={false}
            onChange={handleResumeChange}
            error={errors.personal?.resume?.message || resumeError}
          >
            <Button
              div
              icon="ph:upload"
              text="Upload Resume"
              iconClass="text-2xl"
              className="cursor-pointer bg-gray-100 dark:bg-gray-700 dark:text-gray-300 text-gray-600 btn-sm"
            />
          </Fileinput>
        ) : (
          <div>
            <p className="text-sm mt-2 text-gray-600">{selectedResume.name}</p>
            <Button
              type="button"
              text="Delete Resume"
              className="btn-danger btn-sm mt-2"
              onClick={deleteResume}
            />
          </div>
        )}
        {errors.personal?.resume && <p className="text-red-500 text-sm mt-1">{errors.personal.resume.message}</p>}
      </div>
    </div>
  );
};

export default PersonalInfo;