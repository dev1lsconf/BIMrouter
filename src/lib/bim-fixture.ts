import type { AgentId } from "@/lib/domain";

export const bimFixture = {
  project: "Edificio Demo",
  units: "m",
  levels: ["Sótano", "Planta baja", "Planta 1", "Planta 2", "Planta 3", "Cubierta"],
  elements: [
    { id: "S-001", type: "Espacio", name: "Garaje", level: "Sótano", area: 210.0 },
    { id: "S-002", type: "Espacio", name: "Cuarto técnico", level: "Sótano", area: 18.4 },
    { id: "C-001", type: "Columna", level: "Sótano", width: 0.45, height: 3.0 },
    { id: "SL-001", type: "Losa", level: "Sótano", area: 228.4 },
    { id: "P-001", type: "Bomba de achique", level: "Sótano", quantity: 2 },
    { id: "E-002", type: "Luminaria estanca LED", level: "Sótano", quantity: 10 },
    { id: "PANEL-003", type: "Subcuadro eléctrico", level: "Sótano", quantity: 1 },
    { id: "W-101", type: "Muro", level: "Planta baja", length: 8.4, area: 25.2 },
    { id: "D-201", type: "Puerta", level: "Planta baja", width: 0.9, height: 2.1 },
    { id: "R-102", type: "Espacio", name: "Vestíbulo", level: "Planta baja", area: 18.6 },
    { id: "R-103", type: "Espacio", name: "Sala de reuniones", level: "Planta baja", area: 32.4 },
    { id: "R-104", type: "Espacio", name: "Área de lavado", level: "Planta baja", area: 5.8 },
    { id: "R-202", type: "Espacio", name: "Área de lavado", level: "Planta 1", area: 6.2 },
    { id: "R-203", type: "Espacio", name: "Área de lavado", level: "Planta 1", area: 6.5 },
    { id: "R-201", type: "Espacio", name: "Oficina abierta", level: "Planta 1", area: 84.0 },
    { id: "WIN-202", type: "Ventana", name: "Ventana fachada este", level: "Planta baja", width: 1.5, height: 1.2 },
    { id: "C-301", type: "Columna", level: "Planta 1", width: 0.4, height: 3.2 },
    { id: "B-302", type: "Viga", level: "Planta 1", length: 5.8 },
    { id: "S-303", type: "Losa", level: "Planta 1", area: 42.0 },
    { id: "DUCT-401", type: "Conducto HVAC", level: "Planta 1", length: 12.6 },
    { id: "P-501", type: "Tubería", level: "Cubierta", length: 6.8 },
    { id: "E-601", type: "Luminaria", level: "Planta 1", quantity: 8 },
    { id: "PANEL-602", type: "Cuadro eléctrico", level: "Planta baja", quantity: 1 },
    { id: "R-301", type: "Espacio", name: "Oficina de proyectos", level: "Planta 2", area: 72.0 },
    { id: "R-302", type: "Espacio", name: "Sala de descanso", level: "Planta 2", area: 21.0 },
    { id: "C-701", type: "Columna", level: "Planta 2", width: 0.4, height: 3.1 },
    { id: "B-702", type: "Viga", level: "Planta 2", length: 6.2 },
    { id: "DUCT-703", type: "Conducto HVAC", level: "Planta 2", length: 15.4 },
    { id: "E-704", type: "Luminaria", level: "Planta 2", quantity: 12 },
    { id: "R-401", type: "Espacio", name: "Sala de formación", level: "Planta 3", area: 58.5 },
    { id: "R-402", type: "Espacio", name: "Terraza técnica", level: "Planta 3", area: 24.0 },
    { id: "D-401", type: "Puerta", name: "Acceso a sala de formación", level: "Planta 3", room: "R-401", width: 0.9, height: 2.1 },
    { id: "C-801", type: "Columna", level: "Planta 3", width: 0.4, height: 3.1 },
    { id: "S-802", type: "Losa", level: "Planta 3", area: 82.5 },
    { id: "DUCT-803", type: "Conducto de extracción", level: "Planta 3", length: 9.2 },
    { id: "E-804", type: "Luminaria", level: "Planta 3", quantity: 10 },
  ],
  architecture: {
    spaces: [
      { id: "S-001", name: "Garaje", level: "Sótano", area: 210.0, unit: "m²", capacity: "8 plazas" },
      { id: "S-002", name: "Cuarto técnico", level: "Sótano", area: 18.4, unit: "m²" },
      { id: "R-102", name: "Vestíbulo", level: "Planta baja", area: 18.6, unit: "m²" },
      { id: "R-103", name: "Sala de reuniones", level: "Planta baja", area: 32.4, unit: "m²" },
      { id: "R-201", name: "Oficina abierta", level: "Planta 1", area: 84.0, unit: "m²" },
      { id: "R-104", name: "Área de lavado", level: "Planta baja", area: 5.8, unit: "m²", equipment: ["Lavadora", "Lavadero"] },
      { id: "R-202", name: "Área de lavado", level: "Planta 1", area: 6.2, unit: "m²", equipment: ["Lavadora", "Secadora"] },
      { id: "R-203", name: "Área de lavado", level: "Planta 1", area: 6.5, unit: "m²", equipment: ["Lavadora", "Lavadero"] },
      { id: "R-301", name: "Oficina de proyectos", level: "Planta 2", area: 72.0, unit: "m²", capacity: "10 puestos" },
      { id: "R-302", name: "Sala de descanso", level: "Planta 2", area: 21.0, unit: "m²" },
      { id: "R-401", name: "Sala de formación", level: "Planta 3", area: 58.5, unit: "m²", capacity: "24 personas" },
      { id: "R-402", name: "Terraza técnica", level: "Planta 3", area: 24.0, unit: "m²" },
    ],
    sheets: [
      { id: "A-100", name: "Planta arquitectónica · Sótano", level: "Sótano", scale: "1:100" },
      { id: "A-101", name: "Planta arquitectónica · Planta baja", level: "Planta baja", scale: "1:100" },
      { id: "A-102", name: "Planta arquitectónica · Planta 1", level: "Planta 1", scale: "1:100" },
      { id: "A-103", name: "Planta arquitectónica · Planta 2", level: "Planta 2", scale: "1:100" },
      { id: "A-104", name: "Planta arquitectónica · Planta 3", level: "Planta 3", scale: "1:100" },
      { id: "A-105", name: "Planta de cubierta", level: "Cubierta", scale: "1:100" },
      { id: "A-201", name: "Alzado principal", level: "General", scale: "1:100" },
    ],
  },
  structure: {
    system: "Hormigón armado",
    elements: [
      { id: "C-301", type: "Columna", level: "Planta 1", section: "40 × 40 cm", height: 3.2 },
      { id: "B-302", type: "Viga", level: "Planta 1", section: "30 × 55 cm", length: 5.8 },
      { id: "S-303", type: "Losa", level: "Planta 1", thickness: 0.22, area: 42.0 },
      { id: "C-001", type: "Columna", level: "Sótano", section: "45 × 45 cm", height: 3.0 },
      { id: "SL-001", type: "Losa", level: "Sótano", thickness: 0.28, area: 228.4 },
      { id: "C-701", type: "Columna", level: "Planta 2", section: "40 × 40 cm", height: 3.1 },
      { id: "B-702", type: "Viga", level: "Planta 2", section: "30 × 55 cm", length: 6.2 },
      { id: "C-801", type: "Columna", level: "Planta 3", section: "40 × 40 cm", height: 3.1 },
      { id: "S-802", type: "Losa", level: "Planta 3", thickness: 0.22, area: 82.5 },
    ],
  },
  mep: {
    hvac: [
      { id: "DUCT-401", type: "Conducto de impulsión", level: "Planta 1", length: 12.6, system: "Climatización" },
      { id: "DUCT-703", type: "Conducto de impulsión", level: "Planta 2", length: 15.4, system: "Climatización" },
      { id: "DUCT-803", type: "Conducto de extracción", level: "Planta 3", length: 9.2, system: "Ventilación" },
    ],
    plumbing: [
      { id: "P-001", type: "Bomba de achique", level: "Sótano", quantity: 2, system: "Drenaje" },
      { id: "P-501", type: "Tubería de agua", level: "Cubierta", length: 6.8, system: "Fontanería" },
      { id: "P-502", type: "Lavadero", level: "Planta baja", quantity: 1, room: "R-104", system: "Fontanería" },
      { id: "P-503", type: "Toma de agua para lavadora", level: "Planta baja", quantity: 1, room: "R-104", system: "Fontanería" },
      { id: "P-504", type: "Lavadero", level: "Planta 1", quantity: 2, rooms: "R-202, R-203", system: "Fontanería" },
      { id: "P-505", type: "Toma de agua para lavadora", level: "Planta 1", quantity: 2, rooms: "R-202, R-203", system: "Fontanería" },
    ],
    electrical: [
      { id: "E-002", type: "Luminaria estanca LED", level: "Sótano", quantity: 10 },
      { id: "PANEL-003", type: "Subcuadro eléctrico", level: "Sótano", quantity: 1 },
      { id: "E-601", type: "Luminaria LED", level: "Planta 1", quantity: 8 },
      { id: "PANEL-602", type: "Cuadro eléctrico", level: "Planta baja", quantity: 1 },
      { id: "E-704", type: "Luminaria LED", level: "Planta 2", quantity: 12 },
      { id: "E-804", type: "Luminaria LED", level: "Planta 3", quantity: 10 },
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
    {
      id: "CL-03",
      elements: ["DUCT-703", "B-702"],
      level: "Planta 2",
      severity: "Alta",
      description: "El conducto HVAC cruza la viga B-702; revisar el paso o ajustar el trazado.",
    },
    {
      id: "CL-04",
      elements: ["DUCT-803", "C-801"],
      level: "Planta 3",
      severity: "Media",
      description: "El conducto de extracción queda próximo a la columna C-801.",
    },
  ],
};

export function fixtureForAgent(agent: AgentId): string {
  if (agent === "clashes") return JSON.stringify(bimFixture.clashes, null, 2);
  if (agent === "quantities") return JSON.stringify(bimFixture.elements, null, 2);
  if (agent === "architecture") {
    const elements = bimFixture.elements.filter((element) => ["Muro", "Puerta", "Ventana"].includes(element.type));
    const doors = elements.filter((element) => element.type === "Puerta");
    return JSON.stringify({ levels: bimFixture.levels, ...bimFixture.architecture, elements, doors }, null, 2);
  }
  if (agent === "structure") return JSON.stringify(bimFixture.structure, null, 2);
  if (agent === "mep") return JSON.stringify(bimFixture.mep, null, 2);
  return JSON.stringify(bimFixture, null, 2);
}
