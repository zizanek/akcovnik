<script>
  import { onMount } from "svelte";

  let csvFile;
  let jsonData = [];
  let error = "";

  // Funkce na čtení CSV souboru a převod do JSON
  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const csv = e.target.result;
        jsonData = csvToJson(csv);
        error = ""; // Vyčištění případné chyby
      } catch (err) {
        error = "Chyba při zpracování souboru.";
      }
    };
    reader.readAsText(file);
  }

  // CSV -> JSON převod
  function csvToJson(csvText) {
    const rows = csvText.split("\n").map(row => row.split(";"));
    const headers = rows[0];
    return rows.slice(1).map(row =>
      headers.reduce((acc, header, index) => {
        acc[header.trim()] = row[index]?.trim() || "";
        return acc;
      }, {})
    );
  }

  // Export JSON souboru
  function exportJson() {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<style>
  .error {
    color: red;
    margin-top: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 10px;
    text-align: left;
  }
  th {
    background-color: #f4f4f4;
  }
</style>

<div>
  <h1>Akčník Doctrina</h1>
  <input type="file" accept=".csv" on:change={handleFile} />
  <button on:click={exportJson} disabled={!jsonData.length}>Exportovat do JSON</button>

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if jsonData.length}
    <table>
      <thead>
        <tr>
          {#each Object.keys(jsonData[0]) as key}
            <th>{key}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each jsonData as row}
          <tr>
            {#each Object.values(row) as value}
              <td>{value}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>