import type { ReactNode } from "react";
import { bimFixture } from "@/lib/bim-fixture";

export function BimDataPanel() {
  return <section className="panel bim-panel" id="bim-panel">
    <div className="panel-header"><div><h2>BIM · Datos simulados</h2><p>Fixture local completo usado por los seis agentes</p></div><span className="fixture-badge">LOCAL</span></div>
    <div className="bim-data-content">
      <div className="bim-summary">
        <div><span>PROYECTO</span><strong>{bimFixture.project}</strong></div>
        <div><span>UNIDAD BASE</span><strong>{bimFixture.units}</strong></div>
        <div><span>NIVELES</span><strong>{bimFixture.levels.join(" · ")}</strong></div>
      </div>

      <BimDataGroup title={`Elementos del modelo · ${bimFixture.elements.length}`}>
        <BimTable headers={["ID", "Tipo", "Nivel", "Propiedades"]}>
          {bimFixture.elements.map((element) => <tr key={element.id}><td>{element.id}</td><td>{element.type}</td><td>{element.level}</td><td>{formatFields(element, ["id", "type", "level"])}</td></tr>)}
        </BimTable>
      </BimDataGroup>

      <div className="bim-data-columns">
        <BimDataGroup title={`Planos · ${bimFixture.architecture.sheets.length}`}>
          <BimTable headers={["ID", "Plano", "Nivel", "Escala"]}>
            {bimFixture.architecture.sheets.map((sheet) => <tr key={sheet.id}><td>{sheet.id}</td><td>{sheet.name}</td><td>{sheet.level}</td><td>{sheet.scale}</td></tr>)}
          </BimTable>
        </BimDataGroup>
        <BimDataGroup title={`Espacios · ${bimFixture.architecture.spaces.length}`}>
          <BimTable headers={["ID", "Espacio", "Nivel", "Área"]}>
            {bimFixture.architecture.spaces.map((space) => <tr key={space.id}><td>{space.id}</td><td>{space.name}</td><td>{space.level}</td><td>{space.area} {space.unit}</td></tr>)}
          </BimTable>
        </BimDataGroup>
      </div>

      <BimDataGroup title={`Estructura · ${bimFixture.structure.system}`}>
        <BimTable headers={["ID", "Elemento", "Nivel", "Propiedades"]}>
          {bimFixture.structure.elements.map((element) => <tr key={element.id}><td>{element.id}</td><td>{element.type}</td><td>{element.level}</td><td>{formatFields(element, ["id", "type", "level"])}</td></tr>)}
        </BimTable>
      </BimDataGroup>

      <BimDataGroup title="Instalaciones MEP">
        <div className="mep-groups">{Object.entries(bimFixture.mep).map(([system, elements]) => <div className="mep-group" key={system}><strong>{system === "hvac" ? "Climatización" : system === "plumbing" ? "Fontanería" : "Electricidad"}</strong>{elements.map((element) => <div className="mep-element" key={element.id}><b>{element.id} · {element.type}</b><span>{element.level} · {formatFields(element, ["id", "type", "level"])}</span></div>)}</div>)}</div>
      </BimDataGroup>

      <BimDataGroup title={`Interferencias · ${bimFixture.clashes.length}`}>
        <BimTable headers={["ID", "Nivel", "Severidad", "Elementos", "Descripción"]}>
          {bimFixture.clashes.map((clash) => <tr key={clash.id}><td>{clash.id}</td><td>{clash.level}</td><td>{clash.severity}</td><td>{clash.elements.join(" · ")}</td><td>{clash.description}</td></tr>)}
        </BimTable>
      </BimDataGroup>
      <p className="fixture-footnote">Datos ficticios de demostración; no representan un modelo BIM real.</p>
    </div>
  </section>;
}
function BimDataGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bim-data-group"><h3>{title}</h3>{children}</section>;
}

function BimTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="bim-table-wrap"><table className="bim-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function formatFields(value: object, omitted: string[]) {
  const labels: Record<string, string> = {
    area: "Área (m²)", height: "Alto (m)", length: "Longitud (m)", quantity: "Unidades", thickness: "Espesor (m)",
    width: "Ancho (m)", section: "Sección", system: "Sistema",
  };
  return Object.entries(value).filter(([key]) => !omitted.includes(key)).map(([key, field]) => `${labels[key] ?? key}: ${String(field)}`).join(" · ");
}
