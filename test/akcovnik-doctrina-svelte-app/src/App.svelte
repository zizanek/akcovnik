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

  function createTable() {
    if (!jsonData.length) return;

    table = new Tabulator("#tabulator-table", {
      data: jsonData,
      layout: "fitDataStretch",
      pagination: "local",
      paginationSize: 20,
      columns: Object.keys(jsonData[0]).map((key, index) => ({
        title: key,
        field: key,
        headerFilter: "input",
        headerFilterPlaceholder: `Filtruj ${key}`,
        frozen: index < 2,
        formatter: (cell) => {
          if (key === "Škola - oddělení") {
            const value = cell.getValue();
            if (value === "Gymnázium")
              return `<div style="background-color: #3498db; color: white;">${value}</div>`;
            if (value === "Základní škola")
              return `<div style="background-color: #2ecc71; color: white;">${value}</div>`;
            if (value === "Základní škola - 1. stupeň")
              return `<div style="background-color: #e67e22; color: white;">${value}</div>`;
            if (value === "Mateřská škola")
              return `<div style="background-color: #9b59b6; color: white;">${value}</div>`;
            if (value === "MŠ NEW Doctrina")
              return `<div style="background-color: #d50d50; color: white;">${value}</div>`;
            if (value === "ZŠ NEW Doctrina")
              return `<div style="background-color: #ca2a7a; color: white;">${value}</div>`;
          }
          return cell.getValue(); // Výchozí hodnota
        },
      })),
      pageLoaded: function () {
        table.redraw(true); // Přepočítá šířky sloupců
      },
    });
  }

  function filterTable(filterValue) {
    if (filterValue === "all") {
      table.clearFilter();
    } else {
      table.setFilter("Škola - oddělení", "=", filterValue);
    }
  }

  // Filtruje tabulku podle měsíce
  function filterByMonth(month) {
    if (month === "all") {
      table.clearFilter();
    } else {
      table.setFilter("Termín", "like", month);
    }
  }

  // Získání seznamu měsíců
  function getMonths() {
    const months = [
      "Leden",
      "Únor",
      "Březen",
      "Duben",
      "Květen",
      "Červen",
      "Červenec",
      "Srpen",
      "Září",
      "Říjen",
      "Listopad",
      "Prosinec",
    ];
    const currentMonth = new Date().getMonth();
    return [...months.slice(currentMonth), ...months.slice(0, currentMonth)];
  }

  let months = getMonths();

  // Načtení JSON souboru při spuštění
  onMount(async () => {
    try {
      const response = await fetch("data.json");
      if (!response.ok) throw new Error("JSON soubor nenalezen.");
      jsonData = await response.json();
      createTable();
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

  .month-button {
    background-color: #bdc3c7;
    color: black;
    border: none;
    padding: 10px 15px;
    margin: 5px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>

<div>
  <h1>Akcovník Doctrina</h1>
  <input type="file" accept=".csv" on:change={handleFile} />
  <button on:click={exportJson} disabled={!jsonData.length}>
    Exportovat do JSON
  </button>

  {#if error && !jsonData.length}
    <div class="error">{error}</div>
  {/if}

  <div>
    {#each months as month}
      <button
        class="month-button"
        on:click={() => filterByMonth(month)}>
        {month}
      </button>
    {/each}
    <button
      class="month-button"
      on:click={() => filterByMonth("all")}>
      Zobrazit vše
    </button>
  </div>

  <div>
    <button
      style="background-color: #3498db; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("Gymnázium")}>
      Gymnázium
    </button>
    <button
      style="background-color: #2ecc71; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("Základní škola")}>
      Základní škola
    </button>
    <button
      style="background-color: #e67e22; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("Základní škola - 1. stupeň")}>
      Základní škola - 1. stupeň
    </button>
    <button
      style="background-color: #9b59b6; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("Mateřská škola")}>
      Mateřská škola
    </button>
    <button
      style="background-color: #d50d50; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("MŠ NEW Doctrina")}>
      MŠ NEW Doctrina
    </button>
    <button
      style="background-color: #ca2a7a; color: white; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("ZŠ NEW Doctrina")}>
      ZŠ NEW Doctrina
    </button>
    <button
      style="background-color: #bdc3c7; color: black; border: none; padding: 10px 15px; margin: 5px; border-radius: 4px; cursor: pointer;"
      on:click={() => filterTable("all")}>
      Zobrazit vše
    </button>
  </div>

  <div id="tabulator-table"></div>
</div>
