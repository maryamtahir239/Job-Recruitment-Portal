import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';

const Education = ({ register, errors, eduFields, addEducation, removeEducation }) => {
  return (
    <div>
      {eduFields.map((field, index) => (
        <div key={field.id} className="grid md:grid-cols-4 gap-4 mb-4">
          <Textinput label="Level" register={register} name={`education.${index}.level`} error={errors.education?.[index]?.level?.message} />
          <Textinput label="Institution" register={register} name={`education.${index}.institution`} error={errors.education?.[index]?.institution?.message} />
          <Textinput label="Course" register={register} name={`education.${index}.course_of_study`} error={errors.education?.[index]?.course_of_study?.message} />
          <Textinput label="Passing Year" register={register} name={`education.${index}.passing_year`} error={errors.education?.[index]?.passing_year?.message} />
          <div className="col-span-4 text-right">
            {eduFields.length > 1 && (
              <Button text="Remove" type="button" onClick={() => removeEducation(index)} className="btn-danger btn-sm" />
            )}
          </div>
        </div>
      ))}
      <Button text="Add Education" type="button" onClick={() => addEducation({ level: "", institution: "", course_of_study: "", passing_year: "" })} className="btn-primary mt-2" />
      {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education?.message}</p>}
    </div>
  );
};

export default Education;