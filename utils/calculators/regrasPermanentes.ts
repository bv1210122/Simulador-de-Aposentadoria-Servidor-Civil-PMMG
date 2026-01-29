import { FormState, RegraResultado } from '../../types';
import { formatDateBR } from '../calculoDatas';
import { createReq } from './helper';

export const avaliarRegrasPermanentes = (
  data: FormState,
  dataSimulacao: Date,
  dataCompulsoria: Date,
  idadeAnos: number,
  tempoContribAnos: number
): RegraResultado[] => {
  const isHomem = data.sexo === 'Masculino';
  const isProfessor = data.tipoServidor === 'PEBPM';
  const regras: RegraResultado[] = [];

  // Requisitos Comuns para Permanentes 1 e 2
  const cumpre10AnosPublico = data.dezAnosServicoPublico;
  const cumpre5AnosCargo = data.cincoAnosCargoEfetivo;

  // 1. Regra Permanente 1 - Regra permanente geral - Média permanente - Sem paridade
  const idadeGeral = isHomem ? 65 : 62;
  const cumpreIdadeGeral = idadeAnos >= idadeGeral;
  const cumpreContribGeral = tempoContribAnos >= 25;
  const cumpreR1 = cumpreIdadeGeral && cumpreContribGeral && cumpre10AnosPublico && cumpre5AnosCargo;

  regras.push({
    nome: "Regra Permanente 1 - Regra permanente geral - Média permanente - Sem paridade",
    descricao: "Regra definitiva pós-reforma para cargos gerais. Cálculo baseado na média das contribuições.",
    cumpre: cumpreR1,
    requisitos: [
      createReq("É professor (PEBPM)", isProfessor ? "Sim" : "Não", isProfessor ? "Sim" : "Não", true),
      createReq("Idade mínima", idadeGeral, idadeAnos, cumpreIdadeGeral),
      createReq("Tempo mínimo de contribuição", 25, tempoContribAnos, cumpreContribGeral),
      createReq("Tempo no serviço público (10a)", "10 anos", cumpre10AnosPublico ? "Sim" : "Não", cumpre10AnosPublico),
      createReq("Tempo no cargo efetivo (5a)", "05 anos", cumpre5AnosCargo ? "Sim" : "Não", cumpre5AnosCargo)
    ]
  });

  // 2. Regra Permanente 2 - Regra permanente especial de professor - Média permanente - Sem paridade
  if (!isProfessor) {
    regras.push({
      nome: "Regra Permanente 2 - Regra permanente especial de professor - Média permanente - Sem paridade",
      descricao: "Essa regra somente se aplica apenas a Professores.",
      cumpre: false,
      requisitos: [
        createReq("É professor (PEBPM)", "Sim", "Não", false)
      ]
    });
  } else {
    const idadeProf = isHomem ? 60 : 57;
    const cumpreIdadeProf = idadeAnos >= idadeProf;
    const cumpreRegencia = data.TempoDeRegência >= 25;
    const cumpreR2 = cumpreIdadeProf && cumpreRegencia && cumpre10AnosPublico && cumpre5AnosCargo;

    regras.push({
      nome: "Regra Permanente 2 - Regra permanente especial de professor - Média permanente - Sem paridade",
      descricao: "Regra definitiva para PEBPM. Exige efetivo exercício na regência.",
      cumpre: cumpreR2,
      requisitos: [
        createReq("É professor (PEBPM)", "Sim", "Sim", true),
        createReq("Idade mínima", idadeProf, idadeAnos, cumpreIdadeProf),
        createReq("Tempo mínimo de contribuição (Regência)", 25, data.TempoDeRegência, cumpreRegencia),
        createReq("Tempo no serviço público (10a)", "10 anos", cumpre10AnosPublico ? "Sim" : "Não", cumpre10AnosPublico),
        createReq("Tempo no cargo efetivo (5a)", "05 anos", cumpre5AnosCargo ? "Sim" : "Não", cumpre5AnosCargo)
      ]
    });
  }

  // 3. Regra Permanente 3 - Compulsória - Média proporcional - Sem paridade
  const compulsoriaAtingida = dataSimulacao.getTime() >= dataCompulsoria.getTime();
  const dataFormatada75 = formatDateBR(dataCompulsoria);
  
  regras.push({
    nome: "Regra Permanente 3 - Compulsória - Média proporcional - Sem paridade",
    descricao: `O servidor completará 75 anos de idade na data de ${dataFormatada75}. Após essa idade o servidor é obrigado a se afastar, independentemente de ter cumprido os demais requisitos previstos em lei para aposentar-se. A unidade deverá considerar a data de aniversário dos 75 anos, como data do final do efetivo exercício, sendo a vigência no dia imediatamente seguinte ao aniversário.`,
    cumpre: compulsoriaAtingida,
    requisitos: [
      createReq("Idade Obrigatória", "75 anos", idadeAnos, compulsoriaAtingida)
    ]
  });

  return regras;
};