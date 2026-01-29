import React from 'react';
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { CheckCircle, XCircle, Printer, Calculator, Star, Target, Info, Timer, CalendarDays, FileText, Award, Scale, GraduationCap } from 'lucide-react';
import { formatDaysToYMD, formatDateBR } from '../utils/calculoDatas';

interface Props {
  data: FormState;
  calc: CalculosFinais;
  regras: RegraResultado[];
}

const TableBox: React.FC<{ 
  title: string, 
  icon: React.ReactNode, 
  children: React.ReactNode, 
  className?: string 
}> = ({ title, icon, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="p-0">
      {children}
    </div>
  </div>
);

const MemRow: React.FC<{ 
  label: string, 
  days: number, 
  conv: string, 
  isPlus?: boolean, 
  isMinus?: boolean,
  isTotal?: boolean,
  highlightColor?: string 
}> = ({ label, days, conv, isPlus, isMinus, isTotal, highlightColor }) => {
  const prefix = isPlus ? "+" : isMinus ? "-" : "";
  const textColor = isMinus ? "text-rose-500" : isPlus ? "text-blue-500" : isTotal ? (highlightColor || "text-blue-800") : "text-slate-700";
  const bgColor = isTotal ? "bg-blue-50/50" : "";

  return (
    <div className={`grid grid-cols-12 gap-2 px-4 py-2 text-[10px] border-b border-slate-50 last:border-0 items-center ${bgColor}`}>
      <div className={`col-span-5 font-medium ${isTotal ? 'font-bold' : 'text-slate-500'}`}>{label}</div>
      <div className={`col-span-3 text-right font-mono font-bold ${textColor}`}>
        {prefix}{days.toLocaleString()}
      </div>
      <div className={`col-span-4 text-right font-semibold text-slate-400 leading-tight`}>
        {conv}
      </div>
    </div>
  );
};

// Fixed typo: removed '回' from 'regras'
const Results: React.FC<Props> = ({ data, calc, regras }) => {
  const algumaRegraCumprida = regras.some(r => r.cumpre);

  const handlePrint = () => {
    window.print();
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
    <div id="printable-report" className="space-y-6 animate-in fade-in duration-700">
      
      {/* Banner de Resultado Principal */}
      <div className={`p-5 rounded-xl border flex items-center justify-between ${algumaRegraCumprida ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${algumaRegraCumprida ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {algumaRegraCumprida ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {algumaRegraCumprida ? "Servidor Elegível" : "Ainda não Elegível"}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {algumaRegraCumprida 
                ? "Requisitos legais atendidos em pelo menos uma regra de aposentadoria." 
                : "Os requisitos cumulativos de idade, tempo e/ou pedágio ainda não foram atingidos."}
            </p>
          </div>
        </div>
        <div className="no-print">
          <button onClick={handlePrint} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-900 transition flex items-center gap-2 shadow-sm">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>

      {/* 1. Detalhamento da Memória de Cálculo */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-blue-900">Detalhamento da Memória de Cálculo</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Box 1: Apuração de Dias */}
          <TableBox title="1. Apuração de Dias (Fórmula Oficial)" icon={<Timer className="w-4 h-4" />}>
            <div className="grid grid-cols-12 px-4 py-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b">
              <div className="col-span-5">Variável</div>
              <div className="col-span-3 text-right">Cálculo (Dias)</div>
              <div className="col-span-4 text-right">Conversão</div>
            </div>
            <MemRow label="Idade Real" days={calc.idadeDias} conv={calc.idadeFormatada} />
            <MemRow label="Tempo PMMG (Bruto)" days={calc.tempoServicoPMMGDias} conv={formatDaysToYMD(calc.tempoServicoPMMGDias)} />
            <MemRow label="(+) Total Averbado" days={calc.totalTempoAverbado} conv={formatDaysToYMD(calc.totalTempoAverbado)} isPlus />
            <MemRow label="(+) Férias-Prêmio (Dobro)" days={calc.totalFeriasPremio} conv={formatDaysToYMD(calc.totalFeriasPremio)} isPlus highlightColor="text-amber-600" />
            <MemRow label="(-) Total Descontado" days={calc.totalTempoDescontado} conv={formatDaysToYMD(calc.totalTempoDescontado)} isMinus />
            <MemRow label="Contribuição Líquida" days={calc.tempoContribuicaoTotal} conv={formatDaysToYMD(calc.tempoContribuicaoTotal)} isTotal />
            
            {data.tipoServidor === 'PEBPM' ? (
              <div className="bg-amber-50 px-4 py-2 text-[10px] border-t border-amber-100 flex items-center justify-between">
                <span className="text-amber-800 font-bold uppercase flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Tempo Total de Regência</span>
                <span className="text-amber-900 font-black">{calc.tempoRegenciaTotalAnos} anos</span>
              </div>
            ) : (
              <div className="bg-slate-50 px-4 py-2 text-[10px] border-t border-slate-200 flex items-center justify-between italic">
                <span className="text-slate-400 font-bold uppercase">Tempo de Regência</span>
                <span className="text-slate-400">Não se aplica</span>
              </div>
            )}
          </TableBox>

          <div className="space-y-4">
            {/* Box 2: Cálculo de Pontos */}
            <TableBox title="2. Cálculo de Pontos" icon={<Star className="w-4 h-4" />}>
              <div className="grid grid-cols-12 px-4 py-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b">
                <div className="col-span-5">Variável</div>
                <div className="col-span-3 text-right">Cálculo (Dias)</div>
                <div className="col-span-4 text-right">Conversão</div>
              </div>
              <MemRow label="Idade" days={calc.idadeDias} conv={calc.idadeFormatada} />
              <MemRow label="Contribuição" days={calc.tempoContribuicaoTotal} conv={formatDaysToYMD(calc.tempoContribuicaoTotal)} />
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] items-center bg-amber-50/50">
                <div className="col-span-5 font-black text-amber-900 uppercase">Soma Total (Pontos)</div>
                <div className="col-span-3 text-right font-black text-amber-700 text-xs">
                  {calc.pontuacao} pts
                </div>
                <div className="col-span-4 text-right font-bold text-amber-600 text-[9px]">
                  {formatDaysToYMD(calc.idadeDias + calc.tempoContribuicaoTotal)}
                </div>
              </div>
            </TableBox>

            {/* Box 3: Cálculo do Pedágio */}
            <TableBox title="3. Cálculo do Pedágio (EC 104/2020)" icon={<Scale className="w-4 h-4" />}>
              <div className="grid grid-cols-12 px-4 py-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider border-b">
                <div className="col-span-5">Variável</div>
                <div className="col-span-3 text-right">Cálculo (Dias)</div>
                <div className="col-span-4 text-right">Conversão</div>
              </div>
              <MemRow label={`Meta (${Math.floor(calc.tempoMinimoExigidoDias / 365)} anos)`} days={calc.tempoMinimoExigidoDias} conv={`${Math.floor(calc.tempoMinimoExigidoDias / 365)} anos`} />
              <MemRow label="Tempo no Corte (2020)" days={calc.tempoEfetivo15092020} conv={formatDaysToYMD(calc.tempoEfetivo15092020)} />
              <MemRow label="Saldo no Corte" days={calc.saldoFaltanteCorte} conv={formatDaysToYMD(calc.saldoFaltanteCorte)} />
              <MemRow label="Cumprido Pós-Reforma" days={calc.diasCumpridosPosCorte} conv={formatDaysToYMD(calc.diasCumpridosPosCorte)} highlightColor="text-emerald-600" />
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] items-center bg-indigo-50/50">
                <div className="col-span-5 font-black text-indigo-900 uppercase">Pedágio Devido (50%)</div>
                <div className="col-span-3 text-right font-black text-indigo-700">
                  {calc.pedagioApurado.toLocaleString()}
                </div>
                <div className="col-span-4 text-right font-bold text-indigo-600">
                  {formatDaysToYMD(calc.pedagioApurado)}
                </div>
              </div>
            </TableBox>
          </div>
        </div>
      </section>

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
                <DataSummaryRow label="Tempo de Regência" value={data.tipoServidor === 'PEBPM' ? `${calc.tempoRegenciaTotalAnos} anos` : "Não se aplica"} highlight />
            </div>
            <div>
                <h4 className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-wider border-b border-slate-200 pb-1">Tempos Adicionais</h4>
                <DataSummaryRow label="Total Averbado (Dias)" value={`+ ${calc.totalTempoAverbado}`} highlight />
                <DataSummaryRow label="Férias-Prêmio (Dobro)" value={`+ ${calc.totalFeriasPremio}`} highlight />
                <DataSummaryRow label="Total Descontado (Dias)" value={`- ${calc.totalTempoDescontado}`} highlight />
            </div>
        </div>
      </section>

      {/* Detalhamento de Regras */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Target className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">Detalhamento por Regra</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regras.map((regra, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{regra.nome}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${regra.cumpre ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {regra.cumpre ? 'Satisfeito' : 'Incompleto'}
                </span>
              </div>
              <div className="p-3 flex-grow">
                <p className="text-[10px] text-slate-500 mb-3 leading-tight italic">{regra.descricao}</p>
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
        </div>
      </section>

      <div className="no-print border-t border-slate-100 pt-8 flex flex-col items-center gap-4 text-center">
        <p className="text-[10px] text-slate-400 max-w-md font-medium">Este relatório foi gerado eletronicamente e possui caráter informativo.</p>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition flex items-center gap-2 shadow-lg">
            <Printer className="w-4 h-4" /> Imprimir Relatório Oficial
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;