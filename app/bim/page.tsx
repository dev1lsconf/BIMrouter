import { AppFrame } from "@/components/app-frame";
import { BimDataPanel } from "@/components/bim-data-panel";

export default function BimPage() {
  return <AppFrame activePage="bim">
    <div className="content">
      <div className="page-heading"><div><div className="eyebrow">PROYECTO <span>/</span> FIXTURE LOCAL</div><h1>Datos BIM</h1><p>Modelo de demostración simulado que consultan los seis agentes especializados.</p></div><span className="fixture-badge">SIMULADO</span></div>
      <BimDataPanel />
      <footer className="page-footer"><span>JEV BIM ROUTER <b>·</b> Datos BIM</span><span>Fixture local de demostración</span></footer>
    </div>
  </AppFrame>;
}
