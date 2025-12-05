import React, { useState } from 'react';
import InputForm from './components/InputForm';
import Results from './components/Results';
import { FormData, CalculationResult } from './types';
import { calculateRetirement } from './utils/calculator';
import { ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleCalculate = (data: FormData) => {
    const calcResult = calculateRetirement(data);
    setFormData(data);
    setResult(calcResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-12">
      
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg print:hidden">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <div className="bg-white p-2 rounded-full text-blue-900">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simulador de Aposentadoria PMMG</h1>
            <p className="text-blue-200 text-sm">Servidores Civis - Emenda Constitucional n. 104/2020</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        {!result ? (
          <div className="max-w-4xl mx-auto">
             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-900 text-sm">
               <p className="font-bold">Bem-vindo ao Simulador</p>
               <p>Preencha os dados abaixo com atenção. As datas devem ser exatas conforme consta em seus assentamentos funcionais.</p>
             </div>
             <InputForm onCalculate={handleCalculate} />
          </div>
        ) : (
          formData && <Results data={formData} result={result} onBack={handleBack} />
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm pb-6 print:hidden">
        &copy; 2025 Polícia Militar de Minas Gerais. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default App;