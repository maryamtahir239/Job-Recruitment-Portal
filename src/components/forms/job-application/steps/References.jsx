import React from 'react';
import Textinput from '@/components/ui/Textinput';
import Button from '@/components/ui/Button';

const References = ({ register, errors, refFields, addReference, removeReference }) => {
  return (
    <div>
      {refFields.map((field, index) => (
        <div key={field.id} className="grid md:grid-cols-2 gap-4 mb-4">
          <Textinput label="Reference Name" register={register} name={`references.${index}.ref_name`} error={errors.references?.[index]?.ref_name?.message} />
          <Textinput label="Phone" register={register} name={`references.${index}.ref_phone`} error={errors.references?.[index]?.ref_phone?.message} />
          <div className="col-span-2 text-right">
            {refFields.length > 0 && (
              <Button text="Remove" type="button" onClick={() => removeReference(index)} className="btn-danger btn-sm" />
            )}
          </div>
        </div>
      ))}
      <Button text="Add Reference" type="button" onClick={() => addReference({ ref_name: "", ref_phone: "" })} className="btn-primary mt-2" />
      {errors.references && <p className="text-red-500 text-sm mt-1">{errors.references?.message}</p>}
    </div>
  );
};

export default References;