import type { AgentId } from "@/lib/domain";

export const bimFixture = {
  project: "Edificio Demo",
  units: "m",
  levels: ["Planta baja", "Planta 1", "Cubierta"],
  elements: [
    { id: "W-101", type: "Muro", level: "Planta baja", length: 8.4, area: 25.2 },
    { id: "D-201", type: "Puerta", level: "Planta baja", width: 0.9, height: 2.1 },
    { id: "C-301", type: "Columna", level: "Planta 1", width: 0.4, height: 3.2 },
    { id: "DUCT-401", type: "Conducto HVAC", level: "Planta 1", length: 12.6 },
    { id: "P-501", type: "Tubería", level: "Cubierta", length: 6.8 },
  ],
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
  return JSON.stringify(bimFixture, null, 2);
}
