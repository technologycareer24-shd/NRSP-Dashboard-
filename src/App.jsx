import { useState } from "react";
import FileUpload from "./components/FileUpload";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedChart, setSelectedChart] = useState("bar");

  // ===== ڈیٹا موصول ہونے پر =====
  const handleDataParsed = (parsedData) => {
    setData(parsedData);
    setFilteredData(parsedData);
    console.log("ڈیٹا موصول:", parsedData);
  };

  // ===== Summary کا حساب =====
  const totalDisbursement = filteredData.reduce((sum, r) => sum + (r.disbursement || 0), 0);
  const totalRecovery = filteredData.reduce((sum, r) => sum + (r.recoveryAmount || 0), 0);
  const totalProfit = filteredData.reduce((sum, r) => sum + (r.profit || 0), 0);
  const totalOverdue = filteredData.reduce((sum, r) => sum + (r.overdue || 0), 0);
  const totalPending = totalDisbursement - totalRecovery;

  const formatPKR = (num) =>
    "Rs " + num.toLocaleString("en-PK");

  return (
    <div style={styles.app}>
      
      {/* ===== HEADER ===== */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>📊</span>
          <h1 style={styles.headerTitle}>NRSP Dashboard</h1>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.headerBadge}>Digital.Light</span>
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main style={styles.main}>
        
        {/* ===== UPLOAD ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📁 Upload File</h2>
          <p style={styles.sectionDesc}>
            Excel, CSV, TSV, Word, PDF, ya TXT فائل اپلوڈ کریں
          </p>
          <FileUpload onDataParsed={handleDataParsed} />
        </section>

        {/* ===== SUMMARY ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 Summary</h2>
          <div style={styles.cardsGrid}>
            <div style={styles.summaryCard}>
              <span style={styles.cardIcon}>💰</span>
              <p style={styles.cardLabel}>Total Disbursement</p>
              <p style={styles.cardValue}>{formatPKR(totalDisbursement)}</p>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.cardIcon}>✅</span>
              <p style={styles.cardLabel}>Recovered</p>
              <p style={{ ...styles.cardValue, color: "#22c55e" }}>{formatPKR(totalRecovery)}</p>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.cardIcon}>📈</span>
              <p style={styles.cardLabel}>Profit</p>
              <p style={{ ...styles.cardValue, color: "#facc15" }}>{formatPKR(totalProfit)}</p>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.cardIcon}>⏳</span>
              <p style={styles.cardLabel}>Pending</p>
              <p style={{ ...styles.cardValue, color: "#38bdf8" }}>{formatPKR(totalPending)}</p>
            </div>
            <div style={styles.summaryCard}>
              <span style={styles.cardIcon}>⚠️</span>
              <p style={styles.cardLabel}>Overdue</p>
              <p style={{ ...styles.cardValue, color: "#ef4444" }}>{formatPKR(totalOverdue)}</p>
            </div>
          </div>
        </section>

        {/* ===== FILTERS ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🔍 Filters</h2>
          <div style={styles.filtersRow}>
            <select style={styles.select}><option>All Districts</option></select>
            <select style={styles.select}><option>All Field Units</option></select>
            <select style={styles.select}><option>All UCs</option></select>
            <select style={styles.select}><option>All Cities</option></select>
            <select style={styles.select}><option>All Employees</option></select>
            <input type="date" style={styles.input} />
            <button style={styles.resetBtn}>🔄 Reset</button>
          </div>
        </section>

        {/* ===== CHART BUILDER ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🎛️ Chart Builder</h2>
          <div style={styles.builderRow}>
            <div style={styles.builderField}>
              <label style={styles.builderLabel}>Chart Type</label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                style={styles.select}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="composed">Composed</option>
                <option value="radar">Radar</option>
                <option value="radial">Radial Bar</option>
                <option value="treemap">Treemap</option>
                <option value="funnel">Funnel</option>
                <option value="stacked">Stacked Bar</option>
                <option value="donut">Donut</option>
              </select>
            </div>

            <div style={styles.builderField}>
              <label style={styles.builderLabel}>X-Axis</label>
              <select style={styles.select}>
                <option value="district">District</option>
                <option value="fieldUnit">Field Unit</option>
                <option value="uc">UC</option>
                <option value="city">City</option>
                <option value="employeeName">Employee</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div style={styles.builderField}>
              <label style={styles.builderLabel}>Y-Axis</label>
              <select style={styles.select}>
                <option value="disbursement">Disbursement</option>
                <option value="recoveryAmount">Recovery Amount</option>
                <option value="profit">Profit</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </section>

        {/* ===== CHART AREA ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📈 Chart View</h2>
          <div style={styles.chartArea}>
            {data.length === 0 ? (
              <p style={styles.placeholder}>فائل اپلوڈ کریں تاکہ چارٹ نظر آئے</p>
            ) : (
              <p style={styles.placeholder}>
                ✅ {data.length} قطاریں لوڈ ہو گئیں — چارٹ اگلے مرحلے میں بنے گا
              </p>
            )}
          </div>
        </section>

        {/* ===== DATA TABLE ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Data Table</h2>
          <div style={styles.tableArea}>
            {data.length === 0 ? (
              <p style={styles.placeholder}>ڈیٹا یہاں نظر آئے گا</p>
            ) : (
              <p style={styles.placeholder}>
                ✅ {data.length} rows, {Object.keys(data[0]).length} columns
              </p>
            )}
          </div>
        </section>

        {/* ===== REPORTS ===== */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📄 Reports</h2>
          <div style={styles.cardsGrid}>
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>⚠️ Overdue Loans</h3>
              <p style={styles.reportValue}>
                {filteredData.filter((r) => r.overdue > 0).length} loans
              </p>
            </div>
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>🏆 Top Defaulters</h3>
              <p style={styles.reportValue}>0 employees</p>
            </div>
            <div style={styles.reportCard}>
              <h3 style={styles.reportTitle}>👥 Employee Performance</h3>
              <p style={styles.reportValue}>{data.length} records</p>
            </div>
          </div>
        </section>

      </main>

      {/* ===== FOOTER ===== */}
      <footer style={styles.footer}>
        <p>© 2026 NRSP Dashboard — Built by Digital.Light</p>
      </footer>
    </div>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = {
  app: {
    fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    background: `#0f172a`,
    color: `#e2e8f0`,
    minHeight: `100vh`,
  },
  header: {
    display: `flex`,
    justifyContent: `space-between`,
    alignItems: `center`,
    padding: `16px 24px`,
    background: `#1e293b`,
    borderBottom: `1px solid #334155`,
    position: `sticky`,
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: `flex`, alignItems: `center`, gap: `12px` },
  headerIcon: { fontSize: `28px` },
  headerTitle: { fontSize: `20px`, color: `#38bdf8`, margin: 0 },
  headerBadge: {
    padding: `6px 14px`,
    background: `#38bdf8`,
    color: `#0f172a`,
    borderRadius: `20px`,
    fontSize: `12px`,
    fontWeight: `bold`,
  },
  main: { padding: `24px`, maxWidth: `1400px`, margin: `0 auto` },
  section: { marginBottom: `32px` },
  sectionTitle: { fontSize: `18px`, color: `#f1f5f9`, marginBottom: `8px` },
  sectionDesc: { fontSize: `13px`, color: `#94a3b8`, marginBottom: `16px` },
  cardsGrid: {
    display: `grid`,
    gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
    gap: `16px`,
  },
  summaryCard: {
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `12px`,
    padding: `20px`,
    display: `flex`,
    flexDirection: `column`,
    gap: `6px`,
  },
  cardIcon: { fontSize: `24px` },
  cardLabel: { fontSize: `11px`, color: `#94a3b8`, margin: 0, textTransform: `uppercase`, letterSpacing: `0.5px` },
  cardValue: { fontSize: `20px`, color: `#f1f5f9`, fontWeight: `bold`, margin: 0 },
  filtersRow: { display: `flex`, flexWrap: `wrap`, gap: `10px` },
  select: {
    padding: `10px 14px`,
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `8px`,
    color: `#e2e8f0`,
    fontSize: `13px`,
  },
  input: {
    padding: `10px 14px`,
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `8px`,
    color: `#e2e8f0`,
    fontSize: `13px`,
  },
  resetBtn: {
    padding: `10px 20px`,
    background: `#ef4444`,
    color: `#fff`,
    border: `none`,
    borderRadius: `8px`,
    fontSize: `13px`,
    fontWeight: `bold`,
    cursor: `pointer`,
  },
  builderRow: { display: `flex`, flexWrap: `wrap`, gap: `16px` },
  builderField: { display: `flex`, flexDirection: `column`, gap: `6px` },
  builderLabel: { fontSize: `12px`, color: `#94a3b8`, textTransform: `uppercase` },
  chartArea: {
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `12px`,
    padding: `60px`,
    textAlign: `center`,
    minHeight: `300px`,
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  tableArea: {
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `12px`,
    padding: `40px`,
    textAlign: `center`,
    minHeight: `200px`,
    display: `flex`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  placeholder: { color: `#64748b`, fontSize: `14px` },
  reportCard: {
    background: `#1e293b`,
    border: `1px solid #334155`,
    borderRadius: `12px`,
    padding: `20px`,
  },
  reportTitle: { fontSize: `14px`, color: `#94a3b8`, margin: 0, marginBottom: `8px` },
  reportValue: { fontSize: `22px`, color: `#f1f5f9`, fontWeight: `bold`, margin: 0 },
  footer: {
    textAlign: `center`,
    padding: `24px`,
    borderTop: `1px solid #1e293b`,
    fontSize: `13px`,
    color: `#64748b`,
  },
};

export default App;