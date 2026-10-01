import { Card, CardTitle } from "@/components/ui/card";

export function ComingSoon({
  title,
  chapter,
  detail,
}: {
  title: string;
  chapter: string;
  detail: string;
}) {
  return (
    <Card>
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        {chapter}
      </p>
      <CardTitle className="mt-2">{title}</CardTitle>
      <p className="mt-3 max-w-md text-ink-muted">{detail}</p>
    </Card>
  );
}
