export default function RichText({ text, className }) {
  const parts = String(text || '').split('`');
  return (
    <span className={`whitespace-pre-wrap ${className || ''}`}>
      {parts.map((part, i) =>
        i % 2 ? (
          <code key={i} className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.88em] text-ember-200">{part}</code>
        ) : (
          part
        )
      )}
    </span>
  );
}
