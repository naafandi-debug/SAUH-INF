// CSV & Text Export Utilities for Question Bank, Students, Results, and Leger

export const downloadCSV = (filename: string, rows: (string | number)[][], headers?: string[]) => {
  let content = '';
  if (headers && headers.length > 0) {
    content += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';
  }
  rows.forEach(row => {
    content += row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',') + '\r\n';
  });

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): string[][] => {
  const lines = csvText.split(/\r\n|\n/);
  const result: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let insideQuotes = false;
    let currentCell = '';

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      const nextChar = line[charIdx + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          charIdx++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if ((char === ',' || char === ';') && !insideQuotes) {
        row.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    row.push(currentCell.trim());
    result.push(row);
  }

  return result;
};
