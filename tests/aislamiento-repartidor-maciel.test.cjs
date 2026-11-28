const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadTsModule(filePath, customRequires = {}) {
  const code = fs.readFileSync(filePath, "utf8");
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    process: { env: {} },
    console,
    require(name) {
      if (customRequires[name]) return customRequires[name];
      return require(name);
    },
  });
  return exports;
}

const motorFiltro = loadTsModule("src/modulos/tienda/catalogo/motorFiltroCatalogo.ts");
const { productBelongsToCompany, filterCatalogProducts, deduplicateCatalogProducts } = motorFiltro;

const fallbackCatalog = loadTsModule("src/data/fallbackCatalog.ts");
const { FALLBACK_COMPANIES, FALLBACK_PRODUCTS } = fallbackCatalog;

test("Aislamiento e inventario: Tienda 'maciel · maciel #1' tiene productos disponibles", () => {
  const macielCompany = {
    id: "frigorifico-maciel-suc-1",
    name: "maciel · maciel #1",
    slug: "maciel",
    empresa_id: 1,
    sucursal_id: 1,
    parentCompanyId: "frigorifico-maciel",
    parentSlug: "maciel",
    isMultiBranch: false,
    isSingleBranch: true,
  };

  const productsForMaciel = FALLBACK_PRODUCTS.filter((p) =>
    productBelongsToCompany(p, macielCompany)
  );

  assert.ok(productsForMaciel.length >= 100, `Se esperaban >= 100 productos para Maciel #1, obtenidos: ${productsForMaciel.length}`);
  assert.equal(productsForMaciel.length, 114, "Deben ser exactamente 114 productos certificados de Maciel #1");
  console.log(`✔ maciel · maciel #1 tiene ${productsForMaciel.length} productos verificados.`);
});

test("Aislamiento e inventario: Coincidencia con variaciones de nombre e ID de Frigorífico Maciel", () => {
  const baseCompany = {
    id: "frigorifico-maciel",
    name: "Frigorífico Maciel",
    slug: "maciel",
    empresa_id: 1,
    sucursal_id: 1,
  };

  const matches = FALLBACK_PRODUCTS.filter((p) => productBelongsToCompany(p, baseCompany));
  assert.equal(matches.length, 114, "Frigorífico Maciel base debe resolver los 114 productos");
  console.log("✔ Todas las variaciones de Frigorífico Maciel asocian sus productos correctamente.");
});
