"use client";

import type { ReactNode } from "react";
import ClarifyTerm from "@/components/ui/ClarifyTerm";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";

/**
 * Wraps known anatomical terms inside a plain string with ClarifyTerm,
 * leaving the rest of the text untouched. Used for engine-owned day titles
 * / exercise names where we must not rename the source string.
 */
const WORD_TO_TERM: Array<{ re: RegExp; term: keyof typeof CLARIFY }> = [
  { re: /\bScapular\b|\bscapular\b|\bScapulae\b|\bscapulae\b|\bScapula\b|\bscapula\b/g, term: "Scapular" },
  { re: /\bThoracic\b|\bthoracic\b/g, term: "Thoracic" },
];

export default function ClarifyWords({ text }: { text: string }): ReactNode {
  type Hit = { start: number; end: number; matched: string; term: keyof typeof CLARIFY };
  const hits: Hit[] = [];
  for (const { re, term } of WORD_TO_TERM) {
    const local = new RegExp(re.source, re.flags);
    let m: RegExpExecArray | null;
    while ((m = local.exec(text)) !== null) {
      hits.push({
        start: m.index,
        end: m.index + m[0].length,
        matched: m[0],
        term,
      });
    }
  }
  if (hits.length === 0) return text;

  hits.sort((a, b) => a.start - b.start);
  const nodes: ReactNode[] = [];
  let cursor = 0;
  hits.forEach((hit, idx) => {
    if (hit.start < cursor) return;
    if (hit.start > cursor) nodes.push(text.slice(cursor, hit.start));
    nodes.push(
      <ClarifyTerm key={`${hit.term}-${idx}`} term={hit.term} explanation={CLARIFY[hit.term]}>
        {hit.matched}
      </ClarifyTerm>
    );
    cursor = hit.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
