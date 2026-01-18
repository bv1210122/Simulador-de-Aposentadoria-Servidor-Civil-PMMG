
import React, { useState, useEffect } from 'react';
import { FormState, Averbação, Desconto, TipoServidor, Sexo } from '../types';
import { Plus, Trash2, Calendar, User, Briefcase, CheckCircle2, MinusCircle, Calculator, Info, History, Star, Timer, FileSearch } from 'lucide-react';
import { parseISO, calculatePMMGPeriod, formatDaysToYMD, diffInDays, formatDateBR } from '../utils/calculoDatas';
import { apurarTemposBasicos } from '../utils/calculators/temposBasicos';
import { calcularPedagio50 } from '../utils/calculators/pedagio';
import { calcularPontuacao } from '../utils/calculators/pontos';

interface Props {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onCalculate: () => void;
}

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white text-gray-900 text-sm";
const sectionTitleClass = "text-xl font-bold text-blue-800 mb-4 flex items-center gap-2";

const DateInput: React.FC<{
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  name?: string;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, name = "", className, placeholder = "DD/MM/AAAA" }) => {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value) {
      const parts = value.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        if (y.length === 4 && m.length === 2 && d.length === 2) {
            setDisplay(`${d}/${m}/${y}`);
            return;
        }
      }
    }
    if (!value) setDisplay("");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.slice(0, 8);

    let formatted = input;
    if (input.length > 2) {
      formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
    }
    if (input.length > 4) {
      formatted = `${formatted.slice(0, 5)}/${input.slice(4)}`;
    }
    
    setDisplay(formatted);

    if (input.length === 8) {
      const day = input.slice(0, 2);
      const month = input.slice(2, 4);
      const year = input.slice(4);
      onChange({ target: { name, value: `${year}-${month}-${day}` } });
    } else if (input.length === 0) {
      onChange({ target: { name, value: "" } });
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      className={className}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      maxLength={10}
      autoComplete="off"
    />
  );
};

const FormSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }> = ({ title, icon, children, className = "" }) => (
  <section className={className}>
    <h2 className={sectionTitleClass}>{icon} {title}</h2>
    {children}
  </section>
);

const InputForm: React.FC<Props> = ({ formData, setFormData, onCalculate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      val = Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListUpdate = <T extends Averbação | Desconto>(
    listKey: 'averbacoes' | 'descontos',
    id: string,
    field: keyof T,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [listKey]: (prev[listKey] as T[]).map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const addAverbacao = () => {
    setFormData(prev => ({
      ...prev,
      averbacoes: [
        ...prev.averbacoes,
        { id: crypto.randomUUID(), regime: '', origem: '', funcao: '', dataAverbacao: '', anos: 0, dias: 0 }
      ]
    }));
  };

  const removeAverbacao = (id: string) => {
    setFormData(prev => ({ ...prev, averbacoes: prev.averbacoes.filter(a => a.id !== id) }));
  };

  const addDesconto = () => {
    setFormData(prev => ({
      ...prev,
      descontos: [
        ...prev.descontos,
        { id: crypto.randomUUID(), tipo: '', dias: 0 }
      ]
    }));
  };

  const removeDesconto = (id: string) => {
    setFormData(prev => ({ ...prev, descontos: prev.descontos.filter(d => d.id !== id) }));
  };

  const openTechnicalDetails = () => {
    if (!formData.dataSimulacao || !formData.dataNascimento || !formData.dataInclusaoPMMG || !formData.sexo || !formData.tipoServidor) {
       alert("Preencha os dados básicos antes de visualizar o detalhamento técnico.");
       return;
    }

    const dNasc = parseISO(formData.dataNascimento);
    const dSim = parseISO(formData.dataSimulacao);
    const dInc = parseISO(formData.dataInclusaoPMMG);

    const idadePMMG = calculatePMMGPeriod(dNasc, dSim);
    const tempoCasaPMMG = calculatePMMGPeriod(dInc, dSim);
    
    const tempos = apurarTemposBasicos(formData);
    const { pontuacaoTotalDias, pontuacaoInteira } = calcularPontuacao(tempos.idadeDias, tempos.tempoContribTotal);
    const isProfessor = formData.tipoServidor === 'PEBPM';
    const isHomem = formData.sexo === 'Masculino';
    const metaAnos = isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30);
    const metaDias = metaAnos * 365;
    const infoPedagio = calcularPedagio50(dInc, metaDias);

    const auditData = [
      {
        tipo: "Cálculo da Idade",
        resultado: `${tempos.idadeDias.toLocaleString()} dias`,
        calculo: `(${idadePMMG.anos} anos * 365) + ${idadePMMG.diasResiduais} dias`,
        explicacao: `Calculado de ${formatDateBR(dNasc)} até ${formatDateBR(dSim)}. Segue a regra PMMG onde anos completos valem 365 dias, somados aos dias residuais após o último aniversário.`
      },
      {
        tipo: "Tempo de Serviço PMMG",
        resultado: `${tempos.tempoServicoPMMGDias.toLocaleString()} dias`,
        calculo: `(${tempoCasaPMMG.anos} anos * 365) + ${tempoCasaPMMG.diasResiduais} dias`,
        explicacao: `Tempo bruto na corporação desde a inclusão (${formatDateBR(dInc)}) até a simulação.`
      },
      {
        tipo: "Tempo Averbado",
        resultado: `${tempos.totalTempoAverbado.toLocaleString()} dias`,
        calculo: formData.averbacoes.length > 0 
          ? formData.averbacoes.map(av => `(${av.anos}*365+${av.dias})`).join(" + ")
          : "0 (nenhum registro)",
        explicacao: `Soma das averbações externas informadas. Cada ano averbado é convertido em 365 dias conforme estatuto.`
      },
      {
        tipo: "Tempo Descontado",
        resultado: `${tempos.totalTempoDescontado.toLocaleString()} dias`,
        calculo: formData.descontos.length > 0
          ? formData.descontos.map(d => d.dias).join(" + ")
          : "0 (nenhum registro)",
        explicacao: `Total de dias a serem subtraídos do tempo de contribuição (afastamentos, LIP, faltas).`
      },
      {
        tipo: "Contribuição Líquida",
        resultado: `${tempos.tempoContribTotal.toLocaleString()} dias`,
        calculo: `(${tempos.tempoServicoPMMGDias} + ${tempos.totalTempoAverbado}) - ${tempos.totalTempoDescontado}`,
        explicacao: `Fórmula fundamental: (Tempo PMMG + Averbações) - Descontos. Base para verificação de metas.`
      },
      {
        tipo: "Cálculo de Pontos",
        resultado: `${pontuacaoInteira} pontos`,
        calculo: `(${tempos.idadeDias} + ${tempos.tempoContribTotal}) / 365`,
        explicacao: `Soma da idade e contribuição em dias. O valor resultante é truncado (apenas parte inteira) para definir a pontuação.`
      },
      {
        tipo: "Cálculo do Pedágio",
        resultado: `${infoPedagio.pedagio.toLocaleString()} dias`,
        calculo: `(${metaDias} - ${infoPedagio.tempoNoCorte}) * 0,5`,
        explicacao: `Baseado no saldo faltante para a meta de ${metaAnos} anos na data da reforma (15/09/2020).`
      }
    ];

    const auditWindow = window.open('', '_blank');
    if (!auditWindow) return;

    auditWindow.document.write(`
      <html>
        <head>
          <title>Auditoria de Cálculos - PMMG</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print { .no-print { display: none; } }
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body class="p-4 md:p-10 bg-slate-100 text-slate-900">
          <div class="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <header class="flex justify-between items-start border-b border-slate-100 pb-8 mb-8">
              <div>
                <h1 class="text-3xl font-black text-slate-800 uppercase tracking-tight">Detalhamento Técnico dos Cálculos</h1>
                <p class="text-sm text-blue-600 font-bold uppercase tracking-widest mt-1">Memória de Cálculo Auditável • Centro de Administração de Servidor Civil</p>
                <div class="mt-4 flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                  <span>Simulação em: ${formatDateBR(dSim)}</span>
                  <span>Servidor: ${formData.tipoServidor}</span>
                  <span>Sexo: ${formData.sexo}</span>
                </div>
              </div>
              <button onclick="window.print()" class="no-print bg-blue-700 text-white px-6 py-3 rounded-lg font-black text-xs uppercase hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200">Imprimir Auditoria</button>
            </header>

            <div class="overflow-x-auto">
              <table class="w-full border-separate border-spacing-0">
                <thead>
                  <tr class="bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">
                    <th class="p-4 text-left border-b w-1/6 rounded-tl-lg">Tipo de Cálculo</th>
                    <th class="p-4 text-center border-b w-1/6">Resultado</th>
                    <th class="p-4 text-left border-b w-2/6">Memorial (Cálculo Realizado)</th>
                    <th class="p-4 text-left border-b w-2/6 rounded-tr-lg">Explicação Lógica</th>
                  </tr>
                </thead>
                <tbody class="text-xs divide-y divide-slate-100">
                  ${auditData.map(row => `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="p-4 font-black text-slate-700 bg-slate-50/20 border-r border-slate-100">${row.tipo}</td>
                      <td class="p-4 text-center font-mono font-bold text-blue-700 border-r border-slate-100">${row.resultado}</td>
                      <td class="p-4 font-mono text-indigo-600 bg-indigo-50/20 border-r border-slate-100 leading-relaxed">${row.calculo}</td>
                      <td class="p-4 text-slate-500 leading-relaxed italic">${row.explicacao}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="mt-10 p-6 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 items-start">
              <div class="bg-amber-100 p-2 rounded-lg text-amber-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <div>
                <h4 class="text-sm font-bold text-amber-900 uppercase tracking-tight">Nota de Auditoria</h4>
                <p class="text-xs text-amber-700 mt-1 leading-relaxed">
                  Os cálculos acima baseiam-se na aritmética militar (estatutária), onde cada ano é contabilizado como 365 dias fixos para fins de equalização de metas de tempo de serviço e contribuição, independentemente de anos bissextos no calendário gregoriano.
                </p>
              </div>
            </div>

            <footer class="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              <span>Relatório de Conferência Técnica - Auditoria 2.0</span>
              <span>© Polícia Militar de Minas Gerais - DRH</span>
            </footer>
          </div>
        </body>
      </html>
    `);
    auditWindow.document.close();
  };

  const renderIdadeCalculada = () => {
    if (!formData.dataNascimento || !formData.dataSimulacao) return null;
    const dNasc = parseISO(formData.dataNascimento);
    const dSim = parseISO(formData.dataSimulacao);
    if (isNaN(dNasc.getTime()) || isNaN(dSim.getTime())) return null;
    
    const info = calculatePMMGPeriod(dNasc, dSim);
    return (
      <div className="mt-1 text-xs font-bold text-blue-700 bg-blue-50/80 p-2 rounded border border-blue-100 flex items-center gap-1">
        <span>🎂 {info.formatada}</span>
        <span className="text-blue-400">({info.totalDias.toLocaleString()} dias)</span>
      </div>
    );
  };

  const renderTempoPMMGCalculado = () => {
    if (!formData.dataInclusaoPMMG || !formData.dataSimulacao) return null;
    const dInc = parseISO(formData.dataInclusaoPMMG);
    const dSim = parseISO(formData.dataSimulacao);
    if (isNaN(dInc.getTime()) || isNaN(dSim.getTime())) return null;

    const info = calculatePMMGPeriod(dInc, dSim);
    return (
      <div className="mt-1 text-xs font-bold text-blue-700 bg-blue-50/80 p-2 rounded border border-blue-100 flex items-center gap-1">
        <span>🛡️ {info.formatada}</span>
        <span className="text-blue-400">({info.totalDias.toLocaleString()} dias)</span>
      </div>
    );
  };

  const renderDetalhamento = () => {
    if (!formData.dataSimulacao || !formData.dataNascimento || !formData.dataInclusaoPMMG || !formData.sexo || !formData.tipoServidor) {
       return (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center text-blue-800 text-sm flex flex-col items-center gap-2">
           <Info className="w-6 h-6 opacity-50" />
           <span>Preencha os dados de identificação e datas acima para visualizar a memória de cálculo detalhada em tempo real.</span>
         </div>
       );
    }

    // Processamento de tempos e pontuação em tempo real
    const tempos = apurarTemposBasicos(formData);
    const { pontuacaoTotalDias, pontuacaoInteira } = calcularPontuacao(tempos.idadeDias, tempos.tempoContribTotal);
    
    // Cálculo do Pedágio em tempo real
    const isProfessor = formData.tipoServidor === 'PEBPM';
    const isHomem = formData.sexo === 'Masculino';
    const metaAnos = isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30);
    const metaDias = metaAnos * 365;
    const dInc = parseISO(formData.dataInclusaoPMMG);
    const dSim = parseISO(formData.dataSimulacao);
    const dCorte = parseISO('2020-09-15');
    const infoPedagio = calcularPedagio50(dInc, metaDias);
    
    // Cálculo de dias cumpridos pós-reforma
    const diasCumpridosPosCorte = dSim >= dCorte ? diffInDays(dCorte, dSim) : 0;
    
    return (
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-6">
        <h2 className={sectionTitleClass}>
           <Calculator className="w-5 h-5" /> Detalhamento da Memória de Cálculo
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BLOCO 1: APURAÇÃO DE DIAS */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1 flex items-center gap-2">
              <History className="w-4 h-4" /> 1. Apuração de Dias (Fórmula Oficial)
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-gray-100 text-gray-600 font-bold border-b">
                <tr>
                  <th className="p-2 text-left">Variável</th>
                  <th className="p-2 text-right">Cálculo (Dias)</th>
                  <th className="p-2 text-right">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr>
                  <td className="p-2 text-gray-700">Idade Real</td>
                  <td className="p-2 text-right font-mono">{tempos.idadeDias.toLocaleString()}</td>
                  <td className="p-2 text-right text-gray-500">{tempos.idadeFormatada}</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-700">Tempo PMMG (Bruto)</td>
                  <td className="p-2 text-right font-mono">{tempos.tempoServicoPMMGDias.toLocaleString()}</td>
                  <td className="p-2 text-right text-gray-500">{formatDaysToYMD(tempos.tempoServicoPMMGDias)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-gray-700">(+) Total Averbado</td>
                  <td className="p-2 text-right font-mono text-blue-600">+{tempos.totalTempoAverbado.toLocaleString()}</td>
                  <td className="p-2 text-right text-gray-500">{formatDaysToYMD(tempos.totalTempoAverbado)}</td>
                </tr>
                 <tr>
                  <td className="p-2 text-gray-700">(-) Total Descontado</td>
                  <td className="p-2 text-right font-mono text-red-600">-{tempos.totalTempoDescontado.toLocaleString()}</td>
                  <td className="p-2 text-right text-gray-500">{formatDaysToYMD(tempos.totalTempoDescontado)}</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className="p-2 text-blue-900">Contribuição Líquida</td>
                  <td className="p-2 text-right text-blue-900">{tempos.tempoContribTotal.toLocaleString()}</td>
                  <td className="p-2 text-right text-blue-900">{formatDaysToYMD(tempos.tempoContribTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            {/* BLOCO 2: CÁLCULO DE PONTOS - TABULAR */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1 flex items-center gap-2">
                <Star className="w-4 h-4" /> 2. Cálculo de Pontos
              </h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-100 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Variável</th>
                    <th className="p-2 text-right">Cálculo (Dias)</th>
                    <th className="p-2 text-right">Conversão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="p-2 text-gray-700">Idade</td>
                    <td className="p-2 text-right font-mono">{tempos.idadeDias.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-500">{tempos.idadeFormatada}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-gray-700">Contribuição</td>
                    <td className="p-2 text-right font-mono">{tempos.tempoContribTotal.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-500">{formatDaysToYMD(tempos.tempoContribTotal)}</td>
                  </tr>
                  <tr className="bg-amber-50 font-bold">
                    <td className="p-2 text-amber-900">Soma Total (Pontos)</td>
                    <td className="p-2 text-right text-amber-900 font-black text-sm">{pontuacaoInteira} pts</td>
                    <td className="p-2 text-right text-amber-700">{formatDaysToYMD(pontuacaoTotalDias)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BLOCO 3: DETALHAMENTO DO PEDÁGIO - TABULAR */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1 flex items-center gap-2">
                <Timer className="w-4 h-4" /> 3. Cálculo do Pedágio (EC 104/2020)
              </h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-100 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="p-2 text-left">Variável</th>
                    <th className="p-2 text-right">Cálculo (Dias)</th>
                    <th className="p-2 text-right">Conversão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="p-2 text-gray-700">Meta ({metaAnos} anos)</td>
                    <td className="p-2 text-right font-mono">{metaDias.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-500">{metaAnos} anos</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-gray-700">Tempo no Corte (2020)</td>
                    <td className="p-2 text-right font-mono text-blue-600">{infoPedagio.tempoNoCorte.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-500">{formatDaysToYMD(infoPedagio.tempoNoCorte)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-gray-700">Saldo no Corte</td>
                    <td className="p-2 text-right font-mono text-orange-600">{infoPedagio.saldoNoCorte.toLocaleString()}</td>
                    <td className="p-2 text-right text-gray-500">{formatDaysToYMD(infoPedagio.saldoNoCorte)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-emerald-800 font-bold">Cumprido Pós-Reforma</td>
                    <td className="p-2 text-right font-mono text-emerald-600">{diasCumpridosPosCorte.toLocaleString()}</td>
                    <td className="p-2 text-right text-emerald-500 font-medium">{formatDaysToYMD(diasCumpridosPosCorte)}</td>
                  </tr>
                  <tr className="bg-indigo-50 font-bold">
                    <td className="p-2 text-indigo-900">Pedágio Devido (50%)</td>
                    <td className="p-2 text-right text-indigo-900 font-black text-sm">{infoPedagio.pedagio.toLocaleString()}</td>
                    <td className="p-2 text-right text-indigo-700">{formatDaysToYMD(infoPedagio.pedagio)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const opcoesDesconto = [
    "Faltas ao serviço",
    "Período de licença para tratar de interesse particular (LIP) sem contribuição",
    "Suspensões",
    "Período de afastamento preliminar à aposentadoria indevido",
    "Períodos de licença para tratar de pessoa doente da família"
  ];

  return (
    <div className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 no-print">
      <FormSection title="Dados Identificadores" icon={<User className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Servidor</label>
            <select name="tipoServidor" value={formData.tipoServidor} onChange={handleChange} className={inputClass}>
              <option value="">Selecione</option>
              <option value="PEBPM">Professor de Ed. Básica (PEBPM)</option>
              <option value="EEBPM">Especialista em Ed. Básica (EEBPM)</option>
              <option value="ASPM">Assistente Administrativo (ASPM)</option>
              <option value="AAPM">Auxiliar Administrativo (AAPM)</option>
              <option value="AGPM">Analista de Gestão (AGPM)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}>
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
          {formData.tipoServidor === 'PEBPM' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-gray-500 uppercase">Tempo de Regência (Anos)</label>
              <input
                type="number"
                name="tempoRegencia"
                value={formData.tempoRegencia}
                onChange={handleChange}
                className={inputClass}
                min="0"
                placeholder="0"
              />
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Datas de Referência" icon={<Calendar className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Simulação</label>
            <DateInput name="dataSimulacao" value={formData.dataSimulacao} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nascimento</label>
            <DateInput name="dataNascimento" value={formData.dataNascimento} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
            {renderIdadeCalculada()}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Inclusão PMMG</label>
            <DateInput name="dataInclusaoPMMG" value={formData.dataInclusaoPMMG} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
            {renderTempoPMMGCalculado()}
          </div>
        </div>
      </FormSection>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className={sectionTitleClass}><Briefcase className="w-5 h-5" /> Tempo Averbado</h2>
        </div>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-gray-50 mb-3">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 border-b font-bold tracking-wider">
              <tr>
                <th className="px-3 py-3 min-w-[120px]">Regime</th>
                <th className="px-3 py-3 min-w-[120px]">Origem</th>
                <th className="px-3 py-3 min-w-[120px]">Função</th>
                <th className="px-3 py-3 w-32 text-center">Data Averbação</th>
                <th className="px-3 py-3 w-20 text-center">Anos</th>
                <th className="px-3 py-3 w-20 text-center">Dias</th>
                <th className="px-3 py-3 w-24 text-center bg-blue-50/50">Total (Dias)</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.averbacoes.map((av) => (
                <tr key={av.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <select value={av.regime} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'regime', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5">
                      <option value="">Selecione...</option>
                      <option value="RGPS">RGPS (INSS)</option>
                      <option value="RPPS">RPPS (Regime Próprio)</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="text" placeholder="Ex: INSS, SEE/MG" value={av.origem} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'origem', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5" />
                  </td>
                  <td className="p-2">
                    <input type="text" placeholder="Ex: Prof., Aux. Adm." value={av.funcao} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'funcao', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5" />
                  </td>
                  <td className="p-2">
                    <DateInput value={av.dataAverbacao} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'dataAverbacao', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5" />
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={av.anos} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'anos', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-1.5" />
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={av.dias} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'dias', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-1.5" />
                  </td>
                  <td className="p-2 text-center font-bold text-blue-700 bg-blue-50/30 text-xs">
                    {(Number(av.anos) * 365 + Number(av.dias)).toLocaleString()}
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeAverbacao(av.id)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button onClick={addAverbacao} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-sm transition-all"><Plus className="w-4 h-4" /> Adicionar Tempo</button>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className={sectionTitleClass}><MinusCircle className="w-5 h-5 text-red-600" /> Tempo Descontado</h2>
        </div>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-gray-50 mb-3">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 border-b font-bold tracking-wider">
              <tr>
                <th className="px-3 py-3 w-3/4">Tipo de Desconto</th>
                <th className="px-3 py-3 w-1/4 text-center">Dias</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.descontos.map((desc) => (
                <tr key={desc.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <select value={desc.tipo} onChange={e => handleListUpdate<Desconto>('descontos', desc.id, 'tipo', e.target.value)} className="w-full text-xs border-gray-200 rounded p-2">
                      <option value="">Selecione o motivo...</option>
                      {opcoesDesconto.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={desc.dias} onChange={e => handleListUpdate<Desconto>('descontos', desc.id, 'dias', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-2 font-bold text-red-600" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeDesconto(desc.id)} className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button onClick={addDesconto} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-red-50 shadow-sm transition-all"><Plus className="w-4 h-4" /> Adicionar Desconto</button>
        </div>
      </section>

      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Critérios de Ingresso e Carreira</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1 mb-2">Histórico de Ingresso</h3>
            <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <input type="checkbox" name="ingressouAte2003" checked={formData.ingressouAte2003} onChange={handleChange} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div><span className="text-sm font-medium text-slate-700 block">Ingresso até 31/12/2003</span></div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <input type="checkbox" name="ingressouEntre2003e2020" checked={formData.ingressouEntre2003e2020} onChange={handleChange} className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <div><span className="text-sm font-medium text-slate-700 block">Ingresso entre 2004 e 2020</span></div>
            </label>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1 mb-2">Requisitos de Tempo</h3>
            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <input type="checkbox" name="dezAnosServicoPublico" checked={formData.dezAnosServicoPublico} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">10 anos Svc. Público</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all">
              <input type="checkbox" name="cincoAnosCargoEfetivo" checked={formData.cincoAnosCargoEfetivo} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">5 anos Cargo Efetivo</span>
            </label>
          </div>
        </div>
      </section>

      {renderDetalhamento()}
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={openTechnicalDetails} 
          className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors py-2"
        >
          <FileSearch className="w-4 h-4" />
          Ver Detalhamento Técnico dos Cálculos
        </button>
        <button onClick={onCalculate} className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl">Gerar Simulação de Aposentadoria</button>
      </div>
    </div>
  );
};

export default InputForm;
