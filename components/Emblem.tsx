type Props = { className?: string; draw?: boolean; title?: string };

/**
 * House emblem: a palace archway holding a lamp flame.
 * Drawn for this site (no official logo file was supplied). Every stroke has
 * pathLength=1 so the opening can draw it with a single dash offset.
 */
export default function Emblem({ className, draw, title }: Props) {
  const p = draw ? { pathLength: 1, className: "emblem-stroke" } : {};
  return (
    <svg
      viewBox="0 0 80 96"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* outer arch */}
      <path {...p} d="M8 92V40C8 22 22 12 40 4c18 8 32 18 32 36v52" />
      {/* inner cusped arch */}
      <path {...p} d="M18 92V43c0-6 4-9 8-11 1-6 7-10 14-15 7 5 13 9 14 15 4 2 8 5 8 11v49" />
      {/* plinth */}
      <path {...p} d="M2 92h76" />
      {/* flame */}
      <path {...p} d="M40 38c-6 8-9 13-9 19a9 9 0 0 0 18 0c0-6-3-11-9-19Z" />
      <path {...p} d="M40 50c-2 3-3 5-3 7a3 3 0 0 0 6 0c0-2-1-4-3-7Z" />
      {/* lamp base */}
      <path {...p} d="M28 72h24M32 72c2 6 5 9 8 9s6-3 8-9" />
      {/* finial */}
      <path {...p} d="M40 4V0" />
    </svg>
  );
}
