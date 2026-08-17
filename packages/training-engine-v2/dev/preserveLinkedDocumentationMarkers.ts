export function preserveLinkedDocumentationMarkers(
  content: string,
  current: string,
  patterns: readonly RegExp[],
): string {
  const linkedBlocks = patterns.flatMap((pattern) => {
    const match = current.match(pattern);
    if (match === null) return [];

    const block = match[0].trim();
    const startMarker = block.match(/<!-- [^>]+:START -->/)?.[0];
    return startMarker === undefined || content.includes(startMarker) ? [] : [block];
  });

  return linkedBlocks.length === 0 ? content :
    `${content.trimEnd()}\n\n${linkedBlocks.join("\n\n")}\n`;
}
