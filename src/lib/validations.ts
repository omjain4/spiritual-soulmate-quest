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

// Message validation schema for chat
export const messageSchema = z.object({
  content: z
    .string()
    .max(5000, "Message must be less than 5000 characters")
    .optional()
    .nullable(),
  media_type: z
    .enum(["image", "video", "audio", "file"])
    .optional()
    .nullable(),
  media_url: z
    .string()
    .url("Invalid media URL")
    .max(2000, "URL must be less than 2000 characters")
    .optional()
    .nullable(),
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .nullable(),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional()
    .nullable(),
  occupation: z
    .string()
    .max(100, "Occupation must be less than 100 characters")
    .optional()
    .nullable(),
  education: z
    .string()
    .max(200, "Education must be less than 200 characters")
    .optional()
    .nullable(),
  height: z
    .string()
    .max(20, "Height must be less than 20 characters")
    .optional()
    .nullable(),
  community: z
    .string()
    .max(100, "Community must be less than 100 characters")
    .optional()
    .nullable(),
  dietary_preference: z
    .string()
    .max(50, "Dietary preference must be less than 50 characters")
    .optional()
    .nullable(),
  gender: z
    .string()
    .max(20, "Gender must be less than 20 characters")
    .optional()
    .nullable(),
  photos: z
    .array(z.string().url().max(2000))
    .max(6, "Maximum 6 photos allowed")
    .optional(),
  interests: z
    .array(z.string().max(50))
    .max(20, "Maximum 20 interests allowed")
    .optional(),
});

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ProfileEditFormData = z.infer<typeof profileEditSchema>;
export type MessageData = z.infer<typeof messageSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
