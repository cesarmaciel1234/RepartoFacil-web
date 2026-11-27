const assert = require("assert");

function cleanSearchText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00ad/g, "")
    .toLowerCase()
    .trim();
}

function filterCatalog(catalog, searchQuery, selectedCategory = "todos") {
  const query = cleanSearchText(searchQuery);
  const category = cleanSearchText(selectedCategory);

  return catalog.filter((product) => {
    const deptRaw = String(product.department || product.categoryName || product.category || "GENERAL").trim().toUpperCase();
    const deptClean = cleanSearchText(deptRaw);
    const nameClean = cleanSearchText(product.name);
    const codeRaw = String(
      product.code ||
      product.codigo ||
      product.id ||
      ""
    ).replace(/^(tpv|fallback)-suc-\d+-/, "").trim();
    const codeClean = cleanSearchText(codeRaw);

    const matchesSearch =
      !query ||
      nameClean.includes(query) ||
      deptClean.includes(query) ||
      (codeClean.length > 0 && codeClean.includes(query));

    const matchesCategory =
      category === "todos" ||
      deptClean === category ||
      cleanSearchText(product.category || "") === category;

    return matchesSearch && matchesCategory;
  });
}

const sampleCatalog = [
  { id: "tpv-suc-1-760", name: "Suprema", department: "AVES", category: "aves", code: "760", description: "AVES · Inventario en vivo Frigorífico Maciel. Código TPV: 760." },
  { id: "tpv-suc-1-960", name: "Oferta Suprema", department: "AVES", category: "aves", code: "960", description: "AVES · Inventario en vivo Frigorífico Maciel. Código TPV: 960." },
  { id: "tpv-suc-1-10", name: "Asado", department: "CARNE", category: "carne", code: "10", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 10." },
  { id: "tpv-suc-1-60", name: "Asado Americano", department: "CARNE", category: "carne", code: "60", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 60." },
  { id: "tpv-suc-1-240", name: "Oferta Tapa Asado", department: "CARNE", category: "carne", code: "240", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 240." },
  { id: "tpv-suc-1-7798342990172", name: "tapa de asado", department: "CARNE", category: "carne", code: "719", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 719." },
  { id: "tpv-suc-1-160", name: "Espi\u00adnazo", department: "CARNE", category: "carne", code: "160", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 160." },
  { id: "tpv-suc-1-400", name: "matambre arrollado", department: "CARNE", category: "carne", code: "400", description: "CARNE · Inventario en vivo Frigorífico Maciel. Código TPV: 400." },
  { id: "tpv-suc-1-7798342990175", name: "papas MC.", department: "ALMACEN", category: "almacen", code: "2017", description: "ALMACEN · Inventario en vivo Frigorífico Maciel. Código TPV: 2017." },
  { id: "tpv-suc-1-1711", name: "pan rallado", department: "ALMACEN", category: "almacen", code: "511", description: "ALMACEN · Inventario en vivo Frigorífico Maciel. Código TPV: 511." },
  { id: "tpv-suc-1-754697504357", name: "sal carne", department: "ALMACEN", category: "almacen", code: "754697504357", description: "ALMACEN · Inventario en vivo Frigorífico Maciel. Código TPV: 754697504357." },
  { id: "tpv-suc-1-7798342990169", name: "sal achuras", department: "GENERAL", category: "general", code: "7798342990169", description: "GENERAL · Inventario en vivo Frigorífico Maciel. Código TPV: 7798342990169." },
  { id: "tpv-suc-1-7798088142615", name: "aceite de oliva", department: "ALMACEN", category: "almacen", code: "7798088142615", description: "ALMACEN · Inventario en vivo Frigorífico Maciel." },
];

console.log("=== TESTS: Buscador Interno de Tienda ===");

// 1. Búsqueda por "asado"
const asadoResults = filterCatalog(sampleCatalog, "asado");
console.log("1. Busqueda 'asado':", asadoResults.map(p => p.name));
assert.strictEqual(asadoResults.length, 4, "Debe retornar exactamente 4 productos con 'asado'");
assert(asadoResults.every(p => cleanSearchText(p.name).includes("asado")), "Todos deben contener 'asado' en su nombre");
const unwantedInAsado = ["Espi\u00adnazo", "matambre arrollado", "papas MC.", "pan rallado", "sal carne", "sal achuras"];
assert(
  !asadoResults.some(p => unwantedInAsado.includes(p.name)),
  "Ninguno de los 6 productos no relacionados debe pasar el filtro de 'asado'"
);

// 2. Búsqueda por "suprema"
const supremaResults = filterCatalog(sampleCatalog, "suprema");
console.log("2. Busqueda 'suprema':", supremaResults.map(p => p.name));
assert.strictEqual(supremaResults.length, 2, "Debe retornar exactamente 2 productos con 'suprema'");
assert(
  !supremaResults.some(p => unwantedInAsado.includes(p.name)),
  "Ninguno de los 6 productos no relacionados debe pasar el filtro de 'suprema'"
);

// 3. Búsqueda por "aceite"
const aceiteResults = filterCatalog(sampleCatalog, "aceite");
console.log("3. Busqueda 'aceite':", aceiteResults.map(p => p.name));
assert.strictEqual(aceiteResults.length, 1, "Debe retornar 1 producto para 'aceite'");
assert.strictEqual(aceiteResults[0].name, "aceite de oliva");

// 4. Búsqueda por código TPV
const codeResults = filterCatalog(sampleCatalog, "160");
console.log("4. Busqueda por codigo '160':", codeResults.map(p => p.name));
assert.strictEqual(codeResults.length, 1, "Debe encontrar el producto con código 160");
assert(codeResults[0].name.includes("Espi"), "El producto 160 debe ser Espinazo");

// 5. Búsqueda por departamento
const avesResults = filterCatalog(sampleCatalog, "aves");
console.log("5. Busqueda por departamento 'aves':", avesResults.map(p => p.name));
assert.strictEqual(avesResults.length, 2, "Debe encontrar los 2 productos del departamento AVES");

// 6. Normalización de acentos y caracteres invisibles (soft-hyphen \u00ad)
const espinazoResults = filterCatalog(sampleCatalog, "espinazo");
console.log("6. Busqueda 'espinazo' normalizada:", espinazoResults.map(p => p.name));
assert.strictEqual(espinazoResults.length, 1, "Debe encontrar 'Espi\\u00adnazo' sin soft-hyphen ni acento");

// 7. No coincidencias espurias con la descripción
const vivoResults = filterCatalog(sampleCatalog, "inventario en vivo");
console.log("7. Busqueda por texto boilerplate 'inventario en vivo':", vivoResults.length);
assert.strictEqual(vivoResults.length, 0, "No debe machear la descripción boilerplate");

console.log(">>> TODOS LOS TESTS DE BUSCADOR DE TIENDA PASARON EXITOSAMENTE. <<<");
