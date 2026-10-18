/**
 * Utility module for parsing, typing, cleaning, filtering, and aggregating dataset rows
 */

export function detectColumnTypes(data) {
  if (!data || data.length === 0) return {};
  
  const sampleSize = Math.min(data.length, 100);
  const sample = data.slice(0, sampleSize);
  const keys = Object.keys(data[0] || {});
  const types = {};

  keys.forEach((key) => {
    let numericCount = 0;
    let dateCount = 0;
    let boolCount = 0;
    let nonNullCount = 0;
    const uniqueValues = new Set();

    sample.forEach((row) => {
      const val = row[key];
      if (val !== null && val !== undefined && val !== "") {
        nonNullCount++;
        uniqueValues.add(val);

        // Check boolean
        if (typeof val === "boolean" || val === "true" || val === "false" || val === "True" || val === "False") {
          boolCount++;
        }

        // Check numeric
        const cleanNumStr = typeof val === "string" ? val.replace(/[$,%]/g, "").trim() : val;
        if (!isNaN(Number(cleanNumStr)) && typeof val !== "boolean" && val !== "") {
          numericCount++;
        }

        // Check date
        if (typeof val === "string" && isNaN(Number(val))) {
          // Verify valid date pattern such as YYYY-MM-DD or MM/DD/YYYY and exclude IDs
          const isDatePattern = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(val) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/.test(val);
          if (isDatePattern && !key.toLowerCase().includes("id")) {
            const parsedDate = Date.parse(val);
            if (!isNaN(parsedDate)) {
              dateCount++;
            }
          }
        } else if (val instanceof Date) {
          dateCount++;
        }
      }
    });

    const isIdCol = key.toLowerCase().includes("id") || key.toLowerCase().includes("code") || key.toLowerCase().includes("sku");

    if (nonNullCount === 0) {
      types[key] = { type: "text", uniqueCount: 0, isId: isIdCol };
    } else if (boolCount / nonNullCount > 0.8) {
      types[key] = { type: "boolean", uniqueCount: uniqueValues.size, isId: false };
    } else if (isIdCol) {
      types[key] = { type: "categorical", uniqueCount: uniqueValues.size, isId: true };
    } else if (numericCount / nonNullCount > 0.75) {
      types[key] = { type: "numeric", uniqueCount: uniqueValues.size, isId: false };
    } else if (dateCount / nonNullCount > 0.75) {
      types[key] = { type: "date", uniqueCount: uniqueValues.size, isId: false };
    } else {
      types[key] = { type: "categorical", uniqueCount: uniqueValues.size, isId: false };
    }
  });

  return types;
}

export function calculateDatasetStats(rawRows = [], cleanedRows = []) {
  const currentData = cleanedRows.length > 0 ? cleanedRows : rawRows;
  if (!currentData || currentData.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      missingByColumn: {},
      duplicateCount: 0,
      numericStats: {},
      categoricalStats: {},
    };
  }

  const columns = Object.keys(currentData[0] || {});
  const columnTypes = detectColumnTypes(currentData);

  // Missing values counter
  const missingByColumn = {};
  columns.forEach((col) => {
    let count = 0;
    currentData.forEach((row) => {
      const val = row[col];
      if (val === null || val === undefined || val === "" || val === "NaN" || val === "null" || val === "undefined") {
        count++;
      }
    });
    missingByColumn[col] = {
      count,
      percentage: ((count / currentData.length) * 100).toFixed(1),
    };
  });

  // Check duplicate rows in raw data
  let duplicateCount = 0;
  const seenRows = new Set();
  rawRows.forEach((row) => {
    const serialized = JSON.stringify(row);
    if (seenRows.has(serialized)) {
      duplicateCount++;
    } else {
      seenRows.add(serialized);
    }
  });

  // Numeric column statistics
  const numericStats = {};
  columns.forEach((col) => {
    if (columnTypes[col]?.type === "numeric") {
      const values = currentData
        .map((r) => {
          const v = r[col];
          const num = typeof v === "string" ? parseFloat(v.replace(/[$,%]/g, "")) : Number(v);
          return isNaN(num) ? null : num;
        })
        .filter((v) => v !== null);

      if (values.length > 0) {
        const sum = values.reduce((acc, v) => acc + v, 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = sum / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median =
          sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];

        numericStats[col] = {
          min: Number(min.toFixed(2)),
          max: Number(max.toFixed(2)),
          mean: Number(mean.toFixed(2)),
          median: Number(median.toFixed(2)),
          sum: Number(sum.toFixed(2)),
          count: values.length,
        };
      }
    }
  });

  // Categorical stats (unique value frequencies)
  const categoricalStats = {};
  columns.forEach((col) => {
    if (columnTypes[col]?.type === "categorical" || columnTypes[col]?.type === "text") {
      const freq = {};
      currentData.forEach((r) => {
        const val = String(r[col] ?? "Missing");
        freq[val] = (freq[val] || 0) + 1;
      });
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      categoricalStats[col] = {
        uniqueCount: Object.keys(freq).length,
        topValues: sorted.slice(0, 5).map(([name, count]) => ({ name, count })),
      };
    }
  });

  return {
    rowCount: currentData.length,
    rawRowCount: rawRows.length,
    columnCount: columns.length,
    columns,
    columnTypes,
    missingByColumn,
    duplicateCount,
    numericStats,
    categoricalStats,
  };
}

export function cleanDataset(data, options = {}) {
  const {
    removeDuplicates = true,
    missingValueAction = "fill", // 'drop' | 'fill' | 'none'
    numericFillStrategy = "mean", // 'mean' | 'median' | 'zero'
    textFillStrategy = "Unknown", // 'Unknown' | 'custom'
    customTextFill = "N/A",
    trimWhitespace = true,
    standardizeCase = "none", // 'none' | 'title' | 'lower' | 'upper'
  } = options;

  if (!data || data.length === 0) {
    return {
      cleanedData: [],
      log: ["No data provided to clean."],
      duplicatesRemoved: 0,
      missingValuesHandled: 0,
      beforeCount: 0,
      afterCount: 0,
    };
  }

  const log = [];
  const beforeCount = data.length;
  let workingData = [...data];
  const detectedTypes = detectColumnTypes(workingData);
  const keys = Object.keys(workingData[0] || {});

  // 1. Trim whitespace & standardize types
  workingData = workingData.map((row) => {
    const newRow = {};
    keys.forEach((key) => {
      let val = row[key];
      if (typeof val === "string" && trimWhitespace) {
        val = val.trim();
        if (standardizeCase === "lower") val = val.toLowerCase();
        else if (standardizeCase === "upper") val = val.toUpperCase();
      }

      // Convert numeric strings to actual numbers
      if (detectedTypes[key]?.type === "numeric" && val !== null && val !== undefined && val !== "") {
        const cleanVal = typeof val === "string" ? parseFloat(val.replace(/[$,%]/g, "")) : Number(val);
        if (!isNaN(cleanVal)) {
          val = cleanVal;
        }
      }

      newRow[key] = val;
    });
    return newRow;
  });
  log.push("Standardized string trims and parsed numeric column datatypes.");

  // 2. Remove duplicates
  let duplicatesRemoved = 0;
  if (removeDuplicates) {
    const seen = new Set();
    const deduped = [];
    workingData.forEach((row) => {
      const rowKey = JSON.stringify(row);
      if (!seen.has(rowKey)) {
        seen.add(rowKey);
        deduped.push(row);
      } else {
        duplicatesRemoved++;
      }
    });
    workingData = deduped;
    if (duplicatesRemoved > 0) {
      log.push(`Detected and removed ${duplicatesRemoved} exact duplicate row(s).`);
    } else {
      log.push("No duplicate rows detected.");
    }
  }

  // 3. Calculate numeric column means/medians for imputation
  const numericStats = {};
  keys.forEach((key) => {
    if (detectedTypes[key]?.type === "numeric") {
      const validNums = workingData
        .map((r) => r[key])
        .filter((v) => v !== null && v !== undefined && v !== "" && !isNaN(Number(v)))
        .map(Number);

      if (validNums.length > 0) {
        const sum = validNums.reduce((a, b) => a + b, 0);
        const mean = Number((sum / validNums.length).toFixed(2));
        const sorted = [...validNums].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        numericStats[key] = { mean, median, zero: 0 };
      } else {
        numericStats[key] = { mean: 0, median: 0, zero: 0 };
      }
    }
  });

  // 4. Handle missing values
  let missingValuesHandled = 0;
  if (missingValueAction === "drop") {
    const initialLen = workingData.length;
    workingData = workingData.filter((row) => {
      const hasMissing = keys.some((k) => {
        const val = row[k];
        return val === null || val === undefined || val === "" || val === "NaN" || val === "null";
      });
      return !hasMissing;
    });
    const droppedCount = initialLen - workingData.length;
    missingValuesHandled = droppedCount;
    log.push(`Dropped ${droppedCount} row(s) containing missing or null values.`);
  } else if (missingValueAction === "fill") {
    workingData = workingData.map((row) => {
      const newRow = { ...row };
      keys.forEach((key) => {
        const val = newRow[key];
        const isMissing = val === null || val === undefined || val === "" || val === "NaN" || val === "null";
        if (isMissing) {
          missingValuesHandled++;
          if (detectedTypes[key]?.type === "numeric") {
            newRow[key] = numericStats[key]?.[numericFillStrategy] ?? 0;
          } else if (detectedTypes[key]?.type === "date") {
            newRow[key] = new Date().toISOString().split("T")[0];
          } else {
            newRow[key] = textFillStrategy === "custom" ? customTextFill : textFillStrategy;
          }
        }
      });
      return newRow;
    });
    log.push(`Imputed missing values: Numeric filled with '${numericFillStrategy}', Text filled with '${textFillStrategy === "custom" ? customTextFill : textFillStrategy}'.`);
  }

  const afterCount = workingData.length;

  return {
    cleanedData: workingData,
    log,
    duplicatesRemoved,
    missingValuesHandled,
    beforeCount,
    afterCount,
  };
}

export function filterAndSearchData(data = [], filters = {}, searchKeyword = "", sortConfig = null) {
  if (!data || data.length === 0) return [];

  let result = data.filter((row) => {
    // 1. Search keyword matching across all fields
    if (searchKeyword && searchKeyword.trim() !== "") {
      const term = searchKeyword.toLowerCase().trim();
      const matchesSearch = Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(term)
      );
      if (!matchesSearch) return false;
    }

    // 2. Column filters
    for (const [column, filterVal] of Object.entries(filters)) {
      if (!filterVal) continue;
      const rowVal = row[column];

      // Categorical multi-select filter
      if (filterVal.type === "categorical" && Array.isArray(filterVal.selected) && filterVal.selected.length > 0) {
        if (!filterVal.selected.includes(String(rowVal))) {
          return false;
        }
      }

      // Numeric range filter
      if (filterVal.type === "numeric") {
        const num = Number(rowVal);
        if (!isNaN(num)) {
          if (filterVal.min !== undefined && filterVal.min !== "" && num < Number(filterVal.min)) return false;
          if (filterVal.max !== undefined && filterVal.max !== "" && num > Number(filterVal.max)) return false;
        }
      }

      // Date range filter
      if (filterVal.type === "date") {
        const rowDate = new Date(rowVal);
        if (!isNaN(rowDate.getTime())) {
          if (filterVal.start) {
            const startDate = new Date(filterVal.start);
            if (rowDate < startDate) return false;
          }
          if (filterVal.end) {
            const endDate = new Date(filterVal.end);
            // End of day
            endDate.setHours(23, 59, 59, 999);
            if (rowDate > endDate) return false;
          }
        }
      }
    }

    return true;
  });

  // Sorting
  if (sortConfig && sortConfig.key) {
    result = [...result].sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortConfig.direction === "asc" ? -1 : 1;
      if (strA > strB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return result;
}

export function aggregateData(data, xField, yField, aggType = "sum", maxItems = 12) {
  if (!data || data.length === 0 || !xField) return [];

  const groups = {};

  data.forEach((row) => {
    const xVal = String(row[xField] ?? "Unknown");
    let yVal = 1;

    if (yField && row[yField] !== undefined) {
      const parsed = typeof row[yField] === "string" ? parseFloat(row[yField].replace(/[$,%]/g, "")) : Number(row[yField]);
      yVal = isNaN(parsed) ? 0 : parsed;
    }

    if (!groups[xVal]) {
      groups[xVal] = {
        name: xVal,
        values: [yVal],
        sum: yVal,
        count: 1,
        min: yVal,
        max: yVal,
      };
    } else {
      groups[xVal].values.push(yVal);
      groups[xVal].sum += yVal;
      groups[xVal].count += 1;
      groups[xVal].min = Math.min(groups[xVal].min, yVal);
      groups[xVal].max = Math.max(groups[xVal].max, yVal);
    }
  });

  const chartData = Object.values(groups).map((g) => {
    let finalValue = 0;
    if (aggType === "sum") finalValue = Number(g.sum.toFixed(2));
    else if (aggType === "avg") finalValue = Number((g.sum / g.count).toFixed(2));
    else if (aggType === "count") finalValue = g.count;
    else if (aggType === "min") finalValue = Number(g.min.toFixed(2));
    else if (aggType === "max") finalValue = Number(g.max.toFixed(2));

    return {
      name: g.name,
      value: finalValue,
      count: g.count,
      avg: Number((g.sum / g.count).toFixed(2)),
      sum: Number(g.sum.toFixed(2)),
    };
  });

  // Sort descending by value
  chartData.sort((a, b) => b.value - a.value);

  return chartData.slice(0, maxItems);
}

export function generateAutoSuggestions(columns = [], detectedTypes = {}, purpose = "Sales Analysis", data = []) {
  if (!columns.length || !data.length) {
    return { kpiCards: [], charts: [] };
  }

  const numericCols = columns.filter((c) => detectedTypes[c]?.type === "numeric" && !detectedTypes[c]?.isId);
  const categoricalCols = columns.filter((c) => detectedTypes[c]?.type === "categorical" && !detectedTypes[c]?.isId);
  const dateCols = columns.filter((c) => detectedTypes[c]?.type === "date");

  // Format helper
  const formatCurrency = (val) => (val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val.toFixed(2)}`);

  // 1. Generate KPI Cards
  const kpiCards = [];
  
  // Total Record Count KPI
  kpiCards.push({
    id: "kpi-records",
    title: "Total Records",
    value: data.length.toLocaleString(),
    subtitle: "Active rows after filters",
    icon: "database",
    accent: "blue",
    trend: "+100%",
  });

  // Numeric KPIs (Primary metric sum & average)
  if (numericCols.length > 0) {
    const primaryNum = numericCols[0];
    const sumVal = data.reduce((acc, r) => acc + (Number(r[primaryNum]) || 0), 0);
    const avgVal = sumVal / data.length;

    const isCurrency = primaryNum.toLowerCase().includes("revenue") ||
      primaryNum.toLowerCase().includes("price") ||
      primaryNum.toLowerCase().includes("cost") ||
      primaryNum.toLowerCase().includes("budget") ||
      primaryNum.toLowerCase().includes("profit") ||
      primaryNum.toLowerCase().includes("spend");

    kpiCards.push({
      id: "kpi-sum-" + primaryNum,
      title: `Total ${primaryNum.replace(/_/g, " ")}`,
      value: isCurrency ? formatCurrency(sumVal) : sumVal >= 1000 ? `${(sumVal / 1000).toFixed(1)}k` : sumVal.toLocaleString(),
      subtitle: `Sum across ${data.length} records`,
      icon: "trending-up",
      accent: "amber",
      metricCol: primaryNum,
      agg: "sum",
    });

    kpiCards.push({
      id: "kpi-avg-" + primaryNum,
      title: `Avg ${primaryNum.replace(/_/g, " ")}`,
      value: isCurrency ? `$${avgVal.toFixed(2)}` : avgVal.toFixed(2),
      subtitle: `Mean per record`,
      icon: "calculator",
      accent: "emerald",
      metricCol: primaryNum,
      agg: "avg",
    });

    if (numericCols.length > 1) {
      const secondaryNum = numericCols[1];
      const maxVal = Math.max(...data.map((r) => Number(r[secondaryNum]) || 0));
      kpiCards.push({
        id: "kpi-max-" + secondaryNum,
        title: `Peak ${secondaryNum.replace(/_/g, " ")}`,
        value: typeof maxVal === "number" && !isNaN(maxVal) ? maxVal.toLocaleString() : "N/A",
        subtitle: `Highest recorded value`,
        icon: "award",
        accent: "purple",
        metricCol: secondaryNum,
        agg: "max",
      });
    }
  }

  // Categorical KPI
  if (categoricalCols.length > 0) {
    const catCol = categoricalCols[0];
    const uniqueVals = new Set(data.map((r) => r[catCol])).size;
    kpiCards.push({
      id: "kpi-unique-" + catCol,
      title: `Distinct ${catCol.replace(/_/g, " ")}`,
      value: uniqueVals.toString(),
      subtitle: "Unique categories represented",
      icon: "layers",
      accent: "cyan",
    });
  }

  // 2. Generate Smart Charts
  const charts = [];

  // Chart 1: Categorical vs Primary Numeric (Bar Chart)
  if (categoricalCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: "chart-1",
      title: `${numericCols[0].replace(/_/g, " ")} by ${categoricalCols[0].replace(/_/g, " ")}`,
      type: "bar",
      xAxis: categoricalCols[0],
      yAxis: numericCols[0],
      aggType: "sum",
      description: "Aggregated performance breakdown across categories.",
      color: "#f59e0b", // Power BI amber
    });
  }

  // Chart 2: Time Series / Line Chart if Date exists or 2nd Categorical
  if (dateCols.length > 0 && numericCols.length > 0) {
    charts.push({
      id: "chart-2",
      title: `${numericCols[0].replace(/_/g, " ")} Timeline Trend`,
      type: "line",
      xAxis: dateCols[0],
      yAxis: numericCols[0],
      aggType: "sum",
      description: "Chronological progression of metrics over time.",
      color: "#06b6d4", // Cyan
    });
  } else if (categoricalCols.length > 1 && numericCols.length > 0) {
    const secondCat = categoricalCols[1];
    charts.push({
      id: "chart-2",
      title: `${numericCols[0].replace(/_/g, " ")} by ${secondCat.replace(/_/g, " ")}`,
      type: "line",
      xAxis: secondCat,
      yAxis: numericCols[0],
      aggType: "avg",
      description: "Average metric comparison across groups.",
      color: "#06b6d4", // Cyan
    });
  }

  // Chart 3: Pie / Donut Chart for proportions
  if (categoricalCols.length > 0) {
    const pieCat = categoricalCols.length > 1 ? categoricalCols[1] : categoricalCols[0];
    charts.push({
      id: "chart-3",
      title: `Share by ${pieCat.replace(/_/g, " ")}`,
      type: "donut",
      xAxis: pieCat,
      yAxis: numericCols.length > 1 ? numericCols[1] : (numericCols[0] || columns[0]),
      aggType: numericCols.length > 0 ? "sum" : "count",
      description: "Composition and percentage share breakdown.",
      color: "#10b981", // Emerald
    });
  }

  // Chart 4: Area or Secondary Bar Chart
  if (numericCols.length > 1) {
    const areaDim = categoricalCols.length > 2 ? categoricalCols[2] : (categoricalCols[0] || columns[0]);
    charts.push({
      id: "chart-4",
      title: `${numericCols[1].replace(/_/g, " ")} Analysis by ${areaDim.replace(/_/g, " ")}`,
      type: "area",
      xAxis: areaDim,
      yAxis: numericCols[1],
      aggType: "avg",
      description: "Average metric intensity comparison.",
      color: "#3b82f6", // Blue
    });
  }

  return { kpiCards: kpiCards.slice(0, 4), charts: charts.slice(0, 4) };
}
