import { useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FileUpload({ onDataParsed }) {
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [rowCount, setRowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ========== PDF پڑھنے کا فنکشن ==========
  const readPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  };

  // ========== PDF متن سے ڈیٹا نکالنا ==========
  const parsePDFText = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const rows = [];

    lines.forEach((line) => {
      // فرض کریں کہ ہر لائن میں ڈیٹا ہے
      // یہ آپ کے PDF کے مطابق تبدیل کرنا ہوگا
      const parts = line.split(/\s{2,}|\t/);
      
      if (parts.length >= 8) {
        rows.push({
          date: parts[0] || "",
          district: parts[1] || "",
          fieldUnit: parts[2] || "",
          uc: parts[3] || "",
          city: parts[4] || "",
          employeeName: parts[5] || "",
          disbursement: parseFloat(parts[6]) || 0,
          dueDate: parts[7] || "",
          recoveryDate: parts[8] || "",
          recoveryAmount: parseFloat(parts[9]) || 0,
          profit: parseFloat(parts[10]) || 0,
          overdue: parseFloat(parts[11]) || 0,
        });
      }
    });

    return rows;
  };

  // ========== Word متن سے ڈیٹا نکالنا ==========
  const parseWordHTML = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll("table");
    const rows = [];

    tables.forEach((table) => {
      const tableRows = table.querySelectorAll("tr");
      tableRows.forEach((tr, index) => {
        if (index === 0) return; // Skip header
        const cells = tr.querySelectorAll("td");
        if (cells.length >= 8) {
          rows.push({
            date: cells[0]?.textContent?.trim() || "",
            district: cells[1]?.textContent?.trim() || "",
            fieldUnit: cells[2]?.textContent?.trim() || "",
            uc: cells[3]?.textContent?.trim() || "",
            city: cells[4]?.textContent?.trim() || "",
            employeeName: cells[5]?.textContent?.trim() || "",
            disbursement: parseFloat(cells[6]?.textContent) || 0,
            dueDate: cells[7]?.textContent?.trim() || "",
            recoveryDate: cells[8]?.textContent?.trim() || "",
            recoveryAmount: parseFloat(cells[9]?.textContent) || 0,
            profit: parseFloat(cells[10]?.textContent) || 0,
            overdue: parseFloat(cells[11]?.textContent) || 0,
          });
        }
      });
    });

    return rows;
  };

  // ========== مرکزی فنکشن ==========
  const handleFile = async (file) => {
    if (!file) return;

    setFileName(file.name);
    setStatus("⏳ پڑھا جا رہا ہے...");
    setIsLoading(true);

    const ext = file.name.split(".").pop().toLowerCase();

    try {
      let parsedData = [];

      // === Excel ===
      if (["xlsx", "xls"].includes(ext)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        parsedData = json.map((row) => normalizeRow(row));
      }

      // === CSV / TSV ===
      else if (["csv", "tsv"].includes(ext)) {
        await new Promise((resolve) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              parsedData = results.data.map((row) => normalizeRow(row));
              resolve();
            },
          });
        });
      }

      // === Word ===
      else if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        parsedData = parseWordHTML(result.value);
      }

      // === PDF ===
      else if (ext === "pdf") {
        const text = await readPDF(file);
        parsedData = parsePDFText(text);
      }

      // === TXT ===
      else if (ext === "txt") {
        const text = await file.text();
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0].split(/[,\t]/).map((h) => h.trim());
        parsedData = lines.slice(1).map((line) => {
          const values = line.split(/[,\t]/);
          const row = {};
          headers.forEach((h, i) => (row[h] = values[i]?.trim() || ""));
          return normalizeRow(row);
        });
      }

      // === غلط فارمیٹ ===
      else {
        setStatus(`❌ "${ext}" فارمیٹ سپورٹڈ نہیں`);
        setIsLoading(false);
        return;
      }

      // === کامیابی ===
      if (parsedData.length > 0) {
        setRowCount(parsedData.length);
        setStatus(`✅ ${parsedData.length} قطاریں پڑھی گئیں`);
        onDataParsed(parsedData);
      } else {
        setStatus("⚠️ کوئی ڈیٹا نہیں ملا");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ خرابی: " + err.message);
    }

    setIsLoading(false);
  };

  // ========== ڈیٹا کو یکساں بنانا ==========
  const normalizeRow = (row) => {
    const get = (keys) => {
      for (const key of keys) {
        if (row[key] !== undefined) return row[key];
      }
      return "";
    };

    return {
      date: get(["Date", "date", "تاریخ"]),
      district: get(["District", "district", "ضلع"]),
      fieldUnit: get(["Field Unit", "FieldUnit", "fieldUnit", "فیلڈ یونٹ"]),
      uc: get(["UC", "uc", "Union Council", "یونین کونسل"]),
      city: get(["City", "city", "شہر"]),
      employeeName: get(["Employee Name", "Employee", "employeeName", "ملازم"]),
      disbursement: parseFloat(get(["Disbursement", "disbursement", "قرض"])) || 0,
      dueDate: get(["Due Date", "dueDate", "مقررہ تاریخ"]),
      recoveryDate: get(["Recovery Date", "recoveryDate", "وصولی تاریخ"]),
      recoveryAmount: parseFloat(get(["Recovery Amount", "Recovery", "recoveryAmount", "وصولی"])) || 0,
      profit: parseFloat(get(["Profit", "profit", "منافع"])) || 0,
      overdue: parseFloat(get(["Overdue", "overdue", "بقایا"])) || 0,
    };
  };

  return (
    <div style={styles.uploadContainer}>
      <div
        style={styles.dropZone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
      >
        <span style={styles.uploadIcon}>📤</span>
        <p style={styles.uploadText}>فائل یہاں ڈراپ کریں</p>
        <p style={styles.uploadFormats}>
          Excel | CSV | TSV | Word | PDF | TXT
        </p>
        
        <label style={styles.browseBtn}>
          Browse Files
          <input
            type="file"
            accept=".xlsx,.xls,.csv,.tsv,.docx,.pdf,.txt"
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {fileName && (
        <div style={styles.fileInfo}>
          <p>📄 <strong>{fileName}</strong></p>
          {rowCount > 0 && <p>✅ {rowCount} rows loaded</p>}
          <p style={styles.statusText}>{status}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  uploadContainer: { marginBottom: `20px` },
  dropZone: {
    border: `2px dashed #334155`,
    borderRadius: `12px`,
    padding: `40px 20px`,
    textAlign: `center`,
    background: `#1e293b`,
    transition: `0.2s`,
  },
  uploadIcon: { fontSize: `48px`, display: `block`, marginBottom: `12px` },
  uploadText: { color: `#94a3b8`, marginBottom: `8px`, fontSize: `15px` },
  uploadFormats: { color: `#64748b`, fontSize: `12px`, marginBottom: `16px` },
  browseBtn: {
    display: `inline-block`,
    padding: `12px 28px`,
    background: `#38bdf8`,
    color: `#0f172a`,
    borderRadius: `8px`,
    fontSize: `14px`,
    fontWeight: `bold`,
    cursor: `pointer`,
  },
  fileInfo: {
    marginTop: `16px`,
    padding: `16px`,
    background: `#1e293b`,
    borderRadius: `8px`,
    border: `1px solid #334155`,
    fontSize: `13px`,
    color: `#cbd5e1`,
  },
  statusText: { marginTop: `8px`, color: `#facc15` },
};

export default FileUpload;