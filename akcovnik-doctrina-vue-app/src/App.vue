<template>
  <div class="app">
    <h1>Akčník Doctrina</h1>
    <input type="file" accept=".csv" @change="handleFile" />
    <button @click="exportJson" :disabled="!jsonData.length">
      Exportovat do JSON
    </button>

    <div v-if="error && !jsonData.length" class="error">{{ error }}</div>

    <table v-if="jsonData.length">
      <thead>
        <tr>
          <th v-for="key in Object.keys(jsonData[0])" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in jsonData" :key="index">
          <td v-for="(value, idx) in Object.values(row)" :key="idx">{{ value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jsonData: [],
      error: "",
      jsonFilePath: "data.json",
    };
  },
  methods: {
    // Funkce na čtení CSV souboru a převod do JSON
    handleFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target.result instanceof ArrayBuffer) {
            const decoder = new TextDecoder("windows-1250");
            const csv = decoder.decode(new Uint8Array(e.target.result));
            this.jsonData = this.csvToJson(csv);
            this.error = "";
          } else {
            this.error = "Nepodporovaný formát souboru.";
          }
        } catch (err) {
          this.error = "Chyba při zpracování souboru.";
        }
      };
      reader.readAsArrayBuffer(file);
    },

    // CSV -> JSON převod
    csvToJson(csvText) {
      const rows = csvText.split("\n").map((row) => row.split(";"));
      const headers = rows[0];
      return rows.slice(1).map((row) =>
        headers.reduce((acc, header, index) => {
          acc[header.trim()] = row[index]?.trim() || "";
          return acc;
        }, {})
      );
    },

    // Export JSON souboru
    exportJson() {
      const blob = new Blob([JSON.stringify(this.jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data.json";
      link.click();
      URL.revokeObjectURL(url);
    },
  },
  async mounted() {
    // Načtení JSON souboru při spuštění
    try {
      const response = await fetch(this.jsonFilePath);
      if (!response.ok) throw new Error("JSON soubor nenalezen.");
      this.jsonData = await response.json();
      this.error = "";
    } catch (err) {
      this.error = "Načtěte prosím JSON soubor.";
    }
  },
};
</script>

<style>


body {
  font-family: "Open Sans", sans-serif;
  margin: 0;
  padding: 0;
}

.app {
  text-align: center;
  padding: 20px;
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

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
  color: #333;
}

th {
  background-color: #3498db;
  color: white;
  font-weight: bold;
}

td {
  background-color: #ffffff;
}

th:hover {
  background-color: #2980b9;
}

td:hover {
  background-color: #f2f2f2;
}
</style>