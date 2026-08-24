export function parseEmailCopy(markdown) {
  const blocks = markdown.split(/(?:^|\n)### /).filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split('\n');
    const titleLine = lines[0].trim();
    const idMatch = titleLine.match(/^(\d+)\.\s*(.+)$/);
    const rest = lines.slice(1).join('\n');
    const withoutTrailer = rest.split(/\n---/)[0];
    const subjectMatch = withoutTrailer.match(/\*\*Objet\s*:\*\*\s*(.+)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const bodyText = withoutTrailer
      .replace(/\*\*Objet\s*:\*\*.+\n?/, '')
      .trim();

    return {
      id: idMatch ? Number(idMatch[1]) : null,
      title: idMatch ? idMatch[2] : titleLine,
      subject,
      bodyText,
    };
  });
}
