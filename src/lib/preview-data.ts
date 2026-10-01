import { addDays } from "@/lib/dates";

export const DOCUMENT_TYPES = [
  "CNIC",
  "Passport",
  "Driving License",
  "Vehicle Papers",
  "Insurance",
  "Academic Deadline",
  "Other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type PreviewDocument = {
  id: string;
  title: string;
  type: DocumentType;
  person: string;
  expiryDate: Date;
};

export const PREVIEW_FAMILY = "Khan Household";

export const PREVIEW_DOCUMENTS: PreviewDocument[] = [
  {
    id: "father-passport",
    title: "Father's passport",
    type: "Passport",
    person: "Father",
    expiryDate: addDays(new Date(), 18),
  },
  {
    id: "mother-cnic",
    title: "Mother's CNIC",
    type: "CNIC",
    person: "Mother",
    expiryDate: addDays(new Date(), 6),
  },
  {
    id: "car-insurance",
    title: "Family car insurance",
    type: "Insurance",
    person: "Father",
    expiryDate: addDays(new Date(), -4),
  },
  {
    id: "brother-license",
    title: "Brother's driving license",
    type: "Driving License",
    person: "Brother",
    expiryDate: addDays(new Date(), 86),
  },
];
