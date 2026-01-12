import React from 'react';
import { FormState, Averbação, Desconto, TipoServidor, Sexo } from '../types';
import { Plus, Trash2, Calendar, User, Briefcase, MinusCircle } from 'lucide-react';
import { diffInDays, parseISO } from '../utils/dateHelpers';

interface Props {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  onCalculate: () => void;
}

const InputForm: React.FC<Props> = ({ formData, setFormData, onCalculate }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const addAverbacao = () => {
    const newAv: Averbação = {
      id: crypto.randomUUID(),
      nome: '',
      dataInicial: '',
      dataFinal: '',
      regime: 'RGPS',
      origem: '',
      funcao: '',
      dias: 0
    };
    setFormData(prev => ({ ...prev, averbacoes: [...prev.averbacoes, newAv] }));
  };

  const updateAverbacao = (id: string, field: keyof Averbação, value: string) => {
    setFormData(prev => ({
      ...prev,
      averbacoes: prev.averbacoes.map(av => {
        if (av.id === id) {
          const updated = { ...av, [field]: value };
          if (updated.dataInicial && updated.dataFinal) {
            updated.dias = diffInDays(parseISO(updated.dataInicial), parseISO(updated.dataFinal));
          }
          return updated;
        }
        return av;
      })
    }));
  };

  const removeAverbacao = (id: string) => {
    setFormData(prev => ({ ...prev, averbacoes: prev.averbacoes.filter(a => a.id !== id) }));
  };

  const addDesconto = () => {
    const newDesc: Desconto = {
      id: crypto.randomUUID(),
      tipo: 'Faltas ao serviço',
      dataInicial: '',
      dataFinal: '',
      dias: 0
    };
    setFormData(prev => ({ ...prev, descontos: [...prev.descontos, newDesc] }));
  };

  const updateDesconto = (id: string, field: keyof Desconto, value: string) => {
    setFormData(prev => ({
      ...prev,
      descontos: prev.descontos.map(d => {
        if (d.id === id) {
          const updated = { ...d, [field]: value };
          if (updated.dataInicial && updated.dataFinal) {
            updated.dias = diffInDays(parseISO(updated.dataInicial), parseISO(updated.dataFinal));
          }
          return updated;
        }
        return d;
      })
    }));
  };

  // Classe padrão para todos os inputs e selects garantindo fundo branco e texto escuro
  const inputClass = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white text-gray-900";

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 no-print">
      <section>
        <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Dados Identificadores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Servidor</label>
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
            <label className="block text-sm font-medium text-gray-700">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}>
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Datas de Referência
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data da Simulação</label>
            <input type="date" name="dataSimulacao" value={formData.dataSimulacao} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
            <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Inclusão PMMG</label>
            <input type="date" name="dataInclusaoPMMG" value={formData.dataInclusaoPMMG} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Tempo Averbado
          </h2>
          <button onClick={addAverbacao} className="bg-blue-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        <div className="space-y-4">
          {formData.averbacoes.map((av) => (
            <div key={av.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
              <button onClick={() => removeAverbacao(av.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Nome da Averbação" value={av.nome} onChange={(e) => updateAverbacao(av.id, 'nome', e.target.value)} className={inputClass} />
                <input type="date" value={av.dataInicial} onChange={(e) => updateAverbacao(av.id, 'dataInicial', e.target.value)} className={inputClass} />
                <input type="date" value={av.dataFinal} onChange={(e) => updateAverbacao(av.id, 'dataFinal', e.target.value)} className={inputClass} />
                <select value={av.regime} onChange={(e) => updateAverbacao(av.id, 'regime', e.target.value)} className={inputClass}>
                  <option value="RGPS">RGPS</option>
                  <option value="RPPS">RPPS</option>
                </select>
                <input placeholder="Origem" value={av.origem} onChange={(e) => updateAverbacao(av.id, 'origem', e.target.value)} className={inputClass} />
                <input placeholder="Função" value={av.funcao} onChange={(e) => updateAverbacao(av.id, 'funcao', e.target.value)} className={inputClass} />
              </div>
              <p className="mt-2 text-sm text-gray-500 font-medium">Dias calculados: {av.dias}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
            <MinusCircle className="w-5 h-5" /> Descontos
          </h2>
          <button onClick={addDesconto} className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-red-700 transition">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        <div className="space-y-4">
          {formData.descontos.map((desc) => (
            <div key={desc.id} className="p-4 bg-red-50 rounded-lg border border-red-100 relative">
              <button onClick={() => setFormData(prev => ({ ...prev, descontos: prev.descontos.filter(d => d.id !== desc.id) }))} className="absolute top-2 right-2 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={desc.tipo} onChange={(e) => updateDesconto(desc.id, 'tipo', e.target.value)} className={inputClass}>
                  <option>Faltas ao serviço</option>
                  <option>LIP sem contribuição</option>
                  <option>Suspensões</option>
                  <option>Afastamento indevido</option>
                  <option>Licença pessoa doente família</option>
                </select>
                <input type="date" value={desc.dataInicial} onChange={(e) => updateDesconto(desc.id, 'dataInicial', e.target.value)} className={inputClass} />
                <input type="date" value={desc.dataFinal} onChange={(e) => updateDesconto(desc.id, 'dataFinal', e.target.value)} className={inputClass} />
              </div>
              <p className="mt-2 text-sm text-red-600 font-medium">Dias descontados: {desc.dias}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="ingressouAte2003" checked={formData.ingressouAte2003} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition">Ingressou em cargo efetivo até 31/12/2003</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="ingressouEntre2003e2020" checked={formData.ingressouEntre2003e2020} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition">Ingressou entre 31/12/2003 e 15/09/2020</span>
          </label>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="dezAnosServicoPublico" checked={formData.dezAnosServicoPublico} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition">Possui 10 anos de Serviço Público</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="cincoAnosCargoEfetivo" checked={formData.cincoAnosCargoEfetivo} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-800 transition">Possui 05 anos no cargo atual</span>
          </label>
          {formData.tipoServidor === 'PEBPM' && (
            <div className="mt-2">
              <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider">Anos de Regência (Exclusivo)</label>
              <input type="number" name="tempoRegencia" value={formData.tempoRegencia} onChange={handleChange} className={inputClass} />
            </div>
          )}
        </div>
      </section>

      <button onClick={onCalculate} className="w-full bg-blue-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
        Gerar Simulação de Aposentadoria
      </button>
    </div>
  );
};

export default InputForm;