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
        // Ověření, že `result` je typu ArrayBuffer
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


  @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  h1, h2, h3, p, table {
    /*font-family: 'Roboto', sans-serif;*/
    /* font-family: 'Poppins', sans-serif;*/
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