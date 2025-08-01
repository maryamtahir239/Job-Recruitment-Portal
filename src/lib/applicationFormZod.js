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

// Resume validation - required
const resumeSchema = z
  .union([z.instanceof(File), z.null(), z.undefined()])
  .refine((file) => {
    if (file === null || file === undefined) {
      return false; // Resume is required
    }
    return file instanceof File;
  }, { message: "Resume is required" })
  .refine((file) => {
    if (file === null || file === undefined) return false;
    return file.size < 5 * 1024 * 1024; // < 5MB
  }, { message: "File must be less than 5MB" })
  .refine((file) => {
    if (file === null || file === undefined) return false;
    return file.type === "application/pdf";
  }, { message: "Only PDF files are allowed for resume" });

// Photo validation - required
const photoSchema = z
  .union([z.instanceof(File), z.null(), z.undefined()])
  .refine((file) => {
    if (file === null || file === undefined) {
      return false; // Photo is required
    }
    return file instanceof File;
  }, { message: "Profile photo is required" })
  .refine((file) => {
    if (file === null || file === undefined) return false;
    return file.size < 5 * 1024 * 1024; // Assuming 5MB limit, adjust if needed
  }, { message: "Image must be less than 5MB" })
  .refine(
    (file) => {
      if (file === null || file === undefined) return false;
      return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);
    },
    { message: "Only JPG, PNG, or WEBP allowed" }
  );

// Main schema
export const applicationFormZ = z.object({
  personal: z.object({
    full_name: z.string().min(2, "Full name is required"),
    father_name: z.string().min(2, "Father's/Husband's name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(6, "Phone number is required"),
    cnic: z.string().min(5, "CNIC is required"),
    dob: z.string().min(4, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province/State is required"),
    nationality: z.string().min(1, "Nationality is required"),
    marital_status: z.string().optional(),
    willing_to_relocate: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    photo: photoSchema,
    resume: resumeSchema,
  }),

  education: z
    .array(
      z.object({
        level: z.string().min(1, "Education level is required"),
        institution: z.string().min(1, "Institution name is required"),
        course_of_study: z.string().min(1, "Course of study is required"),
        passing_year: z.string()
          .min(1, "Passing year is required")
          .regex(/^\d{4}$/, "Invalid year format (YYYY)"),
        gpa: z.string().optional().default(""),
        status: z.string().optional().default(""),
        additional_details: z.string().optional().default(""),
      })
    )
    .min(1, "At least one education entry required"),

  experience: z
    .array(
      z.object({
        company_name: z.string().min(1, "Company name is required"),
        position_held: z.string().min(1, "Job title is required"),
        employment_type: z.string().min(1, "Employment type is required"),
        industry: z.string().optional().default(""),
        from: z.string().min(1, "Start date is required"),
        to: z.string().optional().default(""),
        is_current: z.boolean().optional().default(false),
        salary: z.string().optional().default(""),
        reason_for_leaving: z.string().optional().default(""),
        job_description: z.string().min(1, "Job description is required"),
        achievements: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),

  isFresher: z.boolean().optional().default(false),

  references: z
    .array(
      z.object({
        ref_name: z.string().min(1, "Reference name is required"),
        ref_phone: z.string().min(1, "Reference phone number is required"),
        ref_email: z.string().email("Invalid email").optional().or(z.literal("")),
        relationship: z.string().min(1, "Relationship is required"),
        ref_company: z.string().optional().default(""),
        ref_job_title: z.string().optional().default(""),
        known_duration: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),

  hasReferences: z.boolean().optional().default(false),



  additional: z.object({
    why_interested: z.string().optional(),
    career_goals: z.string().optional(),
    expected_salary: z.string().optional(),
    notice_period: z.string().optional(),
  }).optional(),
});