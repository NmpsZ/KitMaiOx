interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#E4D5C9] bg-white/75 px-6 py-12 text-center shadow-sm">
      <p className="text-lg font-semibold text-[#2B211D]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8B7568]">{description}</p>
    </div>
  );
}
