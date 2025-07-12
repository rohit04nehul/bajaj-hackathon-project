import Papa from 'papaparse';

export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function processTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function parseCSVData(csvText: string): StockData[] {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transform: (value, field) => {
      if (field === 'date' || field === 'Date') return value;
      return parseFloat(value) || 0;
    }
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }

  // Handle different CSV formats
  const data = result.data as any[];
  const stockData: StockData[] = [];

  for (const row of data) {
    if (!row) continue;

    // Check if it's the format with Date and Close Price
    if (row.Date && row['Close Price']) {
      const closePrice = parseFloat(row['Close Price']);
      if (isNaN(closePrice)) continue;

      stockData.push({
        date: row.Date,
        open: closePrice, // Use close price as open since we don't have open data
        high: closePrice, // Use close price as high since we don't have high data
        low: closePrice,  // Use close price as low since we don't have low data
        close: closePrice
      });
    }
    // Check if it's the format with date, open, high, low, close
    else if (row.date && row.open !== undefined && row.high !== undefined && row.low !== undefined && row.close !== undefined) {
      stockData.push({
        date: row.date,
        open: parseFloat(row.open) || 0,
        high: parseFloat(row.high) || 0,
        low: parseFloat(row.low) || 0,
        close: parseFloat(row.close) || 0
      });
    }
  }

  if (stockData.length === 0) {
    throw new Error('No valid stock data found in CSV. Expected columns: Date, Close Price or date, open, high, low, close');
  }

  console.log(`Parsed ${stockData.length} stock records`);
  return stockData;
}