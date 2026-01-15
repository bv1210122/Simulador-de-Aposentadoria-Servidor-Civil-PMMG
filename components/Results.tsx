
import React from 'react';
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { CheckCircle, XCircle, Printer, Calculator, Star, Target, Info, Timer } from 'lucide-react';
import { formatDaysToYMD, formatDateBR, parseISO } from '../utils/dateHelpers';

interface Props {
  data: FormState;
  calc: CalculosFinais;
  regras: RegraResultado[];
}

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

  const diasParaProximoPonto = 365 - calc.pontuacaoSaldoDias;
  const baseCalculoPontos = calc.idadeDias + calc.tempoContribuicaoTotal;
  const pedagioTotalDias = calc.saldoFaltanteCorte;

  return (
    <div id="printable-report" className="space-y-6 animate-in fade-in duration-700">
      
      {/* Banner de Resultado */}
      <div className={`p-6 rounded-2xl border-2 ${algumaRegraCumprida ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex items-start gap-4">
          {algumaRegraCumprida ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <XCircle className="w-8 h-8 text-rose-500" />}
          <div>
            <h2 className="text-lg font-bold text-slate-800">Análise de Elegibilidade</h2>
            <p className="text-sm text-slate-600">
              {algumaRegraCumprida 
                ? "O servidor atende aos requisitos legais para aposentadoria em pelo menos uma regra." 
                : "Os requisitos cumulativos para aposentadoria ainda não foram atingidos nesta data."}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Dados do Servidor (Separada acima dos cards) */}
      <div className="bg-slate-50 border border-blue-100 rounded-xl px-6 py-4 flex flex-wrap gap-x-12 gap-y-3 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servidor</span>
          <span className="text-xs font-black text-slate-700 uppercase">{data.tipoServidor || 'N/A'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sexo</span>
          <span className="text-xs font-black text-slate-700 uppercase">{data.sexo || 'N/A'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusão PMMG</span>
          <span className="text-xs font-black text-slate-700">{data.dataInclusaoPMMG ? formatDateBR(parseISO(data.dataInclusaoPMMG)) : 'N/A'}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regime de Ingresso</span>
          <span className="text-xs font-black text-slate-700 uppercase">
            {data.ingressouAte2003 ? "Até 31/12/2003" : data.ingressouEntre2003e2020 ? "Transição (Pós-2003)" : "Novo Regime"}
          </span>
        </div>
      </div>

      {/* Container de Cards de Resumo */}
      <div className="rounded-2xl border-2 border-blue-400 shadow-md bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-blue-200">
          
          {/* Card 1: Tempos Apurados */}
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <Calculator className="w-5 h-5 text-slate-400" /> Tempos Apurados
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                <span className="text-xs font-medium text-slate-500">Idade:</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800">{calc.idadeFormatada}</span>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">({calc.idadeDias.toLocaleString()} dias)</div>
                </div>
              </div>
              <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                <span className="text-xs font-medium text-slate-500">Contribuição Total:</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800">{formatDaysToYMD(calc.tempoContribuicaoTotal)}</span>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">({calc.tempoContribuicaoTotal.toLocaleString()} dias)</div>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-blue-600 font-bold uppercase">Averbações:</span>
                <span className="text-sm font-black text-blue-600">+{calc.totalTempoAverbado.toLocaleString()} dias</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-rose-500 font-bold uppercase">Descontos:</span>
                <span className="text-sm font-black text-rose-500">-{calc.totalTempoDescontado.toLocaleString()} dias</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pontuação Atual */}
          <div className="p-6 flex flex-col items-center bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 self-start uppercase tracking-tight">
              <Star className="w-5 h-5 text-amber-500" /> Pontuação Atual
            </h3>
            
            <div className="flex-grow flex flex-col justify-center items-center py-4">
              <span className="text-7xl font-black text-slate-800 tracking-tighter leading-none">{calc.pontuacao}</span>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Pontos Totais</p>
            </div>

            <div className="w-full">
               <div className="bg-white rounded-xl py-3 px-4 text-[10px] text-center text-slate-600 font-black uppercase tracking-wider border border-slate-200 shadow-sm">
                  Saldo de {diasParaProximoPonto} dias para o próximo ponto
               </div>
            </div>
          </div>

          {/* Card 3: Pedágio Devido (Novo) */}
          <div className="p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 self-start uppercase tracking-tight">
              <Timer className="w-5 h-5 text-indigo-500" /> Pedágio (100%)
            </h3>
            
            <div className="flex-grow flex flex-col justify-center items-center py-4">
              <span className="text-5xl font-black text-indigo-600 tracking-tighter leading-none">
                {pedagioTotalDias.toLocaleString()}
              </span>
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-3">Dias Devidos</p>
              
              <div className="mt-4 px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <span className="text-xs font-bold text-indigo-700">
                  {formatDaysToYMD(pedagioTotalDias)}
                </span>
              </div>
            </div>

            <div className="w-full">
               <div className="bg-slate-100 rounded-xl py-3 px-4 text-[9px] text-center text-slate-500 font-bold uppercase leading-tight">
                  Baseado no saldo faltante verificado em 15/09/2020
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* Memória de Cálculo Detalhada */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-blue-500" /> Memória de Cálculo Detalhada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Cálculo Contribuição</h4>
            <div className="flex justify-between">
              <span>Tempo Efetivo (PMMG):</span>
              <span className="font-bold">{calc.tempoEfetivoCivilPMMG.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>(+) Averbações:</span>
              <span>{calc.totalTempoAverbado.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>(-) Descontos:</span>
              <span>{calc.totalTempoDescontado.toLocaleString()} dias</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between text-xs font-bold text-slate-800">
              <span>Tempo Líquido:</span>
              <span>{calc.tempoContribuicaoTotal.toLocaleString()} dias</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Cálculo Pontuação</h4>
            <div className="flex justify-between">
              <span>Idade em dias:</span>
              <span className="font-bold">{calc.idadeDias.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-indigo-600">
              <span>(+) Tempo Contrib.:</span>
              <span>{calc.tempoContribuicaoTotal.toLocaleString()} dias</span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between">
              <span>(=) Base Pontos:</span>
              <span className="font-bold">{baseCalculoPontos.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Base / 365:</span>
              <span>{calc.pontuacao} pts + {calc.pontuacaoSaldoDias} d</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Cálculo Pedágio (100%)</h4>
            <div className="flex justify-between">
              <span>Meta (Tempo Mínimo):</span>
              <span className="font-bold">{calc.tempoMinimoExigidoDias.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>(-) Tempo em 15/09/20:</span>
              <span>{calc.tempoEfetivo15092020.toLocaleString()} dias</span>
            </div>
            <div className="border-t border-slate-300 pt-1 flex justify-between">
              <span>(=) Saldo no Corte:</span>
              <span className="font-bold">{calc.saldoFaltanteCorte.toLocaleString()} dias</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>(+) Pedágio (100%):</span>
              <span className="font-bold">{calc.saldoFaltanteCorte.toLocaleString()} dias</span>
            </div>
            <div className="border-t border-slate-300 pt-1 flex justify-between text-xs font-bold text-slate-800">
              <span>Total a Cumprir:</span>
              <span>{calc.tempoACumprir.toLocaleString()} dias</span>
            </div>
          </div>

        </div>
      </section>

      {/* Regras Detalhadas */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
          <Target className="w-4 h-4" /> Detalhamento por Regra
        </h3>
        {regras.map((regra, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800">{regra.nome}</h4>
                <p className="text-[10px] text-slate-500 italic">{regra.descricao}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${regra.cumpre ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {regra.cumpre ? 'Satisfeito' : 'Incompleto'}
              </span>
            </div>
            <div className="p-4">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-slate-400 uppercase text-[9px] border-b">
                    <th className="text-left pb-2">Requisito</th>
                    <th className="text-center pb-2">Exigido</th>
                    <th className="text-center pb-2">Apurado</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {regra.requisitos.map((req, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-2 text-slate-600">{req.label}</td>
                      <td className="py-2 text-center font-bold text-slate-800">{req.esperado}</td>
                      <td className={`py-2 text-center font-bold ${req.cumpre ? 'text-emerald-600' : 'text-rose-500'}`}>{req.atual}</td>
                      <td className="py-2 text-right">{req.cumpre ? <CheckCircle className="w-3 h-3 text-emerald-400 ml-auto" /> : <XCircle className="w-3 h-3 text-rose-300 ml-auto" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {/* Mensagem Compulsória */}
      <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
        <h4 className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">Aviso de Aposentadoria Compulsória</h4>
        <p className="text-[11px] leading-relaxed text-amber-700">
          O servidor completará 75 anos de idade na data de <strong>{calc.data75Anos}</strong>. Após essa idade o servidor é obrigado a se afastar, independentemente de ter cumprido os demais requisitos previstos em lei para aposentar-se. A unidade deverá considerar a data de aniversário dos 75 anos, como data do final do efetivo exercício, sendo a vigência no dia imediatamente seguinte ao aniversário.
        </p>
      </div>

      <div className="no-print flex justify-center py-4">
        <button onClick={handlePrint} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition flex items-center gap-2 shadow-lg">
          <Printer className="w-4 h-4" /> Imprimir Relatório Oficial
        </button>
      </div>
    </div>
  );
};

export default Results;
