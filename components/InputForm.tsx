import React, { useState } from 'react';
import { FormData, ServerType, Gender, Period, DiscountPeriod } from '../types';
import { Plus, Trash2, Calendar, User, Briefcase, FileText } from 'lucide-react';
import { diffInDays, parseDate } from '../utils/dateHelpers';

interface Props {
  onCalculate: (data: FormData) => void;
}

const InputForm: React.FC<Props> = ({ onCalculate }) => {
  const [formData, setFormData] = useState<FormData>({
    serverType: ServerType.SELECT,
    gender: Gender.SELECT,
    simulationDate: new Date().toISOString().split('T')[0],
    birthDate: '',
    admissionDate: '',
    averbedPeriods: [],
    discountPeriods: [],
    entryPublicServiceBefore2003: false,
    entryPublicService2003to2020: false,
    tenYearsPublicService: false,
    fiveYearsPosition: false,
    exclusiveRegencyTime: 0
  });

  const [newAverbed, setNewAverbed] = useState({ name: '', start: '', end: '' });
  const [newDiscount, setNewDiscount] = useState({ type: 'Faltas ao serviço', start: '', end: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addAverbed = () => {
    if (!newAverbed.name || !newAverbed.start || !newAverbed.end) return;
    // Add +1 for inclusive dates (start to end includes both days)
    const days = diffInDays(parseDate(newAverbed.start), parseDate(newAverbed.end)) + 1;
    const newItem: Period = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAverbed.name,
      startDate: newAverbed.start,
      endDate: newAverbed.end,
      days
    };
    setFormData(prev => ({ ...prev, averbedPeriods: [...prev.averbedPeriods, newItem] }));
    setNewAverbed({ name: '', start: '', end: '' });
  };

  const addDiscount = () => {
    if (!newDiscount.type || !newDiscount.start || !newDiscount.end) return;
    // Add +1 for inclusive dates
    const days = diffInDays(parseDate(newDiscount.start), parseDate(newDiscount.end)) + 1;
    const newItem: DiscountPeriod = {
      id: Math.random().toString(36).substr(2, 9),
      type: newDiscount.type,
      startDate: newDiscount.start,
      endDate: newDiscount.end,
      days
    };
    setFormData(prev => ({ ...prev, discountPeriods: [...prev.discountPeriods, newItem] }));
    setNewDiscount(prev => ({ ...prev, start: '', end: '' }));
  };

  const removeAverbed = (id: string) => {
    setFormData(prev => ({ ...prev, averbedPeriods: prev.averbedPeriods.filter(p => p.id !== id) }));
  };

  const removeDiscount = (id: string) => {
    setFormData(prev => ({ ...prev, discountPeriods: prev.discountPeriods.filter(p => p.id !== id) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.serverType === ServerType.SELECT || formData.gender === Gender.SELECT || !formData.birthDate || !formData.admissionDate) {
      alert("Por favor preencha todos os campos obrigatórios.");
      return;
    }
    onCalculate(formData);
  };

  // Altura padronizada para h-10 (40px). [color-scheme:light] garante que o ícone do calendário seja escuro.
  const inputClass = "w-full border border-gray-300 rounded-md px-3 h-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors text-gray-900 [color-scheme:light]";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-8 print:hidden">
      
      {/* Seção 1: Dados Pessoais */}
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <User className="w-5 h-5" /> Dados do Servidor
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servidor</label>
            <select 
              name="serverType" 
              value={formData.serverType} 
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione</option>
              {Object.values(ServerType).map(t => t && <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Selecione</option>
              {Object.values(Gender).map(g => g && <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data da Simulação</label>
            <input 
              type="date" 
              name="simulationDate" 
              value={formData.simulationDate} 
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input 
              type="date" 
              name="birthDate" 
              value={formData.birthDate} 
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Inclusão PMMG</label>
            <input 
              type="date" 
              name="admissionDate" 
              value={formData.admissionDate} 
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Seção 2: Averbações */}
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5" /> Tempo Averbado
        </h2>
        
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Descrição</label>
              <input 
                type="text" 
                placeholder="Nome da Averbação" 
                value={newAverbed.name}
                onChange={e => setNewAverbed({...newAverbed, name: e.target.value})}
                className={`${inputClass} bg-white`}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Data Inicial</label>
              <input 
                type="date" 
                value={newAverbed.start}
                onChange={e => setNewAverbed({...newAverbed, start: e.target.value})}
                className={`${inputClass} bg-white`}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Data Final</label>
              <input 
                type="date" 
                value={newAverbed.end}
                onChange={e => setNewAverbed({...newAverbed, end: e.target.value})}
                className={`${inputClass} bg-white`}
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="button" 
                onClick={addAverbed}
                className="bg-blue-600 text-white rounded h-10 w-full font-medium hover:bg-blue-700 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {formData.averbedPeriods.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.averbedPeriods.map(p => (
                <li key={p.id} className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-3 rounded shadow-sm border text-sm gap-2">
                  <div className="font-medium text-gray-800">{p.name}</div>
                  <div className="text-gray-600">
                     {new Date(p.startDate).toLocaleDateString('pt-BR')} até {new Date(p.endDate).toLocaleDateString('pt-BR')} 
                     <span className="ml-2 font-bold text-blue-800">({p.days} dias)</span>
                  </div>
                  <button type="button" onClick={() => removeAverbed(p.id)} className="text-red-500 hover:text-red-700 self-end md:self-auto"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Seção 3: Descontos */}
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Tempo Descontado
        </h2>
        
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Tipo de Desconto</label>
              <select 
                value={newDiscount.type}
                onChange={e => setNewDiscount({...newDiscount, type: e.target.value})}
                className={`${inputClass} bg-white`}
              >
                <option>Faltas ao serviço</option>
                <option>Licença interesse particular (sem contribuição)</option>
                <option>Suspensões</option>
                <option>Afastamento preliminar indevido</option>
                <option>Licença pessoa doente da família</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Data Inicial</label>
              <input 
                type="date" 
                value={newDiscount.start}
                onChange={e => setNewDiscount({...newDiscount, start: e.target.value})}
                className={`${inputClass} bg-white`}
              />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-gray-500 mb-1 block ml-1">Data Final</label>
              <input 
                type="date" 
                value={newDiscount.end}
                onChange={e => setNewDiscount({...newDiscount, end: e.target.value})}
                className={`${inputClass} bg-white`}
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="button" 
                onClick={addDiscount}
                className="bg-red-600 text-white rounded h-10 w-full font-medium hover:bg-red-700 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>
          </div>

          {formData.discountPeriods.length > 0 && (
            <ul className="mt-2 space-y-2">
              {formData.discountPeriods.map(p => (
                <li key={p.id} className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-3 rounded shadow-sm border text-sm gap-2">
                  <div className="font-medium text-gray-800">{p.type}</div>
                  <div className="text-gray-600">
                    {new Date(p.startDate).toLocaleDateString('pt-BR')} até {new Date(p.endDate).toLocaleDateString('pt-BR')}
                    <span className="ml-2 font-bold text-red-800">({p.days} dias)</span>
                  </div>
                  <button type="button" onClick={() => removeDiscount(p.id)} className="text-red-500 hover:text-red-700 self-end md:self-auto"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Seção 4: Outros Dados */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Informações Complementares
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded hover:bg-gray-50 cursor-pointer bg-white">
            <input type="checkbox" name="entryPublicServiceBefore2003" checked={formData.entryPublicServiceBefore2003} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Ingressou no serviço público até 31/12/2003?</span>
          </label>

          <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded hover:bg-gray-50 cursor-pointer bg-white">
            <input type="checkbox" name="entryPublicService2003to2020" checked={formData.entryPublicService2003to2020} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Ingressou no serviço público após 31/12/2003 e até 15/09/2020?</span>
          </label>

          <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded hover:bg-gray-50 cursor-pointer bg-white">
            <input type="checkbox" name="tenYearsPublicService" checked={formData.tenYearsPublicService} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Possui 10 anos de Tempo no Serviço Público?</span>
          </label>

          <label className="flex items-center space-x-2 border border-gray-200 p-3 rounded hover:bg-gray-50 cursor-pointer bg-white">
            <input type="checkbox" name="fiveYearsPosition" checked={formData.fiveYearsPosition} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Possui 5 anos no cargo efetivo da aposentadoria?</span>
          </label>

          {formData.serverType === ServerType.PEBPM && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Exclusivo de Regência (Anos)</label>
              <input 
                type="number" 
                name="exclusiveRegencyTime" 
                value={formData.exclusiveRegencyTime} 
                onChange={handleChange}
                className={inputClass}
                min="0"
              />
            </div>
          )}
        </div>
      </section>

      <div className="pt-4">
        <button type="submit" className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded hover:bg-blue-800 transition duration-300">
          Calcular Simulação
        </button>
      </div>
    </form>
  );
};

export default InputForm;