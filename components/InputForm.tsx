
import React, { useState, useEffect } from 'react';
import { FormState, Averbação, Desconto, TipoServidor, Sexo } from '../types';
import { Plus, Trash2, Calendar, User, Briefcase, CheckCircle2, MinusCircle, Calculator, Info, History, Star, ShieldAlert } from 'lucide-react';
import { parseISO, calculatePMMGPeriod, formatDaysToYMD } from '../utils/dateHelpers';
import { apurarTemposBasicos } from '../utils/calculators/temposBasicos';
import { calcularPedagio50 } from '../utils/calculators/pedagio';

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
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
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

    const tempos = apurarTemposBasicos(formData);
    const isProfessor = formData.tipoServidor === 'PEBPM';
    const isHomem = formData.sexo === 'Masculino';
    const metaAnos = (isProfessor ? (isHomem ? 30 : 25) : (isHomem ? 35 : 30));
    const metaTempoGeral = metaAnos * 365;
    const dInc = parseISO(formData.dataInclusaoPMMG);
    const pedagioInfo = calcularPedagio50(dInc, metaTempoGeral);

    return (
      <section className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner space-y-6">
        <h2 className={sectionTitleClass}>
           <Calculator className="w-5 h-5" /> Detalhamento da Memória de Cálculo
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
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
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" /> 2. Cálculo de Pontos
              </h3>
              <div className="text-xs space-y-2">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Idade (em dias)</span>
                  <span className="font-mono">{tempos.idadeDias.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Contribuição (em dias)</span>
                  <span className="font-mono">{tempos.tempoContribTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 border-t border-gray-200 font-bold text-gray-800 mt-2">
                  <span>Soma Total (Dias)</span>
                  <span>{tempos.pontuacaoTotalDias.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 border border-amber-100 rounded mt-2">
                  <span className="text-amber-800 font-bold uppercase">Pontuação Final (Anos Inteiros)</span>
                  <div className="text-right">
                     <span className="text-lg font-black text-amber-600">{tempos.pontuacaoInteira}</span>
                     <span className="text-[9px] text-amber-500 block">({tempos.pontuacaoTotalDias} ÷ 365)</span>
                  </div>
                </div>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <button onClick={onCalculate} className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl">Gerar Simulação de Aposentadoria</button>
    </div>
  );
};

export default InputForm;
