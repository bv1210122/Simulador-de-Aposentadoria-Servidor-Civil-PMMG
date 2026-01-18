
import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import { FormState, CalculosFinais, RegraResultado } from './types';
import { calculateResults } from './utils/calculator';
import { ShieldCheck } from 'lucide-react';

/**
 * Função utilitária para capturar a data de hoje no fuso local do navegador
 * e formatar como AAAA-MM-DD para o valor inicial dos inputs de data.
 */
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Estado Inicial do Formulário de Aposentadoria.
 */
const initialForm: FormState = {
  tipoServidor: '',
  sexo: '',
  dataSimulacao: getLocalDateString(),
  dataNascimento: '',
  dataInclusaoPMMG: '',
  averbacoes: [],
  descontos: [],
  ingressouAte2003: false,
  ingressouEntre2003e2020: false,
  dezAnosServicoPublico: false,
  cincoAnosCargoEfetivo: false,
  tempoRegencia: 0
};

/**
 * Componente Raiz da Aplicação.
 * Gerencia a alternância entre a tela de entrada de dados e a tela de resultados.
 */
const App: React.FC = () => {
  // Estado que armazena os dados digitados pelo usuário
  const [formData, setFormData] = useState<FormState>(initialForm);
  // Estado que armazena os resultados processados após o clique em "Calcular"
  const [results, setResults] = useState<{ calc: CalculosFinais; regras: RegraResultado[] } | null>(null);

  /**
   * Valida se os campos obrigatórios estão preenchidos e dispara o motor de cálculo.
   */
  const handleCalculate = () => {
    if (!formData.tipoServidor || !formData.sexo || !formData.dataNascimento || !formData.dataInclusaoPMMG) {
      alert("Por favor, preencha todos os campos obrigatórios (Tipo, Sexo, Nascimento e Inclusão).");
      return;
    }
    // Executa a lógica de cálculo exportada do utils/calculator
    const res = calculateResults(formData);
    setResults(res);
    // Move o usuário para o topo para ver o início dos resultados
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30">
      {/* Cabeçalho Fixo - Oculto na impressão */}
      <header className="bg-slate-800 text-white py-6 px-4 no-print border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="bg-slate-700 p-2 rounded-lg border border-slate-600">
             <ShieldCheck className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">PMMG</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Simulador de Aposentadoria • Servidor Civil</p>
          </div>
        </div>
      </header>

      {/* Área de Conteúdo Principal */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:py-8">
        {!results ? (
          // Se não há resultados, exibe o formulário
          <InputForm formData={formData} setFormData={setFormData} onCalculate={handleCalculate} />
        ) : (
          // Se há resultados, exibe o relatório detalhado
          <div>
            <button onClick={() => setResults(null)} className="mb-6 text-slate-500 font-bold hover:text-slate-800 text-sm flex items-center gap-1 no-print transition-colors">
              ← Ajustar Dados
            </button>
            <Results data={formData} calc={results.calc} regras={results.regras} />
          </div>
        )}
      </main>

      {/* Rodapé com Aviso Legal */}
      <footer className="bg-white border-t border-slate-100 py-10 px-4 text-center no-print">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-[9px] text-slate-400 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest font-bold">
            AVISO: Informações de caráter estritamente informativo. Os resultados não vinculam a administração pública 
            e não substituem a análise documental oficial do Centro de Administração de Servidor Civil / DRH.
          </p>
          <div className="pt-4 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">© 2026 Polícia Militar de Minas Gerais</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
