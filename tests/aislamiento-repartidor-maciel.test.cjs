const test = require("node:test");
const assert = require("node:assert/strict");

// 1. Importar motorFiltroCatalogo
const {
  productBelongsToCompany,
  filterCatalogProducts,
  deduplicateCatalogProducts,
} = require("../src/modulos/tienda/catalogo/motorFiltroCatalogo");

// 2. Importar FALLBACK_COMPANIES y FALLBACK_PRODUCTS
const {
  FALLBACK_COMPANIES,
  FALLBACK_PRODUCTS,
} = require("../src/data/fallbackCatalog");

test("Aislamiento e inventario: Tienda 'maciel · maciel #1' tiene productos disponibles", () => {
  // Simular la empresa tal como la entrega la API o el estado de navegación
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

  // Filtrar los productos para esta tienda
  const matchingProducts = FALLBACK_PRODUCTS.filter((product) =>
    productBelongsToCompany(product, macielCompany)
  );

  assert.ok(matchingProducts.length > 0, "La tienda maciel · maciel #1 debe tener productos asociados");
  assert.ok(matchingProducts.length >= 50, `Se esperaban al menos 50 productos, se obtuvieron ${matchingProducts.length}`);

  const deduplicated = deduplicateCatalogProducts(matchingProducts);
  assert.equal(deduplicated.length, matchingProducts.length, "No debe haber duplicados en el catálogo de Maciel");

  // Verificar filtrado por búsqueda de 'asado'
  const filteredAsado = filterCatalogProducts(deduplicated, "asado", "todos");
  assert.ok(filteredAsado.length > 0, "Debe encontrar cortes de asado en Maciel");

  console.log(`✔ maciel · maciel #1 tiene ${matchingProducts.length} productos verificados.`);
});

test("Aislamiento e inventario: Coincidencia con variaciones de nombre e ID de Frigorífico Maciel", () => {
  const variations = [
    { id: "frigorifico-maciel", name: "Frigorífico Maciel", slug: "maciel", empresa_id: 1 },
    { id: "frigorifico-maciel-suc-1", name: "maciel #1", slug: "maciel", empresa_id: 1, sucursal_id: 1 },
    { id: "empresa-1", name: "maciel · maciel #1", slug: "maciel", empresa_id: 1 },
    { id: "empresa-1-suc-1", name: "maciel · maciel #1", slug: "maciel", empresa_id: 1, sucursal_id: 1 },
  ];

  for (const comp of variations) {
    const matched = FALLBACK_PRODUCTS.filter((p) => productBelongsToCompany(p, comp));
    assert.ok(matched.length > 0, `Variación ${comp.name} (${comp.id}) debe tener productos`);
  }
  console.log("✔ Todas las variaciones de Frigorífico Maciel asocian sus productos correctamente.");
});
