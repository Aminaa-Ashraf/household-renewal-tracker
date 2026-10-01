"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatLongDate, formatRelativeExpiry } from "@/lib/dates";
import { getUrgency } from "@/lib/document-status";
import { DOCUMENT_TYPE_OPTIONS, documentTypeLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

export type DueSoonItem = {
  id: string;
  title: string;
  type: string;
  person: string;
  personId: string;
  expiryDate: string;
};

export function DueSoonList({
  documents,
  canAdd,
}: {
  documents: DueSoonItem[];
  canAdd: boolean;
}) {
  const [person, setPerson] = useState("all");
  const [type, setType] = useState("all");

  const people = useMemo(() => {
    const map = new Map<string, string>();
    for (const doc of documents) {
      map.set(doc.personId, doc.person);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [documents]);

  const visible = documents
    .filter((doc) => (person === "all" ? true : doc.personId === person))
    .filter((doc) => (type === "all" ? true : doc.type === type))
    .slice()
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
    );

  if (documents.length === 0) {
    return (
      <Card className="surface-3d-strong grid gap-4 text-center">
        <p className="font-display text-xl font-semibold">
          Add the first 3 papers
        </p>
        <p className="text-ink-muted">
          Start with a CNIC, a passport, and one vehicle or insurance paper.
          The home screen will then show what is due soon.
        </p>
        {canAdd ? (
          <div className="flex justify-center">
            <ButtonLink href="/documents/new">Add a paper</ButtonLink>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            Ask an owner or member to upload the first papers.
          </p>
        )}
      </Card>
    );
  }

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
            ...people.map(([id, name]) => ({ value: id, label: name })),
          ]}
        />
        <FilterField
          id="filter-type"
          label="Document type"
          value={type}
          onChange={setType}
          options={[
            { value: "all", label: "All types" },
            ...DOCUMENT_TYPE_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            })),
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <Card className="text-center">
          <p className="font-display text-lg font-semibold">No papers match</p>
          <p className="mt-2 text-sm text-ink-muted">
            Try Everyone and All types.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-3">
          {visible.map((doc, index) => (
            <DueSoonCard
              key={doc.id}
              document={doc}
              className={cn(
                "animate-rise",
                index === 1 && "animate-rise-delay-1",
                index === 2 && "animate-rise-delay-2",
                index >= 3 && "animate-rise-delay-3",
              )}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function DueSoonCard({
  document,
  className,
}: {
  document: DueSoonItem;
  className?: string;
}) {
  const expiry = new Date(document.expiryDate);
  const urgency = getUrgency(expiry);
  const rail = {
    safe: "border-l-olive",
    due30: "border-l-amber",
    due7: "border-l-accent",
    expired: "border-l-crimson",
  }[urgency];

  return (
    <li className={className}>
      <Link
        href={`/documents/${document.id}`}
        className={cn(
          "surface-3d pressable block rounded-[1.35rem] border-l-4 p-4 pl-5",
          "hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
          rail,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              {document.title}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {document.person} · {documentTypeLabel(document.type)}
            </p>
          </div>
          <StatusBadge urgency={urgency} />
        </div>
        <p className="mt-4 text-base font-semibold tracking-tight">
          {formatRelativeExpiry(expiry)}
        </p>
        <p className="text-sm text-ink-muted">{formatLongDate(expiry)}</p>
      </Link>
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
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 rounded-2xl border border-rule bg-gradient-to-b from-white to-paper-raised px-3 text-base shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_16px_-14px_rgba(11,18,32,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
