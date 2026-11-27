const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function createMockStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key(index) {
      return Array.from(store.keys())[index] || null;
    },
    _dump() {
      return Object.fromEntries(store.entries());
    },
  };
}

function loadModule(filePath, dependencies = {}, globals = {}) {
  const fullPath = path.join(process.cwd(), filePath);
  const source = fs.readFileSync(fullPath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    console,
    process: { env: {} },
    ...globals,
    require(name) {
      if (name in dependencies) return dependencies[name];
      throw new Error(`Dependencia no mockeada: ${name}`);
    },
  });
  return exports;
}

test("las sesiones de Comprador y Repartidor son independientes y no excluyentes", () => {
  const mockStorage = createMockStorage();
  const mockWindow = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  const driverService = loadModule("src/modulos/repartidor/motor/driverService.ts", {}, {
    window: mockWindow,
    localStorage: mockStorage,
    Event: class Event {},
  });

  const clientAuth = loadModule("src/lib/clientAuth.ts", {}, {
    localStorage: mockStorage,
  });

  // 1. Iniciar sesión como Comprador
  const clienteProfile = {
    id: "cli_comprador_123",
    uid: "usr_cli_123",
    userId: "usr_cli_123",
    displayName: "César Comprador",
    email: "cesar@cliente.com",
    role: "Client",
  };
  const clienteToken = "jwt_cliente_valido_xyz";
  driverService.saveClientProfile(clienteProfile, clienteToken);

  // Verificar que se guardó la sesión de cliente
  assert.equal(mockStorage.getItem("rf_customer_token"), clienteToken);
  assert.ok(mockStorage.getItem("rf_customer_session"));
  const loadedClient1 = driverService.loadClientProfile();
  assert.ok(loadedClient1);
  assert.equal(loadedClient1.email, "cesar@cliente.com");
  assert.equal(clientAuth.authHeaders("Client").Authorization, `Bearer ${clienteToken}`);
  assert.equal(clientAuth.authHeaders("Driver").Authorization, undefined);

  // 2. Iniciar sesión como Repartidor sin cerrar sesión de Comprador
  const driverProfile = {
    id: "rep_driver_456",
    uid: "usr_rep_456",
    userId: "usr_rep_456",
    firstName: "Lucas Repartidor",
    role: "Driver",
    vehicleType: "Motorcycle",
    availabilityStatus: "Available",
    createdAt: new Date().toISOString(),
  };
  const driverToken = "jwt_driver_valido_abc";
  driverService.saveDriverProfile(driverProfile, driverToken);

  // Verificar que se guardó la sesión de repartidor en sus claves dedicadas
  assert.equal(mockStorage.getItem("rf_driver_token"), driverToken);
  assert.ok(mockStorage.getItem("rf_driver_session"));
  const loadedDriver = driverService.loadDriverProfile();
  assert.ok(loadedDriver);
  assert.equal(loadedDriver.firstName, "Lucas Repartidor");

  // Verificar que la sesión de comprador SIGUE intacta (no se borró ni sobrescribió)
  const loadedClient2 = driverService.loadClientProfile();
  assert.ok(loadedClient2);
  assert.equal(loadedClient2.email, "cesar@cliente.com");
  assert.equal(mockStorage.getItem("rf_customer_token"), clienteToken);
  assert.equal(clientAuth.authHeaders("Client").Authorization, `Bearer ${clienteToken}`);
  assert.equal(clientAuth.authHeaders("Driver").Authorization, `Bearer ${driverToken}`);

  // 3. Repartidor cierra sesión: solo debe apagar Repartidor
  mockStorage.setItem("rf_driver_wallet", JSON.stringify({ balance: 5000 }));
  mockStorage.setItem("rf_driver_vehicle", "moto");
  driverService.clearDriverProfile();

  // Claves de repartidor eliminadas
  assert.equal(mockStorage.getItem("rf_driver_token"), null);
  assert.equal(mockStorage.getItem("rf_driver_session"), null);
  assert.equal(mockStorage.getItem("repartofacil_driver_token"), null);
  assert.equal(mockStorage.getItem("repartofacil_driver_user"), null);
  assert.equal(mockStorage.getItem("rf_driver_wallet"), null);
  assert.equal(mockStorage.getItem("rf_driver_vehicle"), null);
  assert.equal(driverService.loadDriverProfile(), null);
  assert.equal(clientAuth.authHeaders("Driver").Authorization, undefined);

  // La sesión de Comprador permanece intacta
  const loadedClientAfterDriverLogout = driverService.loadClientProfile();
  assert.ok(loadedClientAfterDriverLogout);
  assert.equal(loadedClientAfterDriverLogout.email, "cesar@cliente.com");
  assert.equal(mockStorage.getItem("rf_customer_token"), clienteToken);
  assert.equal(clientAuth.authHeaders("Client").Authorization, `Bearer ${clienteToken}`);
});
