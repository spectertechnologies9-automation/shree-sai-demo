import { Fragment } from "react";

type Props = { text: string; by?: "char" | "word"; className?: string };

/** Splits text into animatable spans while keeping it one phrase for screen readers. */
export default function Split({ text, by = "char", className }: Props) {
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="inline-block whitespace-nowrap" aria-hidden>
            {by === "word" ? (
              <span className="split-word">{word}</span>
            ) : (
              word.split("").map((c, i) => (
                <span key={i} className="split-char">
                  {c}
                </span>
              ))
            )}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
