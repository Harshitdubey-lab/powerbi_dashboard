# powerbi_dashboard
live link :- https://powerbi-dashboard-pi.vercel.app/
# Smart Data Dashboard Builder (Power BI Inspired)

A responsive web application inspired by Microsoft Power BI. It allows users to import raw datasets (CSV, Excel, API link, Google Sheets, or preloaded sample datasets) and automatically cleans, filters, analyzes, and generates an interactive analytics dashboard with KPI cards, cross-filtering charts, comparative analysis, AI-driven insights, and exportable reports.

## 🌟 Key Features

1. **Dataset Input & Configuration**
   - Import datasets via CSV/XLSX file upload, Google Sheets/API link, or instant sample datasets (Sales, Student Performance, Corporate Budget, Clinical Health).
   - Validation & column data-type detection (numeric, categorical, boolean, date).

2. **Data Cleaning Engine**
   - Automated detection and removal of duplicate rows.
   - Missing value imputation (Mean, Median, Zero, custom text) or drop null rows.
   - Whitespace trimming and text standardization.
   - Real-time before-and-after row counts, column schemas, and execution audit log.

3. **Data Quality Score (0–100%)**
   - Evaluates missing data density, duplicate row penalty, empty column detection, and schema type integrity.

4. **Rule-Based Smart AI Insights (NLP Engine)**
   - Automatically computes benchmark extremes (highest vs. lowest values).
   - Dominant category concentration analysis.
   - Sequential trajectory trend detection.
   - Data quality reliability rating.

5. **Power BI-Inspired Dashboard Canvas**
   - Dynamic KPI cards (Total records, Sum, Average, Peak metrics, Distinct counts).
   - Interactive Recharts visuals (Bar charts, Line trends, Donut/Pie charts, Area gradients).
   - Cross-filtering & drilldown: clicking any chart element cross-filters all other visuals in real time.
   - Custom Visual Builder: create, edit, or delete charts; customize dimensions, aggregations (SUM, AVG, COUNT, MIN, MAX), and color palettes.
   - Instant chart type switcher and visual reordering.
   - Live theme switcher (Power BI Gold, Cyber Cyan, Emerald Growth, Electric Purple, Cobalt Blue, Ruby Sunset).

6. **Dual-Column Comparison Studio**
   - Benchmark two metrics side-by-side grouped by any dimension.
   - Variance deltas and percentage shifts calculation table.

7. **Export & Executive Report Studio**
   - Export cleaned datasets as CSV, Excel (.xlsx), or JSON.
   - Export printable Executive PDF reports (via jsPDF & html2canvas) and high-res PNG snapshots.
   - Download individual chart images.

8. **Saved Dashboards Library & Local Auth**
   - Store and restore dashboards in local storage.
   - Duplicate, search, and manage previous analytics workspaces.
   - Simple user login/signup and guest student profiles.

9. **Student Project Touch**
   - Academic "About Project" modal with student name, department, roll number, and university credentials.
   - Tech stack attribution and clean academic footer.

10. **Fully Responsive Layout**
    - Desktop sidebar navigation with mobile hamburger drawer and bottom navigation bar.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS v4
- **Charts & Visuals**: Recharts, Lucide React
- **Data Parsing**: PapaParse (CSV), SheetJS xlsx (Excel)
- **Exports**: jsPDF, html2canvas

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
