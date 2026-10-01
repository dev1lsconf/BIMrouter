import test from "node:test";
import assert from "node:assert/strict";
import { bimFixture, fixtureForAgent } from "../src/lib/bim-fixture.ts";

test("el fixture arquitectónico publica las tres áreas de lavado simuladas", () => {
  const areas = bimFixture.architecture.spaces.filter((space) => space.name === "Área de lavado");

  assert.deepEqual(
    areas.map(({ id, level, area }) => ({ id, level, area })),
    [
      { id: "R-104", level: "Planta baja", area: 5.8 },
      { id: "R-202", level: "Planta 1", area: 6.2 },
      { id: "R-203", level: "Planta 1", area: 6.5 },
    ],
  );
});

test("el agente de arquitectura recibe las áreas y sus equipos", () => {
  const fixture = JSON.parse(fixtureForAgent("architecture"));
  const areas = fixture.spaces.filter((space) => space.name === "Área de lavado");

  assert.equal(areas.length, 3);
  assert.deepEqual(areas[0].equipment, ["Lavadora", "Lavadero"]);
  assert.deepEqual(areas[1].equipment, ["Lavadora", "Secadora"]);
});

test("el agente de arquitectura recibe elementos y puertas de Planta 3", () => {
  const fixture = JSON.parse(fixtureForAgent("architecture"));
  const door = fixture.doors.find((element) => element.id === "D-401");

  assert.deepEqual(
    { level: door.level, room: door.room, width: door.width, height: door.height },
    { level: "Planta 3", room: "R-401", width: 0.9, height: 2.1 },
  );
  assert.ok(fixture.elements.some((element) => element.id === "W-101" && element.type === "Muro"));
  assert.ok(fixture.elements.some((element) => element.id === "D-401" && element.type === "Puerta"));
  assert.ok(fixture.elements.some((element) => element.id === "WIN-202" && element.type === "Ventana"));
});

test("el agente MEP recibe lavaderos y tomas de agua asociados a sus espacios", () => {
  const fixture = JSON.parse(fixtureForAgent("mep"));
  const laundryFixtures = fixture.plumbing.filter((item) => item.room || item.rooms);

  assert.equal(laundryFixtures.length, 4);
  assert.ok(laundryFixtures.some((item) => item.type === "Lavadero" && item.room === "R-104"));
  assert.ok(laundryFixtures.some((item) => item.type === "Toma de agua para lavadora" && item.rooms === "R-202, R-203"));
});

test("el agente general conserva el contexto del proyecto y el fixture arquitectónico", () => {
  const fixture = JSON.parse(fixtureForAgent("model"));

  assert.equal(fixture.project, "Edificio Demo");
  assert.ok(fixture.elements.some((element) => element.id === "R-104" && element.type === "Espacio"));
  assert.ok(fixture.architecture.sheets.some((sheet) => sheet.id === "A-101"));
});
