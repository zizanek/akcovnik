import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [jsonData, setJsonData] = useState([]);
  const [error, setError] = useState("");
  const jsonFilePath = "data.json"; // Cesta k JSON souboru

  // Funkce na čtení CSV souboru a převod do JSON
  const handleFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target.result instanceof ArrayBuffer) {
          const decoder = new TextDecoder("windows-1250");
          const csv = decoder.decode(new Uint8Array(e.target.result));
          const data = csvToJson(csv);
          setJsonData(data);
          setError("");
        } else {
          setError("Nepodporovaný formát souboru.");
        }
      } catch (err) {
        setError("Chyba při zpracování souboru.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // CSV -> JSON převod
  const csvToJson = (csvText) => {
    const rows = csvText.split("\n").map((row) => row.split(";"));
    const headers = rows[0];
    return rows.slice(1).map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header.trim()] = row[index]?.trim() || "";
        return acc;
      }, {})
    );
  };

  // Export JSON souboru
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Načtení JSON souboru při spuštění
  useEffect(() => {
    const loadJson = async () => {
      try {
        const response = await fetch(jsonFilePath);
        if (!response.ok) throw new Error("JSON soubor nenalezen.");
        const data = await response.json();
        setJsonData(data);
        setError("");
      } catch (err) {
        setError("Načtěte prosím JSON soubor.");
      }
    };
    loadJson();
  }, []);

  return (
    <div className="app">
      <h1>Akčník Doctrina</h1>
      <input type="file" accept=".csv" onChange={handleFile} />
      <button onClick={exportJson} disabled={!jsonData.length}>
        Exportovat do JSON
      </button>

      {error && !jsonData.length && <div className="error">{error}</div>}

      {jsonData.length > 0 && (
        <table>
          <thead>
            <tr>
              {Object.keys(jsonData[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jsonData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;