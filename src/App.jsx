import React, { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DatasetInputView from "./components/DatasetInputView";
import DataCleaningView from "./components/DataCleaningView";
import FilterPreviewView from "./components/FilterPreviewView";
import DashboardView from "./components/DashboardView";
import ComparisonModeView from "./components/ComparisonModeView";
import ExportReportView from "./components/ExportReportView";
import SavedDashboardsView from "./components/SavedDashboardsView";
import AuthModal from "./components/AuthModal";
import AboutProjectModal from "./components/AboutProjectModal";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import { SAMPLE_DATASETS } from "./data/sampleDatasets";
import {
  calculateDatasetStats,
  cleanDataset,
  generateAutoSuggestions,
  detectColumnTypes,
} from "./utils/dataProcessor";
import {
  getStoredUser,
  getSavedDashboards,
  getStudentInfo,
  saveDashboardToStorage,
  syncDashboardsWithCloud,
} from "./utils/storage";

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState("dataset-input");

  // Core dataset state
  const [datasetName, setDatasetName] = useState(SAMPLE_DATASETS.sales.name);
  const [datasetPurpose, setDatasetPurpose] = useState(SAMPLE_DATASETS.sales.purpose);
  const [dashboardTitle, setDashboardTitle] = useState(SAMPLE_DATASETS.sales.name);
  const [rawData, setRawData] = useState(SAMPLE_DATASETS.sales.data);
  const [cleanedData, setCleanedData] = useState([]);
  const [isCleaned, setIsCleaned] = useState(false);
  const [currentDashboardId, setCurrentDashboardId] = useState("dash-sales-2024");

  // Filters and Visuals state
  const [filters, setFilters] = useState({});
  const [kpiCards, setKpiCards] = useState([]);
  const [charts, setCharts] = useState([]);

  // Modals & User state
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [studentInfo, setStudentInfo] = useState(getStudentInfo());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(getSavedDashboards().length);

  // Calculate stats whenever raw or cleaned data changes
  const stats = useMemo(() => {
    return calculateDatasetStats(rawData, cleanedData);
  }, [rawData, cleanedData]);

  // Handle new dataset load from Input screen
  const handleDataLoaded = (data) => {
    setRawData(data);
    setCleanedData([]);
    setIsCleaned(false);
    setFilters({});
    setDashboardTitle(datasetName);
    setCurrentDashboardId(`dash-${Date.now()}`);

    // Auto-clean by default
    const cleanResult = cleanDataset(data, {
      removeDuplicates: true,
      missingValueAction: "fill",
      numericFillStrategy: "mean",
      textFillStrategy: "Unknown",
      trimWhitespace: true,
    });
    setCleanedData(cleanResult.cleanedData);
    setIsCleaned(true);

    // Auto-generate suggestions
    const columns = Object.keys(cleanResult.cleanedData[0] || {});
    const columnTypes = detectColumnTypes(cleanResult.cleanedData);
    const suggestions = generateAutoSuggestions(
      columns,
      columnTypes,
      datasetPurpose,
      cleanResult.cleanedData
    );

    setKpiCards(suggestions.kpiCards);
    setCharts(suggestions.charts);
  };

  // Initial auto-generation on mount with sample data
  useEffect(() => {
    const cleanResult = cleanDataset(SAMPLE_DATASETS.sales.data, {
      removeDuplicates: true,
      missingValueAction: "fill",
      numericFillStrategy: "mean",
      textFillStrategy: "Unknown",
      trimWhitespace: true,
    });
    setCleanedData(cleanResult.cleanedData);
    setIsCleaned(true);

    const columns = Object.keys(cleanResult.cleanedData[0] || {});
    const columnTypes = detectColumnTypes(cleanResult.cleanedData);
    const suggestions = generateAutoSuggestions(
      columns,
      columnTypes,
      SAMPLE_DATASETS.sales.purpose,
      cleanResult.cleanedData
    );

    setKpiCards(suggestions.kpiCards);
    setCharts(suggestions.charts);

    // Populate initial saved dashboard preset in storage if empty
    const existing = getSavedDashboards();
    if (existing.length === 0) {
      saveDashboardToStorage({
        id: "dash-sales-2024",
        title: "Global E-Commerce Sales 2024",
        datasetName: SAMPLE_DATASETS.sales.name,
        purpose: "Sales Analysis",
        data: cleanResult.cleanedData,
        rawData: SAMPLE_DATASETS.sales.data,
        kpiCards: suggestions.kpiCards,
        charts: suggestions.charts,
        rowCount: cleanResult.cleanedData.length,
      });
      setSavedCount(1);
    }

    // Synchronize saved dashboards with Supabase Cloud
    syncDashboardsWithCloud().then((synced) => {
      if (synced && synced.length > 0) {
        setSavedCount(synced.length);
      }
    });
  }, []);

  // Update suggestions if purpose changes
  const handlePurposeChange = (newPurpose) => {
    setDatasetPurpose(newPurpose);
    const effectiveData = cleanedData.length > 0 ? cleanedData : rawData;
    if (effectiveData.length > 0) {
      const columns = Object.keys(effectiveData[0] || {});
      const columnTypes = detectColumnTypes(effectiveData);
      const suggestions = generateAutoSuggestions(columns, columnTypes, newPurpose, effectiveData);
      setKpiCards(suggestions.kpiCards);
      setCharts(suggestions.charts);
    }
  };

  // Callback when manual clean is executed in Data Cleaning view
  const handleApplyCleaning = (newCleanedData) => {
    setCleanedData(newCleanedData);
    setIsCleaned(true);

    // Refresh suggestions
    const columns = Object.keys(newCleanedData[0] || {});
    const columnTypes = detectColumnTypes(newCleanedData);
    const suggestions = generateAutoSuggestions(
      columns,
      columnTypes,
      datasetPurpose,
      newCleanedData
    );
    setKpiCards(suggestions.kpiCards);
    setCharts(suggestions.charts);
  };

  // Restore saved dashboard from storage
  const handleLoadSavedDashboard = (savedDash) => {
    if (!savedDash) return;
    setCurrentDashboardId(savedDash.id);
    setDatasetName(savedDash.datasetName || savedDash.title || "Custom Dataset");
    setDashboardTitle(savedDash.title || savedDash.datasetName || "Custom Dashboard");
    setDatasetPurpose(savedDash.purpose || "General Analytics");
    setRawData(savedDash.rawData || savedDash.data || []);
    setCleanedData(savedDash.data || []);
    setIsCleaned(true);
    setKpiCards(savedDash.kpiCards || []);
    setCharts(savedDash.charts || []);
    setFilters(savedDash.filters || {});
    setActiveTab("dashboard");
  };

  const handleReset = () => {
    setFilters({});
  };

  const currentActiveData = cleanedData.length > 0 ? cleanedData : rawData;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-16 lg:pb-0">
      {/* Top Header Navigation */}
      <Header
        datasetName={datasetName}
        datasetPurpose={datasetPurpose}
        rowCount={currentActiveData.length}
        rawRowCount={rawData.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        isCleaned={isCleaned}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          isCleaned={isCleaned}
          datasetName={datasetName}
          datasetPurpose={datasetPurpose}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenAbout={() => setIsAboutModalOpen(true)}
          savedCount={savedCount}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950">
          {activeTab === "dataset-input" && (
            <DatasetInputView
              datasetName={datasetName}
              setDatasetName={setDatasetName}
              datasetPurpose={datasetPurpose}
              setDatasetPurpose={handlePurposeChange}
              onDataLoaded={handleDataLoaded}
              onProceed={() => setActiveTab("data-cleaning")}
            />
          )}

          {activeTab === "data-cleaning" && (
            <DataCleaningView
              rawData={rawData}
              cleanedData={cleanedData}
              stats={stats}
              onApplyCleaning={handleApplyCleaning}
              onProceed={() => setActiveTab("filter-preview")}
            />
          )}

          {activeTab === "filter-preview" && (
            <FilterPreviewView
              data={currentActiveData}
              stats={stats}
              filters={filters}
              setFilters={setFilters}
              onProceed={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardView
              data={currentActiveData}
              rawData={rawData}
              stats={stats}
              kpiCards={kpiCards}
              charts={charts}
              setCharts={setCharts}
              filters={filters}
              setFilters={setFilters}
              datasetName={datasetName}
              datasetPurpose={datasetPurpose}
              dashboardTitle={dashboardTitle}
              setDashboardTitle={setDashboardTitle}
              onNavigateToExport={() => setActiveTab("export-report")}
            />
          )}

          {activeTab === "comparison" && (
            <ComparisonModeView
              data={currentActiveData}
              stats={stats}
            />
          )}

          {activeTab === "export-report" && (
            <ExportReportView
              datasetName={datasetName}
              datasetPurpose={datasetPurpose}
              data={currentActiveData}
              rawData={rawData}
              stats={stats}
              kpiCards={kpiCards}
              charts={charts}
            />
          )}

          {activeTab === "saved-dashboards" && (
            <SavedDashboardsView
              onLoadSavedDashboard={handleLoadSavedDashboard}
              onNavigateToInput={() => setActiveTab("dataset-input")}
              currentDashboardId={currentDashboardId}
            />
          )}
        </main>
      </div>

      {/* Student Academic Footer */}
      <Footer
        studentInfo={studentInfo}
        onOpenAbout={() => setIsAboutModalOpen(true)}
      />

      {/* Mobile Phone Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(u) => setCurrentUser(u)}
      />

      {/* About Project Modal */}
      <AboutProjectModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        studentInfo={studentInfo}
        setStudentInfo={setStudentInfo}
      />
    </div>
  );
}
