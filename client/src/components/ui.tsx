import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function StatCard({
  label,
  value,
  tone = "teal",
}: {
  label: string;
  value: string | number;
  tone?: "teal" | "blue" | "gold" | "rose";
}) {
  return (
    <Card className={`stat-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="page-header">
      <p className="kicker">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="status-pill">{children}</span>;
}
