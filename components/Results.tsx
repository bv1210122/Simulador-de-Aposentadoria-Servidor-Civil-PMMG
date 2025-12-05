import React from 'react';
import { CalculationResult, FormData, RuleCheck } from '../types';
import { formatDatePTBR, parseDate } from '../utils/dateHelpers';
import { Printer, CheckCircle, XCircle, AlertTriangle, Calculator } from 'lucide-react';

interface Props {
  data: FormData;
  result: CalculationResult;
  onBack: () => void;
}

const Results: React.FC<Props> = ({ data, result, onBack }) => {

  const handlePrint = () => {
    // Salva o título original da página
    const originalTitle = document.title;
    
    // Define um título temporário para que o arquivo PDF tenha um nome sugerido correto
    const dateStr = data.simulationDate.replace(/-/g, '');
    document.title = `Simulacao_Aposentadoria_PMMG_${dateStr}`;
    
    // Abre a janela de impressão
    window.print();
    
    // Restaura o título original após um breve delay (para garantir que a janela de impressão capturou o novo título)
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const RuleTable = ({ rules, title }: { rules: RuleCheck[], title: string }) => (
    <div className="mb-6 break-inside-avoid">
      <h3 className="text-lg font-bold text-gray-800 mb-2 border-b-2 border-gray-300 pb-1">{title}</h3>
      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <div key={idx} className={`border rounded-lg p-4 ${rule.met ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900">{rule.name}</h4>
              {rule.met ? <CheckCircle className="text-green-600 w-5 h-5" /> : <XCircle className="text-red-600 w-5 h-5" />}
            </div>
            <p className="text-xs text-gray-500 mb-2 italic">{rule.details}</p>
            <table className="w-full text-sm">
              <tbody>
                {rule.requirements.map((req, rIdx) => (
                  <tr key={rIdx} className="border-b last:border-0 border-gray-200/50">
                    <td className="py-1 text-gray-600">{req.label}</td>
                    <td className="py-1 font-medium text-right">{req.value}</td>
                    <td className="py-1 w-6 text-center">
                      {req.status === 'ok' && <span className="text-green-600">✓</span>}
                      {req.status === 'fail' && <span className="text-red-600">✗</span>}
                      {req.status === 'info' && <span className="text-blue-600">ℹ</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto print:shadow-none print:w-full">
      
      {/* Header Print Only */}
      <div className="hidden print:block text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold uppercase">Polícia Militar de Minas Gerais</h1>
        <h2 className="text-lg">Simulação de Aposentadoria - Servidor Civil</h2>
        <p className="text-sm text-gray-600">Data da Simulação: {formatDatePTBR(new Date(data.simulationDate))}</p>
      </div>

      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-blue-900">Resultado da Simulação</h2>
        <div className="space-x-4">
           <button type="button" onClick={onBack} className="text-gray-600 hover:text-gray-900 underline">Voltar</button>
           <button type="button" onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors">
             <Printer className="w-4 h-4" /> Imprimir / PDF
           </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div>
          <span className="block text-xs text-gray-500 uppercase">Idade</span>
          <span className="font-bold text-lg">{result.age.years} anos, {result.age.days} dias</span>
        </div>
        <div>
           <span className="block text-xs text-gray-500 uppercase">Tempo de Contribuição</span>
           <span className="font-bold text-lg">{result.contributionTime.years} anos, {result.contributionTime.days} dias</span>
        </div>
        <div>
           <span className="block text-xs text-gray-500 uppercase">Pontuação</span>
           <span className="font-bold text-lg">{result.points.display}</span>
        </div>
        <div>
           <span className="block text-xs text-gray-500 uppercase">Pedágio a Cumprir</span>
           <span className="font-bold text-lg">{result.toll.tollValue} dias</span>
           <div className="text-xs text-gray-500 mt-1">Total Necessário (Base + Pedágio): {result.toll.totalToServe} dias</div>
           <div className="text-sm font-bold text-blue-800 mt-1 bg-blue-100 px-2 py-1 rounded inline-block">
             Data Prevista: {result.toll.retirementDate}
           </div>
        </div>
      </div>

      {/* Detalhamento dos Dados e Cálculos */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600"/>
          Detalhamento dos Dados e Cálculos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          {/* Column 1: Input Data */}
          <div>
            <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-100 pb-1">Dados Informados</h4>
            <ul className="space-y-1 text-gray-700">
              <li><span className="font-medium">Tipo:</span> {data.serverType}</li>
              <li><span className="font-medium">Gênero:</span> {data.gender}</li>
              <li><span className="font-medium">Data Nascimento:</span> {formatDatePTBR(parseDate(data.birthDate))}</li>
              <li><span className="font-medium">Data Admissão:</span> {formatDatePTBR(parseDate(data.admissionDate))}</li>
              <li><span className="font-medium">Ingresso até 2003:</span> {data.entryPublicServiceBefore2003 ? 'Sim' : 'Não'}</li>
              <li><span className="font-medium">Ingresso 2004-2020:</span> {data.entryPublicService2003to2020 ? 'Sim' : 'Não'}</li>
            </ul>
          </div>

          {/* Column 2: Time Calculation Memory */}
          <div>
             <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-100 pb-1">Memória de Cálculo do Tempo</h4>
             <ul className="space-y-1 text-gray-700">
               <li className="flex justify-between"><span>Tempo Bruto (PMMG):</span> <span>{result.grossTimePMMG} dias</span></li>
               <li className="flex justify-between text-red-600"><span>(-) Descontos:</span> <span>{result.totalDiscount} dias</span></li>
               <li className="flex justify-between text-blue-600"><span>(+) Averbado:</span> <span>{result.totalAverbed} dias</span></li>
               <li className="flex justify-between font-bold border-t border-gray-200 pt-1 mt-1">
                 <span>= Tempo Contribuição:</span> 
                 <span>{result.contributionTime.totalDays} dias</span>
               </li>
               <li className="text-xs text-gray-500 text-right">({result.contributionTime.years} anos, {result.contributionTime.days} dias)</li>
             </ul>
          </div>

          {/* Column 3: Toll Calculation Memory */}
          <div className="md:col-span-2 mt-2">
             <h4 className="font-semibold text-blue-900 mb-2 border-b border-blue-100 pb-1">Cálculo do Pedágio (EC 104/2020)</h4>
             <div className="bg-gray-50 p-3 rounded text-gray-700 space-y-2">
               <div className="flex justify-between">
                 <span>Tempo Base Exigido (30/35 anos):</span>
                 <span className="font-medium">{result.toll.required} dias</span>
               </div>
               <div className="flex justify-between">
                 <span>Tempo Cumprido em 15/09/2020:</span>
                 <span className="font-medium">{result.toll.accumulatedOnBaseDate} dias</span>
               </div>
               <div className="flex justify-between text-red-700">
                 <span>Déficit em 15/09/2020:</span>
                 <span className="font-medium">{result.toll.deficit} dias</span>
               </div>
               <div className="flex justify-between text-blue-800">
                 <span>Pedágio (50% do Déficit):</span>
                 <span className="font-medium">+ {result.toll.tollValue} dias</span>
               </div>
               <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-1">
                 <span>Total Necessário na Carreira:</span>
                 <span>{result.toll.totalToServe} dias</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-6">
        <RuleTable title="Regras de Transição por Pontos" rules={result.rules.points} />
        <RuleTable title="Regras de Transição por Pedágio" rules={result.rules.toll} />
        <RuleTable title="Regras Permanentes" rules={result.rules.permanent} />
        
        <div className="break-inside-avoid mb-6 border-l-4 border-yellow-500 bg-yellow-50 p-4">
           <h3 className="font-bold text-yellow-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Aposentadoria Compulsória</h3>
           <p className="text-sm mt-1">
             O servidor completará 75 anos de idade na data de <strong>{result.compulsoryDate}</strong>. 
             Após essa idade o servidor é obrigado a se afastar, independentemente de ter cumprido os demais requisitos previstos em lei para aposentar-se. 
             A unidade deverá considerar a data de aniversário dos 75 anos como data do final do efetivo exercício.
           </p>
        </div>
      </div>

      {/* Final Conclusion */}
      <div className={`mt-8 p-6 rounded-lg border-2 text-center break-inside-avoid ${result.isQualified ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
           {result.isQualified ? <CheckCircle className="w-8 h-8 text-green-600"/> : <XCircle className="w-8 h-8 text-red-600"/>}
           Conclusão
        </h3>
        <p className="text-lg">
          {result.isQualified 
            ? `✅ O servidor, na data da simulação (${formatDatePTBR(new Date(data.simulationDate))}), cumpre os requisitos e poderá solicitar a aposentadoria nas modalidades: ${result.qualifiedModalities.join(', ')}.`
            : `❌ O servidor, na data da simulação (${formatDatePTBR(new Date(data.simulationDate))}), não cumpre cumulativamente requisitos para poder requerer a aposentadoria em nenhuma das modalidades previstas na Emenda Constitucional n. 104/2020.`
          }
        </p>
      </div>

      {/* Documentation */}
      <div className="mt-8 break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Documentação Necessária para Averbação/Aposentadoria</h3>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Requerimento preenchido e assinado;</li>
          <li>Certidão de Tempo de Contribuição (CTC) original (se houver tempo averbado do INSS ou outros regimes);</li>
          <li>Cópia de identidade e CPF;</li>
          <li>Último contracheque;</li>
          <li>Comprovante de endereço atualizado;</li>
          <li>Declaração de bens e valores;</li>
          <li>Declaração de não acumulação de cargos (ou de acumulação lícita);</li>
        </ul>
      </div>

      {/* Footer / Disclaimer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
        <p className="mb-2">
          <strong>DISCLAIMER:</strong> Trata-se de informações de caráter meramente informativas e não substitui a análise oficial do Centro de Administração de Servidor Civil / Diretoria de Recursos Humanos.
        </p>
        <p>© 2025 Polícia Militar de Minas Gerais.</p>
      </div>

    </div>
  );
};

export default Results;