import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';

const Experience = ({ register, errors, expFields, addExperience, removeExperience }) => {
  return (
    <div>
      {expFields.map((field, index) => (
        <div key={field.id} className="grid md:grid-cols-4 gap-4 mb-4">
          <Textinput label="Company Name" register={register} name={`experience.${index}.company_name`} error={errors.experience?.[index]?.company_name?.message} />
          <Textinput label="Position Held" register={register} name={`experience.${index}.position_held`} error={errors.experience?.[index]?.position_held?.message} />
          <Textinput label="From Date" type="date" register={register} name={`experience.${index}.from`} error={errors.experience?.[index]?.from?.message} />
          <Textinput label="To Date" type="date" register={register} name={`experience.${index}.to`} error={errors.experience?.[index]?.to?.message} />
          <div className="col-span-4 text-right">
            {expFields.length > 0 && (
              <Button text="Remove" type="button" onClick={() => removeExperience(index)} className="btn-danger btn-sm" />
            )}
          </div>
        </div>
      ))}
      <Button text="Add Experience" type="button" onClick={() => addExperience({ company_name: "", position_held: "", from: "", to: "" })} className="btn-primary mt-2" />
      {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience?.message}</p>}
    </div>
  );
};

export default Experience;