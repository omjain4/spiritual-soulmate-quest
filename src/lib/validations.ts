import { z } from "zod";

// Helper function to calculate age from birthdate
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const basicInfoSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  birthDate: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const age = calculateAge(date);
      return age >= 18;
    }, "You must be at least 18 years old")
    .refine((date) => {
      const age = calculateAge(date);
      return age <= 100;
    }, "Please enter a valid date of birth"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  occupation: z
    .string()
    .trim()
    .min(2, "Occupation must be at least 2 characters")
    .max(100, "Occupation must be less than 100 characters"),
});

export const profileEditSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  birthDate: z
    .string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const age = calculateAge(date);
      return age >= 18;
    }, "You must be at least 18 years old"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
  occupation: z
    .string()
    .trim()
    .min(2, "Occupation must be at least 2 characters")
    .max(100, "Occupation must be less than 100 characters"),
  company: z
    .string()
    .trim()
    .max(100, "Company must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  education: z
    .string()
    .trim()
    .max(200, "Education must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  sect: z.string().min(1, "Please select a sect"),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
