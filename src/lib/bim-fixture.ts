import type { AgentId } from "@/lib/domain";

export const bimFixture = {
  project: "Edificio Demo",
  units: "m",
  levels: ["Planta baja", "Planta 1", "Cubierta"],
  elements: [
    { id: "W-101", type: "Muro", level: "Planta baja", length: 8.4, area: 25.2 },
    { id: "D-201", type: "Puerta", level: "Planta baja", width: 0.9, height: 2.1 },
    { id: "R-102", type: "Espacio", name: "Vestíbulo", level: "Planta baja", area: 18.6 },
    { id: "WIN-202", type: "Ventana", name: "Ventana fachada este", level: "Planta baja", width: 1.5, height: 1.2 },
    { id: "C-301", type: "Columna", level: "Planta 1", width: 0.4, height: 3.2 },
    { id: "B-302", type: "Viga", level: "Planta 1", length: 5.8 },
    { id: "S-303", type: "Losa", level: "Planta 1", area: 42.0 },
    { id: "DUCT-401", type: "Conducto HVAC", level: "Planta 1", length: 12.6 },
    { id: "P-501", type: "Tubería", level: "Cubierta", length: 6.8 },
    { id: "E-601", type: "Luminaria", level: "Planta 1", quantity: 8 },
    { id: "PANEL-602", type: "Cuadro eléctrico", level: "Planta baja", quantity: 1 },
  ],
  architecture: {
    spaces: [
      { id: "R-102", name: "Vestíbulo", level: "Planta baja", area: 18.6, unit: "m²" },
      { id: "R-103", name: "Sala de reuniones", level: "Planta baja", area: 32.4, unit: "m²" },
      { id: "R-201", name: "Oficina abierta", level: "Planta 1", area: 84.0, unit: "m²" },
    ],
    sheets: [
      { id: "A-101", name: "Planta arquitectónica · Planta baja", level: "Planta baja", scale: "1:100" },
      { id: "A-102", name: "Planta arquitectónica · Planta 1", level: "Planta 1", scale: "1:100" },
      { id: "A-201", name: "Alzado principal", level: "General", scale: "1:100" },
    ],
  },
  structure: {
    system: "Hormigón armado",
    elements: [
      { id: "C-301", type: "Columna", level: "Planta 1", section: "40 × 40 cm", height: 3.2 },
      { id: "B-302", type: "Viga", level: "Planta 1", section: "30 × 55 cm", length: 5.8 },
      { id: "S-303", type: "Losa", level: "Planta 1", thickness: 0.22, area: 42.0 },
    ],
  },
  mep: {
    hvac: [{ id: "DUCT-401", type: "Conducto de impulsión", level: "Planta 1", length: 12.6, system: "Climatización" }],
    plumbing: [{ id: "P-501", type: "Tubería de agua", level: "Cubierta", length: 6.8, system: "Fontanería" }],
    electrical: [
      { id: "E-601", type: "Luminaria LED", level: "Planta 1", quantity: 8 },
      { id: "PANEL-602", type: "Cuadro eléctrico", level: "Planta baja", quantity: 1 },
    ],
  },
  clashes: [
    {
      id: "CL-01",
      elements: ["DUCT-401", "C-301"],
      level: "Planta 1",
      severity: "Alta",
      description: "El conducto HVAC atraviesa la columna C-301.",
    },
    {
      id: "CL-02",
      elements: ["P-501", "W-101"],
      level: "Cubierta",
      severity: "Media",
      description: "La tubería se aproxima al muro perimetral.",
    },
  ],
};

export function fixtureForAgent(agent: AgentId): string {
  if (agent === "clashes") return JSON.stringify(bimFixture.clashes, null, 2);
  if (agent === "quantities") return JSON.stringify(bimFixture.elements, null, 2);
  if (agent === "architecture") return JSON.stringify({ levels: bimFixture.levels, ...bimFixture.architecture }, null, 2);
  if (agent === "structure") return JSON.stringify(bimFixture.structure, null, 2);
  if (agent === "mep") return JSON.stringify(bimFixture.mep, null, 2);
  return JSON.stringify(bimFixture, null, 2);
}
