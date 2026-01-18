
import React from 'react';
import { FormState, CalculosFinais, RegraResultado, Requisito } from '../types';
import { CheckCircle, XCircle, Printer, Calculator, Star, Target, Info, Timer, CalendarDays, FileText } from 'lucide-react';
import { formatDaysToYMD, formatDateBR, parseISO } from '../utils/calculoDatas';

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

  const ResultRow = ({ label, days, formatted, colorClass = "text-slate-700" }: { label: string, days: number | string, formatted: string, colorClass?: string }) => (
    <div className="w-full grid grid-cols-12 gap-1 items-center px-1 py-1 border-b border-slate-50 last:border-0">
      <div className="col-span-3 text-[8px] text-slate-400 uppercase font-black truncate">{label}</div>
      <div className="col-span-4 text-right text-[9px] font-mono font-bold text-slate-500">{typeof days === 'number' ? days.toLocaleString() : days} d</div>
      <div className={`col-span-5 text-right text-[9px] font-bold ${colorClass}`}>{formatted}</div>
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
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Perfil e Datas</h4>
                <DataSummaryRow label="Tipo de Servidor" value={data.tipoServidor} />
                <DataSummaryRow label="Sexo" value={data.sexo} />
                <DataSummaryRow label="Data Nascimento" value={formatDateStr(data.dataNascimento)} />
                <DataSummaryRow label="Data Inclusão" value={formatDateStr(data.dataInclusaoPMMG)} />
                <DataSummaryRow label="Data Simulação" value={formatDateStr(data.dataSimulacao)} highlight />
            </div>
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Marcos de Carreira</h4>
                <DataSummaryRow label="Ingresso até 2003" value={data.ingressouAte2003 ? "Sim" : "Não"} />
                <DataSummaryRow label="Ingresso 2004-2020" value={data.ingressouEntre2003e2020 ? "Sim" : "Não"} />
                <DataSummaryRow label="10 Anos Svc. Público" value={data.dezAnosServicoPublico ? "Sim" : "Não"} />
                <DataSummaryRow label="5 Anos Cargo Efetivo" value={data.cincoAnosCargoEfetivo ? "Sim" : "Não"} />
                {data.tipoServidor === 'PEBPM' && <DataSummaryRow label="Tempo de Regência" value={`${data.tempoRegencia} anos`} highlight />}
            </div>
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Tempos Adicionais</h4>
                <DataSummaryRow label="Registros Averbados" value={data.averbacoes.length} />
                <DataSummaryRow label="Total Averbado (Dias)" value={`+ ${calc.totalTempoAverbado}`} highlight />
                <DataSummaryRow label="Ant. 15/09/2020" value={`${calc.totalAverbadoAnterior} d`} />
                <div className="h-2"></div>
                <DataSummaryRow label="Registros Descontos" value={data.descontos.length} />
                <DataSummaryRow label="Total Descontado (Dias)" value={`- ${calc.totalTempoDescontado}`} highlight />
                <DataSummaryRow label="Ant. 15/09/2020" value={`${calc.totalDescontadoAnterior} d`} />
            </div>
        </div>
      </section>

      {/* Grid de Cards de Resumo Padronizados com 3 Áreas: Label | Dias | Conversão */}
      <div className="rounded-xl border border-blue-200 shadow-sm bg-white overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blue-100">
        <SummaryCard title="Tempos Básicos" icon={<Calculator className="w-3 h-3 text-slate-400" />}>
          <div className="w-full flex flex-col justify-center gap-1">
            <ResultRow label="Idade" days={calc.idadeDias} formatted={calc.idadeFormatada} />
            <ResultRow label="Contrib." days={calc.tempoContribuicaoTotal} formatted={formatDaysToYMD(calc.tempoContribuicaoTotal)} />
          </div>
        </SummaryCard>
        
        <SummaryCard title="Pontuação" icon={<Star className="w-3 h-3 text-amber-500" />} bgColor="bg-slate-50/50">
          <div className="w-full flex flex-col justify-center items-center px-1">
            <div className="w-full mb-2">
               <ResultRow label="Soma" days={calc.idadeDias + calc.tempoContribuicaoTotal} formatted={`${calc.pontuacao} pts`} colorClass="text-amber-600 font-black" />
            </div>
            <div className="w-full bg-white rounded-lg py-1 px-1 text-[8px] text-center text-slate-500 font-bold uppercase border border-slate-200 shadow-inner">
              Faltam {365 - calc.pontuacaoSaldoDias} d para o próximo ponto
            </div>
          </div>
        </SummaryCard>
        
        <SummaryCard title="Pedágio (50%)" icon={<Timer className="w-3 h-3 text-indigo-500" />}>
          <div className="w-full flex flex-col justify-center gap-1">
            <ResultRow label="Devido" days={calc.pedagioApurado} formatted={formatDaysToYMD(calc.pedagioApurado)} colorClass="text-indigo-600" />
            <ResultRow label="Cumprido" days={calc.diasCumpridosPosCorte} formatted={formatDaysToYMD(calc.diasCumpridosPosCorte)} colorClass="text-emerald-600" />
          </div>
        </SummaryCard>
      </div>

      {/* Memória de Cálculo Resumida */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-3"><Info className="w-3 h-3 text-blue-500" /> Memória Resumida</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
             <div className="flex justify-between"><span>Corte (Efet.):</span> <span>{calc.tempoEfetivo15092020}</span></div>
             <div className="flex justify-between"><span>Meta:</span> <span>{calc.tempoMinimoExigidoDias}</span></div>
             <div className="flex justify-between text-blue-600 font-bold border-t border-slate-200 pt-1"><span>Devido:</span> <span>{calc.pedagioApurado}</span></div>
          </MemorySection>
        </div>
      </section>

      {/* Detalhamento de Regras */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 flex items-center gap-2"><Target className="w-3 h-3" /> Detalhamento por Regra</h3>
        {regras.map((regra, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800">{regra.nome}</h4>
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
