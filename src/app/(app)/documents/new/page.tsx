import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Add document",
};

export default function NewDocumentPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Add a paper
        </h1>
        <p className="mt-2 text-ink-muted">
          The form look is here. Saving to Postgres starts in Chapter 5.
        </p>
      </header>

      <ComingSoon
        title="This form will create a real document"
        chapter="Chapter 5"
        detail="You will type a title, pick a type, choose a family member, and set an expiry date. Nothing is stored yet."
      />

      <form className="grid gap-4" aria-disabled="true">
        <Input
          label="Title"
          name="title"
          placeholder="Papa's passport"
          disabled
        />
        <Input
          label="Expiry date"
          name="expiryDate"
          type="date"
          hint="Required once this page is live."
          disabled
        />
      </form>
    </div>
  );
}
