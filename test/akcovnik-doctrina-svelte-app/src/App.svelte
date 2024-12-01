<script>
  import { onMount } from "svelte";
  import { TabulatorFull as Tabulator } from "tabulator-tables";
  import "tabulator-tables/dist/css/tabulator.min.css";

  let csvFile;
  let jsonData = [];
  let error = "";
  let table;

  // Funkce na čtení CSV souboru a převod do JSON
  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        if (e.target && e.target.result instanceof ArrayBuffer) {
          const decoder = new TextDecoder("windows-1250");
          const csv = decoder.decode(new Uint8Array(e.target.result));
          jsonData = csvToJson(csv);
          error = "";
          createTable(); // Vytvoření tabulky po načtení dat
        } else {
          error = "Nepodporovaný formát souboru.";
        }
      } catch (err) {
        error = "Chyba při zpracování souboru.";
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // CSV -> JSON převod
  function csvToJson(csvText) {
    const rows = csvText.split("\n").map((row) => row.split(";"));
    const headers = rows[0];
    return rows.slice(1).map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header.trim()] = row[index]?.trim() || "";
        return acc;
      }, {})
    );
  }

  // Export JSON souboru
  function exportJson() {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Vytvoření Tabulator tabulky
  function createTable() {
    if (!jsonData.length) return;

    table = new Tabulator("#tabulator-table", {
      data: jsonData,
      layout: "fitColumns",
      pagination: "local",
      paginationSize: 10,
      columns: Object.keys(jsonData[0]).map((key) => ({
        title: key,
        field: key,
        headerFilter: "input", // Pole pro filtrování přímo v hlavičce
        headerFilterPlaceholder: `Filtruj ${key}`, // Placeholder
      })),
    });
  }

  // Načtení JSON souboru při spuštění
  onMount(async () => {
    try {
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("JSON soubor nenalezen.");
      jsonData = await response.json();
      createTable(); // Vytvoření tabulky po načtení dat
    } catch (err) {
      error = "Načtěte prosím JSON soubor.";
    }
  });
</script>

<style>
  #tabulator-table {
    margin-top: 20px;
    border: 1px solid #ccc;
  }

  h1, input, button {
    font-family: "Open Sans", sans-serif;
  }

  .error {
    color: red;
    margin-top: 10px;
  }
</style>

<div>
  <h1>Akčník Doctrina</h1>
  <input type="file" accept=".csv" on:change={handleFile} />
  <button on:click={exportJson} disabled={!jsonData.length}>
    Exportovat do JSON
  </button>

  {#if error && !jsonData.length}
    <div class="error">{error}</div>
  {/if}

  <!-- Kontejner pro Tabulator -->
  <div id="tabulator-table"></div>
</div>
