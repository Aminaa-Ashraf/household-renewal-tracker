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
    id: "papa-passport",
    title: "Papa's passport",
    type: "Passport",
    person: "Papa",
    expiryDate: addDays(new Date(), 18),
  },
  {
    id: "ammi-cnic",
    title: "Ammi's CNIC",
    type: "CNIC",
    person: "Ammi",
    expiryDate: addDays(new Date(), 6),
  },
  {
    id: "car-insurance",
    title: "Family car insurance",
    type: "Insurance",
    person: "Papa",
    expiryDate: addDays(new Date(), -4),
  },
  {
    id: "hassan-license",
    title: "Hassan's driving license",
    type: "Driving License",
    person: "Hassan",
    expiryDate: addDays(new Date(), 86),
  },
];
