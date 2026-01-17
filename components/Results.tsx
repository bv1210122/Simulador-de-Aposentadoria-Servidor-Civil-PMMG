
import React from 'react';
import { FormState, CalculosFinais, RegraResultado, Requisito } from '../types';
import { CheckCircle, XCircle, Printer, Calculator, Star, Target, Info, Timer, CalendarDays, FileText } from 'lucide-react';
import { formatDaysToYMD, formatDateBR, parseISO } from '../utils/dateHelpers';

interface Props {
  data: FormState;
  calc: CalculosFinais;
  regras: RegraResultado[];
}

const SummaryCard: React.FC<{ 
  title: string, 
  icon: React.ReactNode, 
  children: React.ReactNode, 
  bgColor?: string 
}> = ({ title, icon, children, bgColor = "bg-white" }) => (
  <div className={`p-3 flex flex-col items-center ${bgColor}`}>
    <h3 className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 self-start uppercase tracking-wider mb-2 w-full border-b border-slate-100 pb-1">
      {icon} {title}
    </h3>
    <div className="w-full flex-1 flex flex-col justify-center items-center">
      {children}
    </div>
  </div>
);

const MemorySection: React.FC<{ title: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-1 text-[10px] font-mono bg-slate-50 p-3 rounded-md border border-slate-100">
    <h4 className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider flex items-center gap-1">
      {icon} {title}
    </h4>
    {children}
  </div>
);

const Results: React.FC<Props> = ({ data, calc, regras }) => {
  const algumaRegraCumprida = regras.some(r => r.cumpre);

  const handlePrint = () => {
    const reportContent = document.getElementById('printable-report')?.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório PMMG</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 1cm; } 
            body { font-family: sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body class="p-8">${reportContent}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const DataSummaryRow = ({ label, value, highlight = false }: { label: string, value: React.ReactNode, highlight?: boolean }) => (
    <div className={`flex justify-between items-center text-[10px] border-b border-slate-100 last:border-0 py-1.5 ${highlight ? 'font-bold bg-slate-50/50' : ''}`}>
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`text-right ${highlight ? 'text-blue-700' : 'text-slate-700 font-semibold'}`}>{value}</span>
    </div>
  );

  return (
    <div id="printable-report" className="space-y-4 animate-in fade-in duration-700">
      
      {/* Banner de Resultado Principal */}
      <div className={`p-4 rounded-xl border ${algumaRegraCumprida ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex items-center gap-3">
          {algumaRegraCumprida ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {algumaRegraCumprida ? "Servidor Elegível" : "Ainda não Elegível"}
            </h2>
            <p className="text-xs text-slate-600 leading-tight">
              {algumaRegraCumprida 
                ? "Requisitos legais atendidos em pelo menos uma regra." 
                : "Requisitos cumulativos não atingidos."}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo dos Dados Informados */}
      <section className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3 text-blue-600" /> Resumo dos Dados Informados
            </h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Col 1: Pessoal */}
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Perfil e Datas</h4>
                <DataSummaryRow label="Tipo de Servidor" value={data.tipoServidor} />
                <DataSummaryRow label="Sexo" value={data.sexo} />
                <DataSummaryRow label="Data Nascimento" value={formatDateStr(data.dataNascimento)} />
                <DataSummaryRow label="Data Inclusão" value={formatDateStr(data.dataInclusaoPMMG)} />
                <DataSummaryRow label="Data Simulação" value={formatDateStr(data.dataSimulacao)} highlight />
            </div>

            {/* Col 2: Carreira */}
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Marcos de Carreira</h4>
                <DataSummaryRow label="Ingresso até 2003" value={data.ingressouAte2003 ? "Sim" : "Não"} />
                <DataSummaryRow label="Ingresso 2004-2020" value={data.ingressouEntre2003e2020 ? "Sim" : "Não"} />
                <DataSummaryRow label="10 Anos Svc. Público" value={data.dezAnosServicoPublico ? "Sim" : "Não"} />
                <DataSummaryRow label="5 Anos Cargo Efetivo" value={data.cincoAnosCargoEfetivo ? "Sim" : "Não"} />
                {data.tipoServidor === 'PEBPM' && (
                    <DataSummaryRow label="Tempo de Regência" value={`${data.tempoRegencia} anos`} highlight />
                )}
            </div>

            {/* Col 3: Ajustes */}
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Tempos Adicionais</h4>
                <DataSummaryRow label="Registros Averbados" value={data.averbacoes.length} />
                <DataSummaryRow label="Total Averbado (Dias)" value={`+ ${calc.totalTempoAverbado}`} highlight />
                <div className="h-2"></div>
                <DataSummaryRow label="Registros Descontos" value={data.descontos.length} />
                <DataSummaryRow label="Total Descontado (Dias)" value={`- ${calc.totalTempoDescontado}`} highlight />
            </div>
        </div>
      </section>

      {/* Grid de Cards de Resumo - Compacto e Lado a Lado */}
      <div className="rounded-xl border border-blue-200 shadow-sm bg-white overflow-hidden grid grid-cols-3 divide-x divide-blue-100">
        
        {/* Tempos Apurados */}
        <SummaryCard title="Tempos" icon={<Calculator className="w-3 h-3 text-slate-400" />}>
          <div className="w-full space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Idade</span>
              <div className="text-right leading-none">
                <div className="text-xs font-bold text-slate-700">{calc.idadeFormatada}</div>
                <div className="text-[9px] text-slate-400">({calc.idadeDias.toLocaleString()} dias)</div>
              </div>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Contrib.</span>
              <div className="text-right leading-none">
                <div className="text-xs font-bold text-slate-700">{formatDaysToYMD(calc.tempoContribuicaoTotal)}</div>
                <div className="text-[9px] text-slate-400">({calc.tempoContribuicaoTotal.toLocaleString()} dias)</div>
              </div>
            </div>
          </div>
        </SummaryCard>

        {/* Pontuação */}
        <SummaryCard title="Pontos" icon={<Star className="w-3 h-3 text-amber-500" />} bgColor="bg-slate-50/50">
          <div className="text-center">
            <span className="text-3xl font-black text-slate-700 tracking-tighter leading-none">{calc.pontuacao}</span>
            <div className="mt-1.5 w-full bg-white rounded-lg py-1 px-1 text-[9px] text-center text-slate-500 font-bold uppercase tracking-tight border border-slate-200">
              Faltam {365 - calc.pontuacaoSaldoDias} dias
            </div>
          </div>
        </SummaryCard>

        {/* Pedágio */}
        <SummaryCard title="Pedágio (50%)" icon={<Timer className="w-3 h-3 text-indigo-500" />}>
          <div className="text-center">
            <span className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">
              {calc.pedagioApurado.toLocaleString()}
            </span>
            <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wide">Dias</p>
            <div className="mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
              {formatDaysToYMD(calc.pedagioApurado)}
            </div>
          </div>
        </SummaryCard>
      </div>

      {/* Memória de Cálculo */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3">
          <Info className="w-3 h-3 text-blue-500" /> Memória Resumida
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <MemorySection title="Contribuição" icon={<CalendarDays className="w-3 h-3" />}>
             <div className="flex justify-between"><span>PMMG:</span> <span className="font-bold">{calc.tempoEfetivoCivilPMMG}</span></div>
             <div className="flex justify-between text-blue-600"><span>Averba:</span> <span>+{calc.totalTempoAverbado}</span></div>
             <div className="flex justify-between text-rose-500"><span>Desc:</span> <span>-{calc.totalTempoDescontado}</span></div>
             <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-800"><span>Líq:</span> <span>{calc.tempoContribuicaoTotal}</span></div>
          </MemorySection>

          <MemorySection title="Pontuação">
             <div className="flex justify-between"><span>Idade:</span> <span>{calc.idadeDias}</span></div>
             <div className="flex justify-between"><span>Tempo:</span> <span>{calc.tempoContribuicaoTotal}</span></div>
             <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-indigo-600"><span>Total:</span> <span>{calc.pontuacao}</span></div>
          </MemorySection>

          <MemorySection title="Pedágio">
             <div className="flex justify-between"><span>Corte:</span> <span>{calc.tempoEfetivo15092020}</span></div>
             <div className="flex justify-between"><span>Meta:</span> <span>{calc.tempoMinimoExigidoDias}</span></div>
             <div className="flex justify-between text-blue-600 font-bold border-t border-slate-200 pt-1"><span>Devido:</span> <span>{calc.pedagioApurado}</span></div>
          </MemorySection>
        </div>
      </section>

      {/* Detalhamento de Regras */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2">
          <Target className="w-3 h-3" /> Detalhamento por Regra
        </h3>
        {regras.map((regra, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-800">{regra.nome}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${regra.cumpre ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {regra.cumpre ? 'Satisfeito' : 'Incompleto'}
              </span>
            </div>
            <div className="p-3 overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead className="text-slate-400 uppercase text-[8px] border-b">
                  <tr>
                    <th className="text-left pb-1">Requisito</th>
                    <th className="text-center pb-1">Exigido</th>
                    <th className="text-center pb-1">Apurado</th>
                    <th className="text-right pb-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {regra.requisitos.map((req, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-1.5 text-slate-600">{req.label}</td>
                      <td className="py-1.5 text-center font-bold text-slate-800">{req.esperado}</td>
                      <td className={`py-1.5 text-center font-bold ${req.cumpre ? 'text-emerald-600' : 'text-rose-500'}`}>{req.atual}</td>
                      <td className="py-1.5 text-right">{req.cumpre ? <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" /> : <XCircle className="w-3 h-3 text-rose-300 ml-auto" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <div className="no-print flex justify-center pt-4">
        <button onClick={handlePrint} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-slate-900 transition flex items-center gap-2 shadow-lg">
          <Printer className="w-3 h-3" /> Imprimir Relatório Oficial
        </button>
      </div>
    </div>
  );
};

export default Results;
