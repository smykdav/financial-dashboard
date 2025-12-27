/**
 * CSV Parser Utilities
 * Handles parsing of different CSV formats (transposed and normal)
 */

export interface ReportTypeConfig {
  slug: string;
  name: string;
  parsing_config: {
    format: 'transposed' | 'normal';
    header_row: number;
    data_start_row?: number;
    month_column_type?: 'names' | 'numbers';
    month_column_name?: string;
    field_mappings: Record<string, {
      field: string;
      type: 'decimal' | 'integer' | 'percentage' | 'string';
      required: boolean;
    }>;
  };
}

export interface ParsedMonth {
  month: number;
  data: Record<string, any>;
}

export interface ParseResult {
  success: boolean;
  data?: {
    report_type_slug: string;
    year: number;
    months: ParsedMonth[];
  };
  error?: string;
}

const MONTH_NAMES: Record<string, number> = {
  'january': 1, 'jan': 1,
  'february': 2, 'feb': 2,
  'march': 3, 'mar': 3,
  'april': 4, 'apr': 4,
  'may': 5,
  'june': 6, 'jun': 6,
  'july': 7, 'jul': 7,
  'august': 8, 'aug': 8,
  'september': 9, 'sep': 9, 'sept': 9,
  'october': 10, 'oct': 10,
  'november': 11, 'nov': 11,
  'december': 12, 'dec': 12,
};

/**
 * Parse CSV text into array of arrays
 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n in \r\n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Add last row if exists
  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Convert month name to number (1-12)
 */
function monthNameToNumber(name: string): number | null {
  const normalized = name.toLowerCase().trim();
  return MONTH_NAMES[normalized] || null;
}

/**
 * Parse value based on type
 */
function parseValue(value: string, type: string): any {
  if (!value || value === '') return null;

  // Remove common formatting
  const cleaned = value.replace(/[$,\s%]/g, '');

  switch (type) {
    case 'integer':
      const intVal = parseInt(cleaned, 10);
      return isNaN(intVal) ? null : intVal;

    case 'decimal':
      const floatVal = parseFloat(cleaned);
      return isNaN(floatVal) ? null : floatVal;

    case 'percentage':
      const pctVal = parseFloat(cleaned);
      return isNaN(pctVal) ? null : pctVal;

    case 'string':
    default:
      return value.trim();
  }
}

/**
 * Parse transposed CSV (rows = metrics, columns = months)
 */
function parseTransposedCSV(
  rows: string[][],
  config: ReportTypeConfig['parsing_config']
): ParsedMonth[] {
  const { header_row, data_start_row = header_row + 1, field_mappings } = config;

  // Get header row (contains month names)
  const headerRow = rows[header_row];
  if (!headerRow) {
    throw new Error('Header row not found');
  }

  // Find month columns
  const monthColumns: { index: number; month: number }[] = [];
  for (let i = 1; i < headerRow.length; i++) {
    const monthNum = monthNameToNumber(headerRow[i]);
    if (monthNum) {
      monthColumns.push({ index: i, month: monthNum });
    }
  }

  if (monthColumns.length === 0) {
    throw new Error('No valid month columns found');
  }

  // Initialize months data
  const monthsData: Map<number, Record<string, any>> = new Map();
  monthColumns.forEach(({ month }) => {
    monthsData.set(month, {});
  });

  // Parse data rows
  for (let rowIdx = data_start_row; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const metricName = row[0]?.trim();

    if (!metricName) continue;

    // Find matching field mapping
    const mapping = field_mappings[metricName];
    if (!mapping) continue;

    // Extract values for each month
    monthColumns.forEach(({ index, month }) => {
      const value = row[index];
      const parsedValue = parseValue(value, mapping.type);

      if (parsedValue !== null) {
        const monthData = monthsData.get(month)!;
        monthData[mapping.field] = parsedValue;
      }
    });
  }

  // Convert to array
  return Array.from(monthsData.entries()).map(([month, data]) => ({
    month,
    data
  }));
}

/**
 * Parse normal CSV (rows = months, columns = metrics)
 */
function parseNormalCSV(
  rows: string[][],
  config: ReportTypeConfig['parsing_config']
): ParsedMonth[] {
  const { header_row, data_start_row = header_row + 1, month_column_name, field_mappings } = config;

  // Get header row
  const headerRow = rows[header_row];
  if (!headerRow) {
    throw new Error('Header row not found');
  }

  // Find month column index
  const monthColIndex = headerRow.findIndex(h =>
    h.toLowerCase().trim() === (month_column_name || 'month').toLowerCase()
  );

  if (monthColIndex === -1) {
    throw new Error(`Month column "${month_column_name || 'month'}" not found`);
  }

  // Create column mapping
  const columnMapping: Map<number, { field: string; type: string }> = new Map();
  headerRow.forEach((header, idx) => {
    if (idx === monthColIndex) return;

    const mapping = field_mappings[header.trim()];
    if (mapping) {
      columnMapping.set(idx, { field: mapping.field, type: mapping.type });
    }
  });

  // Parse data rows
  const monthsData: ParsedMonth[] = [];

  for (let rowIdx = data_start_row; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const monthValue = row[monthColIndex];

    if (!monthValue) continue;

    // Parse month (could be name or number)
    let monthNum = parseInt(monthValue, 10);
    if (isNaN(monthNum)) {
      monthNum = monthNameToNumber(monthValue) || 0;
    }

    if (monthNum < 1 || monthNum > 12) continue;

    // Parse data for this month
    const data: Record<string, any> = {};
    columnMapping.forEach(({ field, type }, colIdx) => {
      const value = row[colIdx];
      const parsedValue = parseValue(value, type);

      if (parsedValue !== null) {
        data[field] = parsedValue;
      }
    });

    monthsData.push({ month: monthNum, data });
  }

  return monthsData;
}

/**
 * Main CSV parsing function
 */
export async function parseCSVFile(
  file: File,
  reportTypeConfig: ReportTypeConfig,
  year: number
): Promise<ParseResult> {
  try {
    // Read file
    const text = await file.text();

    // Parse CSV
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return { success: false, error: 'CSV file is empty' };
    }

    // Parse based on format
    let months: ParsedMonth[];

    if (reportTypeConfig.parsing_config.format === 'transposed') {
      months = parseTransposedCSV(rows, reportTypeConfig.parsing_config);
    } else {
      months = parseNormalCSV(rows, reportTypeConfig.parsing_config);
    }

    if (months.length === 0) {
      return { success: false, error: 'No valid data found in CSV' };
    }

    return {
      success: true,
      data: {
        report_type_slug: reportTypeConfig.slug,
        year,
        months
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error parsing CSV'
    };
  }
}
