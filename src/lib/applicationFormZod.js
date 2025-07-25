// src/lib/applicationFormZod.js
import { z } from "zod";

// Define the base schema for a file that can be optional (null or undefined)
const optionalFileSchema = z
  .union([z.instanceof(File), z.null(), z.undefined()])
  .refine(
    (file) => {
      if (file === null || file === undefined) return true;
      return file instanceof File;
    },
    { message: "Invalid file type" }
  );

// Resume validation
const resumeSchema = optionalFileSchema
  .refine((file) => {
    if (file instanceof File) {
      return file.size < 5 * 1024 * 1024; // < 5MB
    }
    return true;
  }, { message: "File must be less than 5MB" })
  .refine((file) => {
    if (file instanceof File) {
      return file.type === "application/pdf";
    }
    return true;
  }, { message: "Only PDF files are allowed for resume" });

// Photo validation
const photoSchema = optionalFileSchema
  .refine((file) => {
    if (file instanceof File) {
      return file.size < 5 * 1024 * 1024; // Assuming 5MB limit, adjust if needed
    }
    return true;
  }, { message: "Image must be less than 5MB" })
  .refine(
    (file) => {
      if (file instanceof File) {
        return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
      }
      return true;
    },
    { message: "Only JPG, PNG, or WEBP allowed" }
  );

// Main schema
export const applicationFormZ = z.object({
  personal: z.object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(6, "Phone number required"),
    cnic: z.string().min(5, "CNIC is required"),
    dob: z.string().min(4, "Date of birth is required"), // Keeping min(4) for YYYY, but type="date" handles format
    address: z.string().min(5, "Address is required"),
    photo: photoSchema,
    resume: resumeSchema,
  }),

  education: z
    .array(
      z.object({
        level: z.string().min(1, "Level is required"),
        institution: z.string().min(1, "Institution is required"),
        course_of_study: z.string().min(1, "Course of study is required"),
        passing_year: z.string()
          .min(1, "Passing year is required")
          .regex(/^\d{4}$/, "Invalid year format (YYYY)"), // Regex for YYYY format
      })
    )
    .min(1, "At least one education entry required"), // Removed .default([]) as it conflicts with .min(1) for mandatory array

  experience: z
    .array(
      z.object({
        company_name: z.string().min(1, "Company name is required"),
        position_held: z.string().min(1, "Position held is required"),
        from: z.string().min(1, "Start date is required"), // No regex for date format here, as requested
        to: z.string().min(1, "End date is required"),     // No regex for date format here, as requested
      })
    )
    .default([]), // Keep .default([]) for optional experience entries

  references: z
    .array(
      z.object({
        ref_name: z.string().min(1, "Reference name is required"),
        ref_phone: z.string().min(1, "Reference phone is required"),
      })
    )
    .default([]), // Keep .default([]) for optional references entries
});