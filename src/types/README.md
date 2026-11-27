# Definiciones de Tipos TypeScript (`src/types/`)

## 1. Qué hace
Centraliza las interfaces, enums y tipos TypeScript que definen los modelos de dominio del e-commerce, usuarios, pedidos y respuestas de API.

## 2. De dónde viene
- Importado en tiempo de compilación por toda la aplicación para garantizar tipado estricto (`tsc --noEmit`).

## 3. Archivos principales
- `index.ts` / `types.ts`: Tipos de Producto, Carrito, Comercio, Repartidor, Pedido y Estado de Entrega.

## 4. Hacia dónde sale
- Hacia el compilador de TypeScript y los módulos de lógica y UI.
