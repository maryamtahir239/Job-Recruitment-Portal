import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { applicationFormZ } from "@/lib/applicationFormZod"; // Ensure you have this schema
import Button from "@/components/ui/Button";

const MultiStepJobApplicationForm = ({ token, invite }) => {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    resolver: zodResolver(applicationFormZ),
    defaultValues: {
      personal: {
        full_name: invite?.candidate?.name || "",
        email: invite?.candidate?.email || "",
      },
      education: [{ level: "", institution: "", course_of_study: "" }],
      experience: [],
      references: [{}, {}],
    },
  });

  const { control, handleSubmit } = form;
  const { fields: eduFields, append: addEducation } = useFieldArray({
    control,
    name: "education",
  });
  const { fields: expFields, append: addExperience } = useFieldArray({
    control,
    name: "experience",
  });
  const { fields: refFields, append: addReference } = useFieldArray({
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

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  async function onSubmit(values) {
    try {
      await axios.post(`/api/invites/${token}/submit`, values);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Submission failed");
    }
  }

  if (success) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Thank you!</h2>
        <p>Your job application has been submitted successfully.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-6">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-sm ${
              i === step ? "font-bold text-blue-600" : "text-gray-500"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium">Full Name</label>
            <input
              {...form.register("personal.full_name")}
              className="input"
              placeholder="Full Name"
            />
            {form.formState.errors.personal?.full_name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.personal.full_name.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              {...form.register("personal.email")}
              className="input"
              placeholder="Email"
              type="email"
            />
            {form.formState.errors.personal?.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.personal.email.message}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Education</h3>
          {eduFields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <label className="block text-sm font-medium">Institution</label>
              <input
                {...form.register(`education.${index}.institution`)}
                className="input"
                placeholder="Institution"
              />
              <label className="block text-sm font-medium mt-2">Course</label>
              <input
                {...form.register(`education.${index}.course_of_study`)}
                className="input"
                placeholder="Course"
              />
            </div>
          ))}
          <Button
            text="Add Education"
            type="button"
            className="mt-2"
            onClick={() => addEducation({ level: "", institution: "", course_of_study: "" })}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Experience</h3>
          {expFields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <label className="block text-sm font-medium">Company Name</label>
              <input
                {...form.register(`experience.${index}.company_name`)}
                className="input"
                placeholder="Company Name"
              />
              <label className="block text-sm font-medium mt-2">Position</label>
              <input
                {...form.register(`experience.${index}.position_held`)}
                className="input"
                placeholder="Position"
              />
            </div>
          ))}
          <Button
            text="Add Experience"
            type="button"
            className="mt-2"
            onClick={() => addExperience({ company_name: "", position_held: "" })}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">References</h3>
          {refFields.map((field, index) => (
            <div key={field.id} className="mb-4">
              <label className="block text-sm font-medium">Name</label>
              <input
                {...form.register(`references.${index}.ref_name`)}
                className="input"
                placeholder="Reference Name"
              />
              <label className="block text-sm font-medium mt-2">Phone</label>
              <input
                {...form.register(`references.${index}.ref_phone`)}
                className="input"
                placeholder="Reference Phone"
              />
            </div>
          ))}
          <Button
            text="Add Reference"
            type="button"
            className="mt-2"
            onClick={() => addReference({ ref_name: "", ref_phone: "" })}
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
          <p>Review your application details and click Submit.</p>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 0 && (
          <Button
            text="Previous"
            type="button"
            className="bg-gray-400 text-white px-4 py-2"
            onClick={prevStep}
          />
        )}
        {step < steps.length - 1 ? (
          <Button
            text="Next"
            type="button"
            className="bg-blue-600 text-white px-4 py-2"
            onClick={nextStep}
          />
        ) : (
          <Button
            text="Submit Application"
            type="submit"
            className="bg-green-600 text-white px-4 py-2"
          />
        )}
      </div>
    </form>
  );
};

export default MultiStepJobApplicationForm;
