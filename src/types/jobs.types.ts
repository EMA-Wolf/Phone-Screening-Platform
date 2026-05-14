export interface Job {
  id: string;
  title: string;
  location: string;
  employmentType: "Full-time" | "Part-time" | "Internship" | "NSS";
  description: string;
}