export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p role="alert" className="rounded-xl bg-crimson-soft px-4 py-3 text-sm text-crimson">
      {message}
    </p>
  );
}
