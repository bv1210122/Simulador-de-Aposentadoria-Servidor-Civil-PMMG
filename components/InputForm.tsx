import React, { useState, useEffect } from 'react';
import { FormState, Averbação, Desconto, FeriasPremio, TipoServidor, Sexo } from '../types';
import { Plus, Trash2, Calendar, User, Briefcase, CheckCircle2, MinusCircle, Calculator, Info, History, Star, Timer, FileSearch, Award, AlertCircle, Scale, Target, GraduationCap, X, FileCheck } from 'lucide-react';
import { parseISO, formatDaysToYMD, diffInDays, calculateCalendarPeriod, formatDateBR } from '../utils/calculoDatas';
import { apurarTemposBasicos } from '../utils/calculators/temposBasicos';
import { calcularPedagio50 } from '../utils/calculators/pedagio';
import { calcularPontuacao } from '../utils/calculators/pontos';
import { calculateIdadePMMG } from '../utils/calculators/idade';

interface Props {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onCalculate: () => void;
}

const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white text-gray-900 text-sm";
const sectionTitleClass = "text-xl font-bold text-blue-800 mb-4 flex items-center gap-2";

const OPCOES_DESCONTO = [
  "Faltas ao serviço",
  "Período de licença para tratar de interesse particular (LIP) sem a devida contribuição previdenciária",
  "Suspensões",
  "Período de afastamento preliminar à aposentadoria indevido",
  "Períodos de licença para tratar de pessoa doente da família"
];

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
    setDisplay("");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.slice(0, 8);

    let formatted = "";
    if (input.length > 0) {
      formatted = input.slice(0, 2);
      if (input.length > 2) {
        formatted += "/" + input.slice(2, 4);
        if (input.length > 4) {
          formatted += "/" + input.slice(4, 8);
        }
      }
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

const PreviewBox: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2">
      <span className="text-blue-600">{icon}</span>
      <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">{title}</h3>
    </div>
    <div className="divide-y divide-gray-50">
      {children}
    </div>
  </div>
);

const PreviewRow: React.FC<{ label: string, value: string | number, subValue?: string, isTotal?: boolean, isPlus?: boolean, isMinus?: boolean, highlightColor?: string }> = ({ label, value, subValue, isTotal, isPlus, isMinus, highlightColor }) => (
  <div className={`grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] items-center ${isTotal ? 'bg-blue-50 font-bold' : ''}`}>
    <div className="col-span-5 text-gray-500 font-medium">{label}</div>
    <div className={`col-span-3 text-right font-bold ${isMinus ? 'text-red-500' : isPlus ? 'text-blue-500' : highlightColor || 'text-gray-700'}`}>
      {isPlus ? '+' : isMinus ? '-' : ''}{typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="col-span-4 text-right text-gray-400 font-medium">
      {subValue}
    </div>
  </div>
);

const TechnicalAuditModal: React.FC<{ isOpen: boolean, onClose: () => void, previewData: any, formData: FormState }> = ({ isOpen, onClose, previewData, formData }) => {
  if (!isOpen || !previewData) return null;

  const rows = [
    {
      nome: "Idade Real (SEPLAG)",
      formula: "((AnoUltimoAniv - AnoNasc)*365) + (DataSim - DataDiaPostUltimoAniv)",
      detalhamento: `Nasc: ${formatDateBR(parseISO(formData.dataNascimento))}, Sim: ${formatDateBR(parseISO(formData.dataSimulacao))}. Cálculo: (${previewData.tempos.idadeAnos} * 365) + ${previewData.tempos.idadeDias - (previewData.tempos.idadeAnos * 365)} = ${previewData.tempos.idadeDias} dias.`,
      obs: "Apura a idade em dias para fins de pontuação conforme norma SEPLAG."
    },
    {
      nome: "Tempo PMMG (Bruto)",
      formula: "DataSimulação - DataInclusão (Contagem Real)",
      detalhamento: `Inc: ${formatDateBR(parseISO(formData.dataInclusaoPMMG))}, Sim: ${formatDateBR(parseISO(formData.dataSimulacao))}. Total: ${previewData.tempos.tempoServicoPMMGDias} dias.`,
      obs: "Tempo de serviço efetivo na instituição sem considerar averbações."
    },
    {
      nome: "Contribuição Líquida",
      formula: "TempoPMMG + TempoAverbado + FériasPrêmioDobro - Descontos",
      detalhamento: `${previewData.tempos.tempoServicoPMMGDias} + ${previewData.tempos.totalTempoAverbado} + ${previewData.tempos.totalFeriasPremio} - ${previewData.tempos.totalTempoDescontado} = ${previewData.tempos.tempoContribTotal} dias.`,
      obs: "Tempo total considerado para fins previdenciários após todos os ajustes."
    },
    {
      nome: "Pontuação (Pontos)",
      formula: "(IdadeDias + ContribuiçãoDias) / 365 (Truncado)",
      detalhamento: `${previewData.tempos.idadeDias} + ${previewData.tempos.tempoContribTotal} = ${previewData.tempos.idadeDias + previewData.tempos.tempoContribTotal} dias. Resultado: ${previewData.pontuacaoInteira} pts.`,
      obs: "Valor inteiro de referência para a regra de transição por somatório de pontos."
    },
    {
      nome: "Cálculo do Pedágio",
      formula: "(Meta - TempoEm15/09/20) * 0.5",
      detalhamento: `Meta: ${previewData.metaDias} d. No Corte: ${previewData.infoPedagio.tempoNoCorte} d. Saldo: ${previewData.infoPedagio.saldoNoCorte} d. Pedágio: ${previewData.infoPedagio.pedagio} d.`,
      obs: "Determina o tempo extra necessário conforme regra de 50% da EC 104/2020."
    }
  ];

  if (formData.tipoServidor === 'PEBPM') {
    rows.push({
      nome: "Tempo de Regência",
      formula: "RegênciaAverbada + TempoServiçoPMMG",
      detalhamento: `Averbado: ${previewData.tempos.tempoRegenciaAverbadoAnos} anos. PMMG: ${previewData.tempos.tempoServicoPMMGAnos} anos. Total: ${previewData.tempos.tempoRegenciaTotalAnos} anos.`,
      obs: "Critério de tempo de sala de aula específico para a carreira PEBPM."
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 bg-blue-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileSearch className="w-6 h-6 text-blue-300" />
            <h2 className="text-xl font-bold tracking-tight">Detalhamento Técnico dos Cálculos (Auditoria)</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-900 leading-relaxed">
              Esta tabela apresenta a rastreabilidade completa das fórmulas aplicadas e os valores extraídos dos dados informados. 
              As regras seguem rigorosamente a legislação vigente e a metodologia de contagem da PMMG/SEPLAG.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-4 py-3 border-b border-slate-200 w-1/5">Nome do Cálculo</th>
                  <th className="px-4 py-3 border-b border-slate-200 w-1/5">Fórmula Aplicada</th>
                  <th className="px-4 py-3 border-b border-slate-200 w-2/5">Detalhamento e Memória</th>
                  <th className="px-4 py-3 border-b border-slate-200 w-1/5">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-blue-900 align-top">{row.nome}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600 align-top leading-relaxed">{row.formula}</td>
                    <td className="px-4 py-3 text-xs text-slate-700 align-top">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100 font-medium">
                        {row.detalhamento}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 italic align-top leading-tight">{row.obs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-800 text-white rounded-lg font-bold hover:bg-blue-900 transition-shadow shadow-md">
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};

const InputForm: React.FC<Props> = ({ formData, setFormData, onCalculate }) => {
  const [resetKeys, setResetKeys] = useState({
    dataSimulacao: 0,
    dataNascimento: 0,
    dataInclusaoPMMG: 0
  });
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const forceReset = (name: string) => {
    setResetKeys(prev => ({ ...prev, [name]: prev[name as keyof typeof prev] + 1 }));
  };

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
    if (!value) {
      setFormData(prev => ({ ...prev, [name]: "" }));
      return;
    }

    if (formData.dataSimulacao) {
      const selectedDate = new Date(value + 'T00:00:00Z');
      const simulationDate = new Date(formData.dataSimulacao + 'T00:00:00Z');

      if (name === 'dataNascimento' || name === 'dataInclusaoPMMG') {
        if (selectedDate > simulationDate) {
          const label = name === 'dataNascimento' ? 'Nascimento' : 'Inclusão PMMG';
          alert(`Erro: A data de ${label} não pode ser posterior à data de simulação.`);
          setFormData(prev => ({ ...prev, [name]: "" }));
          forceReset(name);
          return;
        }
      }

      if (name === 'dataNascimento' && formData.dataInclusaoPMMG) {
        const inclusionDate = new Date(formData.dataInclusaoPMMG + 'T00:00:00Z');
        if (selectedDate > inclusionDate) {
          alert("Erro: A data de nascimento não pode ser posterior à data de inclusão na PMMG.");
          setFormData(prev => ({ ...prev, [name]: "" }));
          forceReset(name);
          return;
        }
      }

      if (name === 'dataInclusaoPMMG' && formData.dataNascimento) {
        const birthDate = new Date(formData.dataNascimento + 'T00:00:00Z');
        if (selectedDate < birthDate) {
          alert("Erro: A data de inclusão na PMMG não pode ser anterior à data de nascimento.");
          setFormData(prev => ({ ...prev, [name]: "" }));
          forceReset(name);
          return;
        }
      }

      if (name === 'dataSimulacao') {
        let nInvalid = false;
        let iInvalid = false;
        if (formData.dataNascimento) {
          const birthDate = new Date(formData.dataNascimento + 'T00:00:00Z');
          if (selectedDate < birthDate) nInvalid = true;
        }
        if (formData.dataInclusaoPMMG) {
          const inclusionDate = new Date(formData.dataInclusaoPMMG + 'T00:00:00Z');
          if (selectedDate < inclusionDate) iInvalid = true;
        }
        if (nInvalid || iInvalid) {
          alert("Erro: A data de simulação não pode ser anterior ao Nascimento ou Inclusão já informados. Estes campos serão limpos.");
          setFormData(prev => ({
            ...prev,
            dataSimulacao: value,
            dataNascimento: nInvalid ? "" : prev.dataNascimento,
            dataInclusaoPMMG: iInvalid ? "" : prev.dataInclusaoPMMG
          }));
          if (nInvalid) forceReset('dataNascimento');
          if (iInvalid) forceReset('dataInclusaoPMMG');
          return;
        }
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListUpdate = <T extends Averbação | Desconto | FeriasPremio>(
    listKey: 'averbacoes' | 'descontos' | 'feriasPremio',
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
      averbacoes: [...prev.averbacoes, { id: crypto.randomUUID(), regime: '', origem: '', funcao: '', dataAverbacao: '', anos: 0, dias: 0, anteriorReforma: false, isRegencia: false }]
    }));
  };

  const removeAverbacao = (id: string) => {
    setFormData(prev => ({ ...prev, averbacoes: prev.averbacoes.filter(a => a.id !== id) }));
  };

  const addDesconto = () => {
    setFormData(prev => ({
      ...prev,
      descontos: [...prev.descontos, { id: crypto.randomUUID(), tipo: '', dias: 0, anteriorReforma: false }]
    }));
  };

  const removeDesconto = (id: string) => {
    setFormData(prev => ({ ...prev, descontos: prev.descontos.filter(d => d.id !== id) }));
  };

  const addFeriasPremio = () => {
    setFormData(prev => ({
      ...prev,
      feriasPremio: [...prev.feriasPremio, { id: crypto.randomUUID(), descricao: '', dias: 0 }]
    }));
  };

  const removeFeriasPremio = (id: string) => {
    setFormData(prev => ({ ...prev, feriasPremio: prev.feriasPremio.filter(f => f.id !== id) }));
  };

  const totalAverbadoAnt = formData.averbacoes.filter(av => av.anteriorReforma).reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  const totalAverbadoPos = formData.averbacoes.filter(av => !av.anteriorReforma).reduce((acc, av) => acc + (Number(av.anos) * 365) + Number(av.dias), 0);
  const totalAverbadoGeral = totalAverbadoAnt + totalAverbadoPos;

  const totalRegenciaAverbadoAnos = formData.averbacoes
    .filter(av => av.isRegencia)
    .reduce((acc, av) => acc + Number(av.anos), 0);
  const totalRegenciaAverbadoDias = formData.averbacoes
    .filter(av => av.isRegencia)
    .reduce((acc, av) => acc + Number(av.dias), 0);

  const totalDescontoAnt = formData.descontos.filter(d => d.anteriorReforma).reduce((acc, d) => acc + Number(d.dias), 0);
  const totalDescontoPos = formData.descontos.filter(d => !d.anteriorReforma).reduce((acc, d) => acc + Number(d.dias), 0);
  const totalDescontoGeral = totalDescontoAnt + totalDescontoPos;

  const totalFeriasPremioSimples = formData.feriasPremio.reduce((acc, fp) => acc + fp.dias, 0);
  const totalFeriasPremioDobro = totalFeriasPremioSimples * 2;

  const canPreview = formData.dataSimulacao && formData.dataNascimento && formData.dataInclusaoPMMG && formData.sexo && formData.tipoServidor;

  let preview = null;
  if (canPreview) {
    try {
      const dSim = parseISO(formData.dataSimulacao);
      const dInc = parseISO(formData.dataInclusaoPMMG);
      const dCorte = parseISO('2020-09-15');

      const isProfessor = formData.tipoServidor === 'PEBPM';
      const isHomem = formData.sexo === 'Masculino';
      const metaAnos = isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30);
      const metaDias = metaAnos * 365;

      const tempos = apurarTemposBasicos(formData);
      const { pontuacaoInteira } = calcularPontuacao(tempos.idadeDias, tempos.tempoContribTotal);
      const infoPedagio = calcularPedagio50(dInc, tempos.totalTempoAverbado + tempos.totalFeriasPremioAnterior, tempos.totalDescontadoAnterior, metaDias);
      const diasCumpridosPosCorte = dSim >= dCorte ? diffInDays(dCorte, dSim) : 0;

      preview = {
        tempos,
        pontuacaoInteira,
        infoPedagio,
        metaAnos,
        metaDias,
        diasCumpridosPosCorte
      };
    } catch (e) {
      console.warn("Erro no cálculo do preview", e);
    }
  }

  const renderPreviaData = (start: string, end: string, icon: string) => {
    if (!start || !end) return null;
    try {
      const dStart = parseISO(start);
      const dEnd = parseISO(end);
      if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime()) || dStart > dEnd) return null;

      const info = icon === "🎂"
        ? calculateIdadePMMG(dStart, dEnd)
        : calculateCalendarPeriod(dStart, dEnd);

      return (
        <div className="mt-1 text-[10px] font-bold text-blue-700 bg-blue-50/80 p-1.5 rounded border border-blue-100 flex items-center gap-1">
          <span>{icon} {info.formatada}</span>
        </div>
      );
    } catch {
      return null;
    }
  };

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
        </div>
      </FormSection>

      <FormSection title="Datas de Referência" icon={<Calendar className="w-5 h-5" />}>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-md">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Orientações de Datas:</strong> As datas de nascimento e inclusão não podem ser posteriores à data da simulação. Além disso, o nascimento deve anteceder a inclusão. Caso uma inconsistência seja detectada, o campo será limpo automaticamente.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Simulação</label>
            <DateInput key={`sim-${resetKeys.dataSimulacao}`} name="dataSimulacao" value={formData.dataSimulacao} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Nascimento</label>
            <DateInput key={`nasc-${resetKeys.dataNascimento}`} name="dataNascimento" value={formData.dataNascimento} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
            {renderPreviaData(formData.dataNascimento, formData.dataSimulacao, "🎂")}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Inclusão PMMG</label>
            <DateInput key={`inc-${resetKeys.dataInclusaoPMMG}`} name="dataInclusaoPMMG" value={formData.dataInclusaoPMMG} onChange={(e) => handleDateChange(e.target.name, e.target.value)} className={inputClass} />
            {renderPreviaData(formData.dataInclusaoPMMG, formData.dataSimulacao, "🛡️")}
          </div>
        </div>
      </FormSection>

      <section>
        <div className="flex justify-between items-center mb-4"><h2 className={sectionTitleClass}><Briefcase className="w-5 h-5" /> Tempo Averbado</h2></div>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded-r-md">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed"><strong>Orientações para o Lançamento:</strong> Para uma simulação precisa, você deve separar em linhas distintas o tempo averbado adquirido <strong>anteriormente a 15/09/2020</strong> do tempo adquirido após essa data.</p>
          </div>
        </div>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-gray-50 mb-3">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 border-b font-bold tracking-wider">
              <tr>
                <th className="px-3 py-3 w-32">Regime</th>
                <th className="px-3 py-3">Origem</th>
                <th className="px-3 py-3">Função</th>
                <th className="px-3 py-3 w-20 text-center">Anos</th>
                <th className="px-3 py-3 w-20 text-center">Dias</th>
                <th className="px-3 py-3 w-10 text-center">Ant. 15/09/20</th>
                <th className="px-3 py-3 w-10 text-center">Regência?</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.averbacoes.map((av) => (
                <tr key={av.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <select value={av.regime} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'regime', e.target.value as any)} className="w-full text-xs border-gray-200 rounded p-1.5">
                      <option value="">Selecione</option>
                      <option value="RGPS">RGPS</option>
                      <option value="RPPS">RPPS</option>
                    </select>
                  </td>
                  <td className="p-2"><input type="text" placeholder="Ex: INSS" value={av.origem} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'origem', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5" /></td>
                  <td className="p-2"><input type="text" placeholder="Ex: Professor" value={av.funcao} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'funcao', e.target.value)} className="w-full text-xs border-gray-200 rounded p-1.5" /></td>
                  <td className="p-2"><input type="number" value={av.anos} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'anos', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-1.5" /></td>
                  <td className="p-2"><input type="number" value={av.dias} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'dias', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-1.5" /></td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={av.anteriorReforma} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'anteriorReforma', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={av.isRegencia} onChange={e => handleListUpdate<Averbação>('averbacoes', av.id, 'isRegencia', e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeAverbacao(av.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {formData.averbacoes.length > 0 && (
              <tfoot className="bg-blue-50 font-bold text-[10px]">
                <tr><td colSpan={3} className="p-2 text-blue-800 uppercase">Total Ant. 15/09/20</td><td colSpan={2} className="p-2 text-center text-blue-700">{formatDaysToYMD(totalAverbadoAnt)} ({totalAverbadoAnt} d)</td><td colSpan={3}></td></tr>
                <tr><td colSpan={3} className="p-2 text-blue-800 uppercase">Total Pos. 15/09/20</td><td colSpan={2} className="p-2 text-center text-blue-700">{formatDaysToYMD(totalAverbadoPos)} ({totalAverbadoPos} d)</td><td colSpan={3}></td></tr>
                <tr className="bg-amber-50/50"><td colSpan={3} className="p-2 text-amber-800 uppercase border-y border-amber-100">Total Regência Averbada</td><td colSpan={2} className="p-2 text-center text-amber-700 border-y border-amber-100">{totalRegenciaAverbadoAnos} anos e {totalRegenciaAverbadoDias} dias</td><td colSpan={3} className="border-y border-amber-100"></td></tr>
                <tr className="border-t border-blue-100"><td colSpan={3} className="p-2 text-blue-900 uppercase bg-blue-100/50">Total Geral Averbado</td><td colSpan={2} className="p-2 text-center text-blue-800 bg-blue-100/50">{formatDaysToYMD(totalAverbadoGeral)} ({totalAverbadoGeral} d)</td><td colSpan={3} className="bg-blue-100/50"></td></tr>
              </tfoot>
            )}
          </table>
        </div>
        <div className="flex justify-end"><button onClick={addAverbacao} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4" /> Adicionar Tempo</button></div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4"><h2 className={sectionTitleClass}><MinusCircle className="w-5 h-5 text-red-600" /> Tempo Descontado</h2></div>
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4 rounded-r-md">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-red-500 mt-0.5" />
            <p className="text-xs text-red-800 leading-relaxed"><strong>Orientações para o Lançamento:</strong> Separe descontos anteriores e posteriores a 15/09/2020.</p>
          </div>
        </div>
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-gray-50 mb-3">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 border-b font-bold tracking-wider">
              <tr><th className="px-3 py-3 w-3/5">Tipo de Desconto</th><th className="px-3 py-3 w-1/5 text-center">Dias</th><th className="px-3 py-3 w-1/5 text-center">Ant. 15/09/20</th><th className="px-3 py-3 w-10"></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.descontos.map((desc) => (
                <tr key={desc.id} className="bg-white hover:bg-gray-50">
                  <td className="p-2">
                    <select value={desc.tipo} onChange={e => handleListUpdate<Desconto>('descontos', desc.id, 'tipo', e.target.value)} className="w-full text-xs border-gray-200 rounded p-2">
                      <option value="">Selecione...</option>
                      {OPCOES_DESCONTO.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" min="0" value={desc.dias} onChange={e => handleListUpdate<Desconto>('descontos', desc.id, 'dias', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-2 font-bold text-red-600" />
                  </td>
                  <td className="p-2 text-center">
                    <input type="checkbox" checked={desc.anteriorReforma} onChange={e => handleListUpdate<Desconto>('descontos', desc.id, 'anteriorReforma', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeDesconto(desc.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {formData.descontos.length > 0 && (
              <tfoot className="bg-red-50 font-bold text-[10px]">
                <tr><td className="p-2 text-red-800 uppercase">Total Ant. 15/09/20</td><td className="p-2 text-center text-red-700">{totalDescontoAnt} dias</td><td colSpan={2}></td></tr>
                <tr><td className="p-2 text-red-800 uppercase">Total Pos. 15/09/20</td><td className="p-2 text-center text-red-700">{totalDescontoPos} dias</td><td colSpan={2}></td></tr>
                <tr className="border-t border-red-100"><td className="p-2 text-red-900 uppercase bg-red-100/50">Total Geral Descontado</td><td className="p-2 text-center text-red-800 bg-red-100/50">{totalDescontoGeral} dias</td><td colSpan={2} className="bg-red-100/50"></td></tr>
              </tfoot>
            )}
          </table>
        </div>
        <div className="flex justify-end"><button onClick={addDesconto} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-red-50 shadow-sm"><Plus className="w-4 h-4" /> Adicionar Desconto</button></div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4"><h2 className={sectionTitleClass}><Award className="w-5 h-5 text-amber-600" /> Férias-Prêmio</h2></div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-md">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-900 leading-relaxed">
              Destinado para situações específicas onde o servidor possuir saldo de férias-prêmio não gozadas, adquiridas até <strong>15/12/1998 (EC 20/1998)</strong> e optar por contabilizar este saldo em dobro para aposentadoria. Deverá ser inserido o número de dias simples.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm bg-gray-50 mb-3">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-[10px] text-gray-700 uppercase bg-gray-100 border-b font-bold tracking-wider">
              <tr>
                <th className="px-3 py-3 w-4/5">Dados das Férias-Prêmio</th>
                <th className="px-3 py-3 w-1/5 text-center">Dias (Saldo Simples)</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {formData.feriasPremio.map((fp) => (
                <tr key={fp.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="p-2"><input type="text" placeholder="Ex: 1º Decênio Não Gozado" value={fp.descricao} onChange={e => handleListUpdate<FeriasPremio>('feriasPremio', fp.id, 'descricao', e.target.value)} className="w-full text-xs border-gray-200 rounded p-2" /></td>
                  <td className="p-2"><input type="number" min="0" value={fp.dias} onChange={e => handleListUpdate<FeriasPremio>('feriasPremio', fp.id, 'dias', Number(e.target.value))} className="w-full text-center text-xs border-gray-200 rounded p-2 font-bold text-amber-700" /></td>
                  <td className="p-2 text-center"><button onClick={() => removeFeriasPremio(fp.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
              {formData.feriasPremio.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400 text-xs italic">Nenhum saldo de férias-prêmio adicionado.</td></tr>}
            </tbody>
            {formData.feriasPremio.length > 0 && (
              <tfoot className="bg-amber-50 font-bold text-[10px]">
                <tr><td className="p-2 text-amber-800 uppercase">Total de Inserções (Soma simples)</td><td className="p-2 text-center text-amber-700">{totalFeriasPremioSimples.toLocaleString()} dias</td><td></td></tr>
                <tr className="border-t border-amber-100"><td className="p-2 text-amber-900 uppercase bg-amber-100/50">Total para Aposentadoria (Contado em Dobro)</td><td className="p-2 text-center text-amber-800 bg-amber-100/50">{totalFeriasPremioDobro.toLocaleString()} dias</td><td></td></tr>
              </tfoot>
            )}
          </table>
        </div>
        <div className="flex justify-end"><button onClick={addFeriasPremio} className="bg-white border border-amber-200 text-amber-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-amber-50 shadow-sm"><Plus className="w-4 h-4" /> Adicionar Férias-Prêmio</button></div>
      </section>

      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Critérios de Ingresso</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1 mb-2">Histórico</h3>
            <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-white transition-all"><input type="checkbox" name="ingressouAte2003" checked={formData.ingressouAte2003} onChange={handleChange} className="mt-0.5 w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium text-slate-700">Ingresso até 31/12/2003</span></label>
            <label className="flex items-start gap-3 p-2 rounded-lg hover:bg-white transition-all"><input type="checkbox" name="ingressouEntre2003e2020" checked={formData.ingressouEntre2003e2020} onChange={handleChange} className="mt-0.5 w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium text-slate-700">Ingresso entre 2004 e 2020</span></label>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-800 uppercase border-b border-blue-100 pb-1 mb-2">Requisitos</h3>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all"><input type="checkbox" name="dezAnosServicoPublico" checked={formData.dezAnosServicoPublico} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium text-slate-700">10 anos Svc. Público</span></label>
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all"><input type="checkbox" name="cincoAnosCargoEfetivo" checked={formData.cincoAnosCargoEfetivo} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium text-slate-700">5 anos Cargo Efetivo</span></label>
          </div>
        </div>
      </section>

      {/* SEÇÃO DE MEMÓRIA DE CÁLCULO PRÉVIA */}
      {preview && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Calculator className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-blue-900">Detalhamento da Memória de Cálculo</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PreviewBox title="1. Apuração de Dias (Fórmula Oficial)" icon={<Timer className="w-3.5 h-3.5" />}>
              <PreviewRow label="Idade Real" value={preview.tempos.idadeDias} subValue={preview.tempos.idadeFormatada} />
              <PreviewRow label="Tempo PMMG (Bruto)" value={preview.tempos.tempoServicoPMMGDias} subValue={preview.tempos.tempoServicoPMMGFormatado} />
              <PreviewRow label="(+) Total Averbado" value={preview.tempos.totalTempoAverbado} subValue={formatDaysToYMD(preview.tempos.totalTempoAverbado)} isPlus />
              <PreviewRow label="(+) Férias-Prêmio (Dobro)" value={preview.tempos.totalFeriasPremio} subValue={formatDaysToYMD(preview.tempos.totalFeriasPremio)} isPlus highlightColor="text-amber-600" />
              <PreviewRow label="(-) Total Descontado" value={preview.tempos.totalTempoDescontado} subValue={formatDaysToYMD(preview.tempos.totalTempoDescontado)} isMinus />
              <PreviewRow label="Contribuição Líquida" value={preview.tempos.tempoContribTotal} subValue={formatDaysToYMD(preview.tempos.tempoContribTotal)} isTotal />
              {formData.tipoServidor === 'PEBPM' && (
                <div className="bg-amber-50 px-3 py-1.5 text-[9px] font-bold text-amber-800 border-t border-amber-100 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" />
                  Regência Total: {preview.tempos.tempoRegenciaTotalAnos} anos (Averb: {preview.tempos.tempoRegenciaAverbadoAnos} anos + PMMG: {preview.tempos.tempoServicoPMMGAnos} anos)
                </div>
              )}
            </PreviewBox>

            <div className="space-y-4">
              <PreviewBox title="2. Cálculo de Pontos" icon={<Star className="w-3.5 h-3.5" />}>
                <PreviewRow label="Idade" value={preview.tempos.idadeDias} subValue={preview.tempos.idadeFormatada} />
                <PreviewRow label="Contribuição" value={preview.tempos.tempoContribTotal} subValue={formatDaysToYMD(preview.tempos.tempoContribTotal)} />
                <div className="flex justify-between items-center bg-amber-50 px-3 py-2 border-t border-amber-100">
                  <div className="text-[10px] font-black text-amber-900 uppercase">Soma Total (Pontos)</div>
                  <div className="text-right">
                    <div className="text-xs font-black text-amber-700">{preview.pontuacaoInteira} pts</div>
                    <div className="text-[9px] font-bold text-amber-600">{formatDaysToYMD(preview.tempos.idadeDias + preview.tempos.tempoContribTotal)}</div>
                  </div>
                </div>
              </PreviewBox>

              <PreviewBox title="3. Cálculo do Pedágio (EC 104/2020)" icon={<Scale className="w-3.5 h-3.5" />}>
                <PreviewRow label={`Meta (${preview.metaAnos} anos)`} value={preview.metaDias} subValue={`${preview.metaAnos} anos`} />
                <PreviewRow label="Tempo no Corte (2020)" value={preview.infoPedagio.tempoNoCorte} subValue={formatDaysToYMD(preview.infoPedagio.tempoNoCorte)} />
                <PreviewRow label="Saldo no Corte" value={preview.infoPedagio.saldoNoCorte} subValue={formatDaysToYMD(preview.infoPedagio.saldoNoCorte)} />
                <PreviewRow label="Cumprido Pós-Reforma" value={preview.diasCumpridosPosCorte} subValue={formatDaysToYMD(preview.diasCumpridosPosCorte)} highlightColor="text-emerald-600" />
                <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 border-t border-indigo-100">
                  <div className="text-[10px] font-black text-indigo-900 uppercase">Pedágio Devido (50%)</div>
                  <div className="text-right">
                    <div className="text-xs font-black text-indigo-700">{preview.infoPedagio.pedagio.toLocaleString()} d</div>
                    <div className="text-[9px] font-bold text-indigo-600">{formatDaysToYMD(preview.infoPedagio.pedagio)}</div>
                  </div>
                </div>
              </PreviewBox>
            </div>
          </div>
        </section>
      )}

      <div className="pt-4 flex flex-col items-center gap-4">
        {canPreview && (
          <button 
            onClick={() => setIsAuditModalOpen(true)}
            className="text-blue-600 font-bold text-sm flex items-center gap-2 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
          >
            <FileCheck className="w-4 h-4" />
            Exibir Detalhamento Técnico dos Cálculos
          </button>
        )}

        <button onClick={onCalculate} className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg active:scale-[0.98]">
          Gerar Simulação
        </button>
      </div>

      <TechnicalAuditModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        previewData={preview}
        formData={formData}
      />
    </div>
  );
};

export default InputForm;