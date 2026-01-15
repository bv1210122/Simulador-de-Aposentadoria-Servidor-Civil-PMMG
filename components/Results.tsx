
import React from 'react';
import { FormState, CalculosFinais, RegraResultado } from '../types';
import { CheckCircle, XCircle, Printer, FileText, Info, Award, ClipboardList, Target, Calculator, Clock, Star } from 'lucide-react';
import { formatDaysToYMD } from '../utils/dateHelpers';

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
    
    if (!printWindow) {
      alert("Por favor, permita pop-ups para gerar o PDF.");
      return;
    }

    const tailwindScript = `<script src="https://cdn.tailwindcss.com"></script>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Aposentadoria - PMMG</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
          ${tailwindScript}
          <style>
            @page { 
              size: A4; 
              margin: 1.5cm; 
            }
            body { 
              background: white !important; 
              font-family: 'Inter', sans-serif; 
              color: #334155;
              font-size: 10.5pt;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            h1, h2, h3, h4 { color: #1e293b; page-break-after: avoid; }
            table { width: 100%; border-collapse: collapse; font-size: 9pt; }
            tr { page-break-inside: avoid; }
            .card { 
              page-break-inside: avoid; 
              border: 1px solid #f1f5f9; 
              border-radius: 12px;
              margin-bottom: 12px;
            }
            /* Suavização de cores para impressão */
            .bg-emerald-50 { background-color: #f0fdf4 !important; }
            .bg-rose-50 { background-color: #fff1f2 !important; }
            .bg-amber-50 { background-color: #fffbeb !important; }
            .bg-indigo-50 { background-color: #eef2ff !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .text-white { color: #1e293b !important; } /* Inverte cor em blocos que eram escuros */
            .border-gray-700 { border-color: #e2e8f0 !important; }
          </style>
        </head>
        <body>
          <div class="max-w-4xl mx-auto p-4">
            <header class="mb-6 border-b border-slate-200 pb-4 flex items-center gap-4">
              <div class="bg-slate-100 text-slate-700 p-2 rounded-lg w-12 h-12 flex items-center justify-center font-bold text-xl border border-slate-200">PM</div>
              <div>
                <h1 class="text-xl font-black text-slate-800 leading-none uppercase tracking-tight">Polícia Militar de Minas Gerais</h1>
                <p class="text-[9px] text-slate-400 uppercase font-bold tracking-[0.1em] mt-1">Diretoria de Recursos Humanos • Simulação Informativa</p>
              </div>
            </header>
            <div id="print-body">
              ${reportContent}
            </div>
            <footer class="mt-8 pt-4 border-t border-slate-100 text-center">
              <p class="text-[8px] text-slate-400 leading-tight">
                Simulação gerada em ${new Date().toLocaleString('pt-BR')}. Documento de caráter informativo.<br/>
                Os cálculos utilizam parâmetros da Emenda Constitucional Estadual nº 104/2020.
              </p>
            </footer>
          </div>
          <script>
            window.onload = () => {
              const btn = document.querySelector('.no-print');
              if(btn) btn.remove();
              setTimeout(() => {
                window.print();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'PEBPM': 'Professor de Educação Básica (PEBPM)',
      'EEBPM': 'Especialista em Educação Básica (EEBPM)',
      'ASPM': 'Assistente Administrativo (ASPM)',
      'AAPM': 'Auxiliar Administrativo (AAPM)',
      'AGPM': 'Analista de Gestão (AGPM)'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div id="printable-report" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans text-slate-700">
      
      {/* Conclusão Principal - Cores ultra suaves */}
      <div className={`p-6 rounded-2xl border ${algumaRegraCumprida ? 'bg-emerald-50/40 border-emerald-100' : 'bg-rose-50/40 border-rose-100'}`}>
        <div className="flex items-start gap-5">
          {algumaRegraCumprida ? (
            <CheckCircle className="w-10 h-10 text-emerald-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-10 h-10 text-rose-400 flex-shrink-0" />
          )}
          <div>
            <h2 className="text-xl font-extrabold mb-2 text-slate-800">Resultado da Análise</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-600">
              Na data da simulação ({new Date(data.dataSimulacao + 'T00:00:00').toLocaleDateString('pt-BR')}), o servidor 
              {algumaRegraCumprida 
                ? " atende aos requisitos cumulativos para solicitação de aposentadoria conforme as regras vigentes analisadas."
                : " ainda não cumpre a totalidade dos requisitos legais necessários para a aposentadoria pelas regras de transição da E.C. 104/2020."}
            </p>
          </div>
        </div>
      </div>

      {/* Dados do Servidor - Layout limpo */}
      <section className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ClipboardList className="w-3 h-3" /> Perfil de Referência
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50/50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Cargo</p>
            <p className="text-xs font-bold text-slate-700">{getTipoLabel(data.tipoServidor)}</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Sexo</p>
            <p className="text-xs font-bold text-slate-700">{data.sexo}</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Nascimento</p>
            <p className="text-xs font-bold text-slate-700">{new Date(data.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="p-3 bg-slate-50/50 rounded-lg">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Inclusão</p>
            <p className="text-xs font-bold text-slate-700">{new Date(data.dataInclusaoPMMG + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </section>

      {/* Memória de Cálculo e Pontuação - Soft Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
            <Calculator className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Cálculos Justificativos</h3>
          </div>
          <div className="space-y-3 flex-grow text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Idade na Simulação:</span>
              <span className="font-bold text-slate-700">{calc.idadeFormatada}</span>
            </div>
            <div className="space-y-3 flex-grow text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Idade na Simulação em dias:</span>
              <span className="font-bold text-slate-700">{calc.idadeDias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tempo Efetivo PMMG:</span>
              <span className="font-bold text-slate-700">{formatDaysToYMD(calc.tempoServicoPMMGDias)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tempo Efetivo PMMG em dias:</span>
              <span className="font-bold text-slate-700">{calc.tempoServicoPMMGDias}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Averbações:</span>
              <span className="font-bold text-emerald-600">+{calc.totalTempoAverbado} dias</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Total Descontos:</span>
              <span className="font-bold text-rose-500">-{calc.totalTempoDescontado} dias</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className="font-bold text-slate-800">Tempo Contribuição Total:</span>
              <span className="font-bold text-slate-900">{formatDaysToYMD(calc.tempoContribuicaoTotal)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className="font-bold text-slate-800">Tempo Contribuição Total em dias:</span>
              <span className="font-bold text-slate-900">{calc.tempoContribuicaoTotal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
            <Award className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Pontuação e Pedágio</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <p className="text-[9px] font-black text-slate-400 tracking-[0.2em] mb-1 uppercase">PONTUAÇÃO (IDADE + TEMPO)</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{calc.pontuacao}</span>
                <span className="text-xs font-bold text-slate-500 uppercase">pontos</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 text-center">
                <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1 uppercase">PEDÁGIO (50%)</p>
                <p className="text-sm font-bold text-slate-700">{calc.pedagioApurado} dias</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 text-center">
                <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1 uppercase">PREVISÃO (50%)</p>
                <p className="text-[10px] font-bold text-slate-700">{calc.dataPrevistaAposentadoria}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento Técnico - Suavizado para cinza claro */}
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-200 pb-2 text-slate-700">
          <Clock className="w-4 h-4 text-slate-400" /> Detalhamento Técnico dos Pedágios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Situação em 15/09/2020</p>
            <p className="text-xs font-bold text-slate-700">{formatDaysToYMD(calc.tempoEfetivo15092020)}</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">Tempo no corte da reforma</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Saldo Faltante no Corte</p>
            <p className="text-xs font-bold text-slate-700">{calc.saldoFaltanteCorte} dias</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">Para atingir o tempo mínimo</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Cálculo dos Adicionais</p>
            <div className="flex gap-4">
              <div className="text-xs">
                <span className="font-bold text-blue-500">50%: </span>
                <span className="font-bold text-slate-700">{Math.ceil(calc.saldoFaltanteCorte * 0.5)} d</span>
              </div>
              <div className="text-xs">
                <span className="font-bold text-rose-400">100%: </span>
                <span className="font-bold text-slate-700">{calc.saldoFaltanteCorte} d</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NOVO: Detalhamento Técnico da Pontuação */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-amber-400">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-700">
          <Star className="w-4 h-4 text-amber-500" /> Detalhamento Técnico da Pontuação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Componente Idade</p>
            <p className="text-xs font-bold text-slate-700">{calc.idadeDias} dias</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">({Math.floor(calc.idadeDias/365)} anos completos)</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">Componente Tempo</p>
            <p className="text-xs font-bold text-slate-700">{calc.tempoContribuicaoTotal} dias</p>
            <p className="text-[8px] text-slate-400 mt-0.5 italic">({Math.floor(calc.tempoContribuicaoTotal/365)} anos completos)</p>
          </div>
          <div className="bg-amber-50/30 p-2 rounded-lg border border-amber-100/50">
            <p className="text-[8px] font-bold text-amber-600 uppercase mb-1">Soma para Pontos</p>
            <p className="text-xs font-black text-slate-800">{(calc.idadeDias + calc.tempoContribuicaoTotal)} dias</p>
            <p className="text-[8px] text-amber-600/70 mt-0.5 font-bold italic">Resulta em {calc.pontuacao} pontos</p>
          </div>
        </div>
      </section>

      {/* Análise de Requisitos */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <Target className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Avaliação de Requisitos Legais</h3>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Critérios E.C. Estadual nº 104/2020</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {regras.map((regra, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden page-break-inside-avoid">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="max-w-xl">
                    <h4 className="text-base font-bold text-slate-800 leading-tight">{regra.nome}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed italic border-l border-slate-200 pl-3">{regra.descricao}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${regra.cumpre ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {regra.cumpre ? 'Satisfeito' : 'Não Atende'}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[8px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-50">
                        <th className="pb-2">REQUISITO</th>
                        <th className="pb-2 text-center">EXIGIDO</th>
                        <th className="pb-2 text-center">APURADO</th>
                        <th className="pb-2 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {regra.requisitos.map((req, rIdx) => (
                        <tr key={rIdx}>
                          <td className="py-3">
                            <span className="text-[11px] font-medium text-slate-600">{req.label}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{req.esperado}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-[10px] font-bold ${req.cumpre ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {req.atual}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end">
                              {req.cumpre ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-300" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Regra Compulsória - Soft Alert */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden page-break-inside-avoid">
        <div className="relative z-10">
          <p className="text-[9px] font-black text-slate-400 tracking-widest mb-1 uppercase">Aviso de Aposentadoria Compulsória</p>
          <h4 className="text-sm font-bold text-slate-800 mb-2">Limite Constitucional de Permanência</h4>
          <p className="text-[11px] leading-relaxed text-slate-500 max-w-2xl">
            Conforme Art. 40, § 1º, II da CF, o servidor completará 75 anos em 
            <strong className="text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded mx-1">{calc.data75Anos}</strong>. 
            O desligamento ocorre obrigatoriamente no dia subsequente ao aniversário.
          </p>
        </div>
      </div>

      <div className="flex justify-center py-6 no-print">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md hover:scale-[1.02] transform active:scale-95">
          <Printer className="w-4 h-4" /> Gerar Relatório (PDF)
        </button>
      </div>
    </div>
  );
};

export default Results;
