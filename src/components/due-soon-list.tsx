"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { getUrgency } from "@/lib/document-status";
import {
  DOCUMENT_TYPES,
  type PreviewDocument,
} from "@/lib/preview-data";
import { cn } from "@/lib/utils";

export function DueSoonList({ documents }: { documents: PreviewDocument[] }) {
  const [person, setPerson] = useState("all");
  const [type, setType] = useState("all");

  const people = useMemo(
    () => [...new Set(documents.map((doc) => doc.person))].sort(),
    [documents],
  );

  const visible = documents
    .filter((doc) => (person === "all" ? true : doc.person === person))
    .filter((doc) => (type === "all" ? true : doc.type === type))
    .slice()
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <FilterField
          id="filter-person"
          label="Person"
          value={person}
          onChange={setPerson}
          options={[
            { value: "all", label: "Everyone" },
            ...people.map((name) => ({ value: name, label: name })),
          ]}
        />
        <FilterField
          id="filter-type"
          label="Document type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All types" },
            ...DOCUMENT_TYPES.map((name) => ({ value: name, label: name })),
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyFilterState />
      ) : (
        <ul className="grid gap-3">
          {visible.map((doc) => (
            <DueSoonCard key={doc.id} document={doc} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DueSoonCard({ document }: { document: PreviewDocument }) {
  const urgency = getUrgency(document.expiryDate);
  const rail = {
    safe: "border-l-olive",
    due30: "border-l-amber",
    due7: "border-l-terracotta",
    expired: "border-l-crimson",
  }[urgency];

  return (
    <li>
      <article
        className={cn(
          "rounded-2xl border border-rule bg-paper-raised p-4 pl-5 shadow-[0_1px_0_rgba(28,25,20,0.04)]",
          "border-l-4",
          rail,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">{document.title}</h3>
            <p className="mt-1 text-sm text-ink-muted">
              {document.person} · {document.type}
            </p>
          </div>
          <StatusBadge urgency={urgency} />
        </div>
        <p className="mt-4 text-base font-medium">
          {formatRelativeExpiry(document.expiryDate)}
        </p>
        <p className="text-sm text-ink-muted">
          {formatLongDate(document.expiryDate)}
        </p>
      </article>
    </li>
  );
}

function FilterField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-xl border border-rule bg-paper-raised px-3 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyFilterState() {
  return (
    <Card className="text-center">
      <p className="font-display text-lg font-semibold">No papers match</p>
      <p className="mt-2 text-sm text-ink-muted">
        Try Everyone and All types, or add a paper in a later chapter.
      </p>
    </Card>
  );
}
