<script>
  import { onMount } from "svelte";

  let csvFile;
  let jsonData = [];
  let error = "";
  let jsonFilePath = "data.json"; // Cesta k JSON souboru

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
          error = ""; // Vyčištění případné chyby
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
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Načtení JSON souboru při spuštění
  onMount(async () => {
    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) throw new Error("JSON soubor nenalezen.");
      const data = await response.json();
      jsonData = data;
      error = "";
    } catch (err) {
      error = "Načtěte prosím JSON soubor.";
    }
  });
</script>

<style>
  /* Styly zůstávají nezměněné */
  h1, h2, h3, p, table {
    font-family: "Open Sans", sans-serif;
  }

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
    color: #333; /* Kontrastní barva textu */
  }
  th {
    background-color: #3498db; /* Modré pozadí */
    color: white; /* Bílý text */
    font-weight: bold; /* Tučný text */
  }
  td {
    background-color: #ffffff; /* Bílé pozadí */
    color: #333; /* Tmavý text */
  }
  th:hover {
    background-color: #2980b9; /* Tmavší modré při hoveru */
  }
  td:hover {
    background-color: #f2f2f2; /* Světle šedé při hoveru */
  }
</style>

<div>
  <h1>Akčník Doctrina</h1>
  <input type="file" accept=".csv" on:change={handleFile} />
  <button on:click={exportJson} disabled={!jsonData.length}>Exportovat do JSON</button>

  {#if error && !jsonData.length}
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