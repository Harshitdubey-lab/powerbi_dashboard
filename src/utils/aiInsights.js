/**
 * Rule-based NLP and statistical insight generation engine
 */

export function calculateDataQualityBreakdown(rawData = [], cleanedData = [], stats = {}) {
  const totalRawRows = rawData.length || 1;
  const columns = stats.columns || (rawData[0] ? Object.keys(rawData[0]) : []);
  const totalCols = columns.length || 1;

  // 1. Missing Values penalty
  let totalMissingCells = 0;
  columns.forEach((col) => {
    totalMissingCells += (stats.missingByColumn?.[col]?.count || 0);
  });
  const totalCells = totalRawRows * totalCols;
  const missingRate = (totalMissingCells / totalCells) * 100;
  const missingScore = Math.max(0, Math.round(100 - missingRate * 5));

  // 2. Duplicate Rows penalty
  const duplicateCount = stats.duplicateCount || 0;
  const duplicateRate = (duplicateCount / totalRawRows) * 100;
  const duplicateScore = Math.max(0, Math.round(100 - duplicateRate * 4));

  // 3. Empty Columns penalty
  let emptyColsCount = 0;
  columns.forEach((col) => {
    const missCount = stats.missingByColumn?.[col]?.count || 0;
    if (missCount === totalRawRows && totalRawRows > 0) emptyColsCount++;
  });
  const emptyColScore = Math.max(0, Math.round(100 - (emptyColsCount / totalCols) * 100));

  // 4. Invalid date/format penalty
  let typeIntegrityScore = 95;
  if (stats.columnTypes) {
    const numericCols = Object.keys(stats.numericStats || {});
    if (numericCols.length === 0) typeIntegrityScore -= 10;
  }

  // Composite weighted score
  const overallScore = Math.round(
    missingScore * 0.35 +
    duplicateScore * 0.30 +
    emptyColScore * 0.20 +
    typeIntegrityScore * 0.15
  );

  return {
    overallScore: Math.max(20, Math.min(100, overallScore)),
    missingScore,
    duplicateScore,
    emptyColScore,
    typeIntegrityScore,
    missingRate: missingRate.toFixed(1),
    duplicateCount,
    emptyColsCount,
  };
}

export function generateSmartAIInsights(data = [], rawData = [], stats = {}, datasetPurpose = "General Analytics") {
  if (!data || data.length === 0) return [];

  const insights = [];
  const quality = calculateDataQualityBreakdown(rawData, data, stats);
  const numericCols = Object.keys(stats.numericStats || {});
  const catCols = Object.keys(stats.categoricalStats || {}).filter(
    (col) => !col.toLowerCase().includes("id") && !col.toLowerCase().includes("code") && !col.toLowerCase().includes("sku")
  );
  const dateCols = Object.keys(stats.columnTypes || {}).filter((k) => stats.columnTypes[k]?.type === "date");

  // Insight 1: Highest & Lowest Peak Metric
  if (numericCols.length > 0) {
    const primaryNum = numericCols[0];
    const nStat = stats.numericStats[primaryNum];

    if (nStat) {
      // Find row with max value
      const maxRow = data.find((r) => Number(r[primaryNum]) === nStat.max) || {};
      const minRow = data.find((r) => Number(r[primaryNum]) === nStat.min) || {};
      const catIdentifier = catCols[0] ? maxRow[catCols[0]] : null;
      const minIdentifier = catCols[0] ? minRow[catCols[0]] : null;

      const isCurr = primaryNum.toLowerCase().includes("revenue") ||
        primaryNum.toLowerCase().includes("price") ||
        primaryNum.toLowerCase().includes("profit") ||
        primaryNum.toLowerCase().includes("cost") ||
        primaryNum.toLowerCase().includes("spend") ||
        primaryNum.toLowerCase().includes("budget");

      const formatVal = (v) => (isCurr ? `$${v.toLocaleString()}` : v.toLocaleString());

      insights.push({
        id: "insight-peak-metric",
        type: "peak",
        tag: "Benchmark Extremes",
        title: `Highest vs Lowest ${primaryNum.replace(/_/g, " ")}`,
        description: `Peak value is ${formatVal(nStat.max)}${catIdentifier ? ` recorded for "${catIdentifier}"` : ""}, while the baseline lowest is ${formatVal(nStat.min)}${minIdentifier ? ` ("${minIdentifier}")` : ""}. Average is ${formatVal(nStat.mean)}.`,
        impact: "High Impact",
        color: "amber",
        metricName: primaryNum,
        badge: "Extremes",
      });
    }
  }

  // Insight 2: Most Common & Dominant Category
  if (catCols.length > 0) {
    const primaryCat = catCols[0];
    const cStat = stats.categoricalStats[primaryCat];

    if (cStat && cStat.topValues.length > 0) {
      const topVal = cStat.topValues[0];
      const sharePct = ((topVal.count / (data.length || 1)) * 100).toFixed(1);

      insights.push({
        id: "insight-dominant-category",
        type: "distribution",
        tag: "Dominant Category",
        title: `Primary Concentration in ${primaryCat.replace(/_/g, " ")}`,
        description: `"${topVal.name}" is the most represented segment with ${topVal.count} records (${sharePct}% of all entries), leading across ${cStat.uniqueCount} distinct groups.`,
        impact: Number(sharePct) > 40 ? "High Concentration" : "Moderate Spread",
        color: "cyan",
        metricName: primaryCat,
        badge: "Leader",
      });
    }
  }

  // Insight 3: Growth & Trend Direction
  if (numericCols.length > 0) {
    const targetCol = numericCols[0];
    const vals = data.map((r) => Number(r[targetCol])).filter((v) => !isNaN(v));

    if (vals.length >= 3) {
      const firstHalf = vals.slice(0, Math.floor(vals.length / 2));
      const secondHalf = vals.slice(Math.floor(vals.length / 2));

      const avg1 = firstHalf.reduce((a, b) => a + b, 0) / (firstHalf.length || 1);
      const avg2 = secondHalf.reduce((a, b) => a + b, 0) / (secondHalf.length || 1);
      const deltaPct = (((avg2 - avg1) / (avg1 || 1)) * 100).toFixed(1);

      const isPositive = Number(deltaPct) > 0;
      const isFlat = Math.abs(Number(deltaPct)) < 2;

      insights.push({
        id: "insight-trend",
        type: "trend",
        tag: "Trajectory Trend",
        title: `${targetCol.replace(/_/g, " ")} ${isFlat ? "Remains Stable" : isPositive ? "Upward Growth Momentum" : "Downside Variance"}`,
        description: `Sequence evaluation shows a ${Math.abs(Number(deltaPct))}% ${isPositive ? "gain" : "decline"} from initial period averages (${avg1.toFixed(1)}) to later entries (${avg2.toFixed(1)}).`,
        impact: isPositive ? "Positive Trajectory" : "Requires Review",
        color: isPositive ? "emerald" : "orange",
        badge: isPositive ? `+${deltaPct}%` : `${deltaPct}%`,
      });
    }
  }

  // Insight 4: Data Quality & Cleanliness Health
  insights.push({
    id: "insight-quality",
    type: "quality",
    tag: "Data Health Index",
    title: `Data Reliability Score: ${quality.overallScore}%`,
    description: `Dataset health rating is ${quality.overallScore >= 90 ? "Excellent" : quality.overallScore >= 75 ? "Good" : "Needs Remediation"} with ${quality.duplicateCount} duplicate rows detected and an overall missing value density of ${quality.missingRate}%.`,
    impact: quality.overallScore >= 85 ? "Production Ready" : "Review Clean Rules",
    color: quality.overallScore >= 85 ? "emerald" : "purple",
    badge: `${quality.overallScore}/100`,
  });

  // Insight 5: Comparison / Ratio if multiple numeric metrics exist
  if (numericCols.length >= 2) {
    const colA = numericCols[0];
    const colB = numericCols[1];
    const statA = stats.numericStats[colA];
    const statB = stats.numericStats[colB];

    if (statA && statB) {
      const ratio = (statA.sum / (statB.sum || 1)).toFixed(2);
      insights.push({
        id: "insight-correlation",
        type: "comparison",
        tag: "Cross-Metric Ratio",
        title: `${colA.replace(/_/g, " ")} to ${colB.replace(/_/g, " ")} Proportions`,
        description: `Combined total of ${colA.replace(/_/g, " ")} (${statA.sum.toLocaleString()}) relates at a ${ratio}x factor to ${colB.replace(/_/g, " ")} (${statB.sum.toLocaleString()}).`,
        impact: "Comparative Benchmark",
        color: "blue",
        badge: `${ratio}x Ratio`,
      });
    }
  }

  return insights;
}
