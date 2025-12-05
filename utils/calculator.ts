import { FormData, CalculationResult, ServerType, Gender, RuleCheck } from '../types';
import { parseDate, diffInDays, formatDaysToYearsAndDays, addDays, formatDatePTBR, isSameOrBefore, isSameOrAfter, isAfter, isBefore } from './dateHelpers';

// Constants
const DATE_EC_104 = parseDate('2020-09-15');
const DATE_2003 = parseDate('2003-12-31');

export const calculateRetirement = (data: FormData): CalculationResult => {
  const simDate = parseDate(data.simulationDate);
  const birthDate = parseDate(data.birthDate);
  const admissionDate = parseDate(data.admissionDate);

  // 1. Basic Time Calculations
  const ageDays = diffInDays(birthDate, simDate);
  const age = formatDaysToYearsAndDays(ageDays);

  // Fix: Gross Time should be inclusive (+1 day)
  const grossTimePMMG = diffInDays(admissionDate, simDate) + 1;

  const totalAverbed = data.averbedPeriods.reduce((acc, curr) => acc + curr.days, 0);
  const totalDiscount = data.discountPeriods.reduce((acc, curr) => acc + curr.days, 0);

  const netTimePMMG = Math.max(0, grossTimePMMG - totalDiscount);
  const contributionTimeDays = netTimePMMG + totalAverbed;
  const contributionTime = formatDaysToYearsAndDays(contributionTimeDays);

  // 2. Points Calculation
  const pointsValue = (age.totalDays + contributionTime.totalDays) / 365;
  const pointsFloor = Math.floor(pointsValue);
  const pointsRemainderDays = Math.floor((pointsValue - pointsFloor) * 365);
  const pointsDisplay = `${pointsFloor} pontos e ${pointsRemainderDays} dias`;

  // 3. Toll (Pedágio) Calculation
  const isTeacher = data.serverType === ServerType.PEBPM;
  const isMale = data.gender === Gender.MALE;

  let requiredTimeDays = 0;
  if (isTeacher) {
    requiredTimeDays = (isMale ? 30 : 25) * 365;
  } else {
    requiredTimeDays = (isMale ? 35 : 30) * 365;
  }

  // Time served until 15/09/2020 (Inclusive) - Gross
  const grossTimeUntilEC104 = Math.max(0, diffInDays(admissionDate, DATE_EC_104) + 1);
  
  // Calculate discounts that happened strictly before or on 15/09/2020 to deduct from the base time
  let discountsBeforeEC104 = 0;
  data.discountPeriods.forEach(discount => {
    const start = parseDate(discount.startDate);
    const end = parseDate(discount.endDate);
    
    // Calculate overlap with period [Admission, 15/09/2020]
    // Effective end is min(discountEnd, DATE_EC_104)
    const effectiveEnd = isBefore(end, DATE_EC_104) ? end : DATE_EC_104;
    
    // We assume discount start is after admission, but for safety:
    const effectiveStart = isBefore(start, admissionDate) ? admissionDate : start;

    if (isSameOrBefore(effectiveStart, effectiveEnd)) {
      // Calculate days in intersection
      const days = diffInDays(effectiveStart, effectiveEnd) + 1;
      discountsBeforeEC104 += Math.max(0, days);
    }
  });

  const timeServedOnBaseDate = Math.max(0, grossTimeUntilEC104 - discountsBeforeEC104);
  
  const deficitOnBaseDate = Math.max(0, requiredTimeDays - timeServedOnBaseDate);
  const tollValue = Math.ceil(deficitOnBaseDate * 0.5);
  
  // Total career time required = Base Requirement + Toll
  const totalCareerDaysRequired = requiredTimeDays + tollValue;
  
  // Days to serve AFTER 15/09/2020 = Deficit + Toll
  const daysToServeAfterEC104 = deficitOnBaseDate + tollValue;
  
  // Projected Date: 15/09/2020 + (Deficit + Toll)
  const tollRetirementDateObj = addDays(DATE_EC_104, daysToServeAfterEC104);
  
  // 4. Compulsory
  const compulsoryDateObj = addDays(birthDate, 75 * 365);
  
  // --- RULES EVALUATION ---
  
  const rulesPoints: RuleCheck[] = [];
  const rulesToll: RuleCheck[] = [];
  const rulesPermanent: RuleCheck[] = [];
  const qualifiedModalities: string[] = [];

  // Helper for check
  const check = (condition: boolean) => condition ? 'ok' : 'fail';
  const formatBool = (b: boolean) => b ? 'Sim' : 'Não';

  // --- TRANSITION BY POINTS ---

  // Rule 1: Points - General - Integral - Parity
  const reqPointsR1 = getRequiredPointsRule1(simDate, isMale);
  const minAgeR1 = isMale ? 65 : 60;
  const minContR1 = isMale ? 35 : 30;
  
  const r1Met = 
    data.entryPublicServiceBefore2003 &&
    age.years >= minAgeR1 &&
    contributionTime.years >= minContR1 &&
    data.tenYearsPublicService &&
    data.fiveYearsPosition &&
    pointsFloor >= reqPointsR1;

  rulesPoints.push({
    name: "Regra 1 - Transição - Pontos - Geral - Integral - Com paridade",
    met: r1Met,
    details: isMale ? "Requisitos Homem" : "Requisitos Mulher",
    requirements: [
      { label: "Ingresso até 31/12/2003", value: formatBool(data.entryPublicServiceBefore2003), status: check(data.entryPublicServiceBefore2003) },
      { label: `Idade mínima (${minAgeR1})`, value: `${age.years} anos`, status: check(age.years >= minAgeR1) },
      { label: `Contribuição mínima (${minContR1})`, value: `${contributionTime.years} anos`, status: check(contributionTime.years >= minContR1) },
      { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
      { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
      { label: `Pontos exigidos (${reqPointsR1})`, value: `${pointsFloor}`, status: check(pointsFloor >= reqPointsR1) },
    ]
  });
  if (r1Met) qualifiedModalities.push("Transição por Pontos (Geral/Integral)");

  // Rule 2: Points - General - Average - No Parity
  const reqPointsR2 = getRequiredPointsRule1(simDate, isMale); // Same table as Rule 1
  const minAgeR2 = isMale ? 62 : 56;
  
  const r2Met = 
    data.entryPublicService2003to2020 &&
    age.years >= minAgeR2 &&
    contributionTime.years >= minContR1 &&
    data.tenYearsPublicService &&
    data.fiveYearsPosition &&
    pointsFloor >= reqPointsR2;

  rulesPoints.push({
    name: "Regra 2 - Transição - Pontos - Geral - Média integral - Sem paridade",
    met: r2Met,
    details: isMale ? "Requisitos Homem" : "Requisitos Mulher",
    requirements: [
      { label: "Ingresso entre 2004 e 2020", value: formatBool(data.entryPublicService2003to2020), status: check(data.entryPublicService2003to2020) },
      { label: `Idade mínima (${minAgeR2})`, value: `${age.years} anos`, status: check(age.years >= minAgeR2) },
      { label: `Contribuição mínima (${minContR1})`, value: `${contributionTime.years} anos`, status: check(contributionTime.years >= minContR1) },
      { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
      { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
      { label: `Pontos exigidos (${reqPointsR2})`, value: `${pointsFloor}`, status: check(pointsFloor >= reqPointsR2) },
    ]
  });
  if (r2Met) qualifiedModalities.push("Transição por Pontos (Geral/Média)");

  // Rule 3: Points - Teacher - Integral - Parity
  if (isTeacher) {
    const reqPointsR3 = getRequiredPointsTeacher(simDate, isMale);
    const minAgeR3 = isMale ? 57 : 51;
    const minContR3 = isMale ? 30 : 25; // regency time
    
    const r3Met = 
      data.entryPublicServiceBefore2003 &&
      age.years >= minAgeR3 &&
      data.exclusiveRegencyTime >= minContR3 &&
      data.tenYearsPublicService &&
      data.fiveYearsPosition &&
      pointsFloor >= reqPointsR3;

    rulesPoints.push({
      name: "Regra 3 - Transição - Pontos - Especial Professor - Integral",
      met: r3Met,
      details: "Apenas PEBPM",
      requirements: [
        { label: "Ingresso até 31/12/2003", value: formatBool(data.entryPublicServiceBefore2003), status: check(data.entryPublicServiceBefore2003) },
        { label: `Idade mínima (${minAgeR3})`, value: `${age.years} anos`, status: check(age.years >= minAgeR3) },
        { label: `Tempo Regência (${minContR3})`, value: `${data.exclusiveRegencyTime} anos`, status: check(data.exclusiveRegencyTime >= minContR3) },
        { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
        { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
        { label: `Pontos exigidos (${reqPointsR3})`, value: `${pointsFloor}`, status: check(pointsFloor >= reqPointsR3) },
      ]
    });
    if (r3Met) qualifiedModalities.push("Transição por Pontos (Professor/Integral)");

     // Rule 4: Points - Teacher - Average - No Parity
     const reqPointsR4 = getRequiredPointsTeacher(simDate, isMale); // Same as Rule 3
     
     const r4Met = 
       data.entryPublicService2003to2020 &&
       age.years >= minAgeR3 &&
       data.exclusiveRegencyTime >= minContR3 &&
       data.tenYearsPublicService &&
       data.fiveYearsPosition &&
       pointsFloor >= reqPointsR4;
 
     rulesPoints.push({
       name: "Regra 4 - Transição - Pontos - Especial Professor - Média",
       met: r4Met,
       details: "Apenas PEBPM",
       requirements: [
         { label: "Ingresso entre 2004 e 2020", value: formatBool(data.entryPublicService2003to2020), status: check(data.entryPublicService2003to2020) },
         { label: `Idade mínima (${minAgeR3})`, value: `${age.years} anos`, status: check(age.years >= minAgeR3) },
         { label: `Tempo Regência (${minContR3})`, value: `${data.exclusiveRegencyTime} anos`, status: check(data.exclusiveRegencyTime >= minContR3) },
         { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
         { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
         { label: `Pontos exigidos (${reqPointsR4})`, value: `${pointsFloor}`, status: check(pointsFloor >= reqPointsR4) },
       ]
     });
     if (r4Met) qualifiedModalities.push("Transição por Pontos (Professor/Média)");
  }

  // --- TRANSITION BY TOLL (PEDÁGIO) ---

  // Check if current contribution time meets (Required Base + Toll)
  const tollMet = contributionTimeDays >= totalCareerDaysRequired;

  // Rule 1 Toll: General - Integral
  const minAgeTollR1 = isMale ? 60 : 55;
  const minContTollR1 = isMale ? 35 : 30; // 35 years
  
  const rt1Met = 
    data.entryPublicServiceBefore2003 &&
    age.years >= minAgeTollR1 &&
    contributionTime.years >= minContTollR1 &&
    data.tenYearsPublicService &&
    data.fiveYearsPosition &&
    tollMet;

  rulesToll.push({
    name: "Regra 1 - Pedágio - Geral - Integral",
    met: rt1Met,
    details: "Pedágio de 50% sobre o tempo faltante",
    requirements: [
      { label: "Ingresso até 31/12/2003", value: formatBool(data.entryPublicServiceBefore2003), status: check(data.entryPublicServiceBefore2003) },
      { label: `Idade mínima (${minAgeTollR1})`, value: `${age.years} anos`, status: check(age.years >= minAgeTollR1) },
      { label: `Contribuição mínima (${minContTollR1})`, value: `${contributionTime.years} anos`, status: check(contributionTime.years >= minContTollR1) },
      { label: "Cumpriu Pedágio", value: tollMet ? "Sim" : "Não", status: check(tollMet) },
    ]
  });
  if (rt1Met) qualifiedModalities.push("Pedágio (Geral/Integral)");

  // Rule 2 Toll: General - Average
  const rt2Met = 
    data.entryPublicService2003to2020 &&
    age.years >= minAgeTollR1 &&
    contributionTime.years >= minContTollR1 &&
    data.tenYearsPublicService &&
    data.fiveYearsPosition &&
    tollMet;

  rulesToll.push({
    name: "Regra 2 - Pedágio - Geral - Média",
    met: rt2Met,
    details: "Pedágio 50%",
    requirements: [
      { label: "Ingresso entre 2004 e 2020", value: formatBool(data.entryPublicService2003to2020), status: check(data.entryPublicService2003to2020) },
      { label: `Idade mínima (${minAgeTollR1})`, value: `${age.years} anos`, status: check(age.years >= minAgeTollR1) },
      { label: `Contribuição mínima (${minContTollR1})`, value: `${contributionTime.years} anos`, status: check(contributionTime.years >= minContTollR1) },
      { label: "Cumpriu Pedágio", value: tollMet ? "Sim" : "Não", status: check(tollMet) },
    ]
  });
  if (rt2Met) qualifiedModalities.push("Pedágio (Geral/Média)");

  if (isTeacher) {
     // Rule 3 Toll: Teacher - Integral
     const minAgeTollR3 = isMale ? 55 : 50;
     const minContTollR3 = isMale ? 30 : 25; // regency
     
     const rt3Met = 
        data.entryPublicServiceBefore2003 &&
        age.years >= minAgeTollR3 &&
        data.exclusiveRegencyTime >= minContTollR3 &&
        tollMet;

      rulesToll.push({
        name: "Regra 3 - Pedágio - Professor - Integral",
        met: rt3Met,
        details: "Apenas PEBPM",
        requirements: [
          { label: "Ingresso até 31/12/2003", value: formatBool(data.entryPublicServiceBefore2003), status: check(data.entryPublicServiceBefore2003) },
          { label: `Idade mínima (${minAgeTollR3})`, value: `${age.years} anos`, status: check(age.years >= minAgeTollR3) },
          { label: `Tempo Regência (${minContTollR3})`, value: `${data.exclusiveRegencyTime} anos`, status: check(data.exclusiveRegencyTime >= minContTollR3) },
          { label: "Cumpriu Pedágio", value: tollMet ? "Sim" : "Não", status: check(tollMet) },
        ]
      });
      if (rt3Met) qualifiedModalities.push("Pedágio (Professor/Integral)");

      // Rule 4 Toll: Teacher - Average
      const rt4Met = 
        data.entryPublicService2003to2020 &&
        age.years >= minAgeTollR3 &&
        data.exclusiveRegencyTime >= minContTollR3 &&
        tollMet;

      rulesToll.push({
        name: "Regra 4 - Pedágio - Professor - Média",
        met: rt4Met,
        details: "Apenas PEBPM",
        requirements: [
          { label: "Ingresso entre 2004 e 2020", value: formatBool(data.entryPublicService2003to2020), status: check(data.entryPublicService2003to2020) },
          { label: `Idade mínima (${minAgeTollR3})`, value: `${age.years} anos`, status: check(age.years >= minAgeTollR3) },
          { label: `Tempo Regência (${minContTollR3})`, value: `${data.exclusiveRegencyTime} anos`, status: check(data.exclusiveRegencyTime >= minContTollR3) },
          { label: "Cumpriu Pedágio", value: tollMet ? "Sim" : "Não", status: check(tollMet) },
        ]
      });
      if (rt4Met) qualifiedModalities.push("Pedágio (Professor/Média)");
  }


  // --- PERMANENT RULES ---
  
  // Perm 1: General
  const minAgePerm1 = isMale ? 65 : 62;
  const minContPerm1 = 25;

  const rp1Met = 
    age.years >= minAgePerm1 &&
    contributionTime.years >= minContPerm1 &&
    data.tenYearsPublicService &&
    data.fiveYearsPosition;

  rulesPermanent.push({
    name: "Regra Permanente Geral",
    met: rp1Met,
    details: "Média permanente - Sem paridade",
    requirements: [
       { label: `Idade mínima (${minAgePerm1})`, value: `${age.years} anos`, status: check(age.years >= minAgePerm1) },
       { label: `Contribuição mínima (${minContPerm1})`, value: `${contributionTime.years} anos`, status: check(contributionTime.years >= minContPerm1) },
       { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
       { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
    ]
  });
  if (rp1Met) qualifiedModalities.push("Regra Permanente Geral");

  if (isTeacher) {
    // Perm 2: Teacher
    const minAgePerm2 = isMale ? 60 : 57;
    const minContPerm2 = 25; // regency

    const rp2Met = 
      age.years >= minAgePerm2 &&
      data.exclusiveRegencyTime >= minContPerm2 &&
      data.tenYearsPublicService &&
      data.fiveYearsPosition &&
      pointsFloor >= reqPointsR2; // Using general points logic for floor check if needed, but per rule only Age/Time matter here. 
      // Actually Perm rule usually just Age + Contribution, no points. Removing points check from Permanent Rule 2 if it was implicit?
      // The prompt for Perm 2 says: Idade 60/57, Contrib 25, 10 pub, 5 cargo. No Points mentioned.
      // My code had `pointsFloor >= reqPointsR2` probably copy paste error.
      // Correction: Removing points check for Permanent Rule 2 as per prompt instructions.

    // Re-eval without points check
    const rp2MetFixed = 
      age.years >= minAgePerm2 &&
      data.exclusiveRegencyTime >= minContPerm2 &&
      data.tenYearsPublicService &&
      data.fiveYearsPosition;

    rulesPermanent.push({
      name: "Regra Permanente Professor",
      met: rp2MetFixed,
      details: "Apenas PEBPM",
      requirements: [
        { label: `Idade mínima (${minAgePerm2})`, value: `${age.years} anos`, status: check(age.years >= minAgePerm2) },
        { label: `Tempo Regência (${minContPerm2})`, value: `${data.exclusiveRegencyTime} anos`, status: check(data.exclusiveRegencyTime >= minContPerm2) },
        { label: "10 anos serviço público", value: formatBool(data.tenYearsPublicService), status: check(data.tenYearsPublicService) },
        { label: "5 anos cargo efetivo", value: formatBool(data.fiveYearsPosition), status: check(data.fiveYearsPosition) },
      ]
    });
    if (rp2MetFixed) qualifiedModalities.push("Regra Permanente Professor");
  }

  // Compulsory
  const compulsoryMet = age.years >= 75;

  return {
    age,
    grossTimePMMG,
    totalAverbed,
    totalDiscount,
    netTimePMMG,
    contributionTime,
    points: { value: pointsValue, display: pointsDisplay },
    toll: {
      required: requiredTimeDays,
      accumulatedOnBaseDate: timeServedOnBaseDate,
      deficit: deficitOnBaseDate,
      tollValue: tollValue,
      totalToServe: totalCareerDaysRequired, // Total Base + Toll
      retirementDate: formatDatePTBR(tollRetirementDateObj),
    },
    compulsoryDate: formatDatePTBR(compulsoryDateObj),
    rules: {
      points: rulesPoints,
      toll: rulesToll,
      permanent: rulesPermanent,
      compulsory: {
        name: "Regra Compulsória",
        met: compulsoryMet,
        details: "75 anos",
        requirements: [
          { label: "Idade", value: `${age.years} anos`, status: compulsoryMet ? 'info' : 'ok' }
        ]
      }
    },
    isQualified: qualifiedModalities.length > 0,
    qualifiedModalities
  };
};

// --- Lookup Tables for Points ---

function getRequiredPointsRule1(date: Date, isMale: boolean): number {
  const d = (y: number, m: number, day: number) => new Date(y, m-1, day);
  
  if (isMale) {
    if (isSameOrBefore(date, d(2022, 3, 31))) return 97;
    if (isSameOrBefore(date, d(2023, 6, 30))) return 98; // Until 30/06/2023 (since next starts 01/07/23) - Prompt says "From 01/04/2022" 98. "From 01/07/2023" 99.
    // Simplified logic using strictly checks against start dates in descending order (checking latest first)
    if (isSameOrAfter(date, d(2031, 1, 1))) return 105;
    if (isSameOrAfter(date, d(2029, 10, 1))) return 104;
    if (isSameOrAfter(date, d(2028, 7, 1))) return 103;
    if (isSameOrAfter(date, d(2027, 4, 1))) return 102;
    if (isSameOrAfter(date, d(2026, 1, 1))) return 101;
    if (isSameOrAfter(date, d(2024, 10, 1))) return 100;
    if (isSameOrAfter(date, d(2023, 7, 1))) return 99;
    if (isSameOrAfter(date, d(2022, 4, 1))) return 98;
    return 97;
  } else {
    // Female
    if (isSameOrAfter(date, d(2038, 7, 1))) return 100;
    if (isSameOrAfter(date, d(2037, 4, 1))) return 99;
    if (isSameOrAfter(date, d(2036, 1, 1))) return 98;
    if (isSameOrAfter(date, d(2034, 10, 1))) return 97;
    if (isSameOrAfter(date, d(2033, 7, 1))) return 96;
    if (isSameOrAfter(date, d(2032, 4, 1))) return 95;
    if (isSameOrAfter(date, d(2031, 1, 1))) return 94;
    if (isSameOrAfter(date, d(2029, 10, 1))) return 93;
    if (isSameOrAfter(date, d(2028, 7, 1))) return 92;
    if (isSameOrAfter(date, d(2027, 4, 1))) return 91;
    if (isSameOrAfter(date, d(2026, 1, 1))) return 90;
    if (isSameOrAfter(date, d(2024, 10, 1))) return 89;
    if (isSameOrAfter(date, d(2023, 7, 1))) return 88;
    if (isSameOrAfter(date, d(2022, 4, 1))) return 87;
    return 86;
  }
}

function getRequiredPointsTeacher(date: Date, isMale: boolean): number {
  const d = (y: number, m: number, day: number) => new Date(y, m-1, day);
  
  if (isMale) {
    if (isSameOrAfter(date, d(2029, 1, 1))) return 100;
    if (isSameOrAfter(date, d(2028, 1, 1))) return 99;
    if (isSameOrAfter(date, d(2027, 1, 1))) return 98;
    if (isSameOrAfter(date, d(2026, 1, 1))) return 97;
    if (isSameOrAfter(date, d(2025, 1, 1))) return 96;
    if (isSameOrAfter(date, d(2024, 1, 1))) return 95;
    if (isSameOrAfter(date, d(2023, 1, 1))) return 94;
    return 93;
  } else {
    // Female
    if (isSameOrAfter(date, d(2032, 1, 1))) return 92;
    if (isSameOrAfter(date, d(2031, 1, 1))) return 91;
    if (isSameOrAfter(date, d(2030, 1, 1))) return 90;
    if (isSameOrAfter(date, d(2029, 1, 1))) return 89;
    if (isSameOrAfter(date, d(2028, 1, 1))) return 88;
    if (isSameOrAfter(date, d(2027, 1, 1))) return 87;
    if (isSameOrAfter(date, d(2026, 1, 1))) return 86;
    if (isSameOrAfter(date, d(2025, 1, 1))) return 85;
    if (isSameOrAfter(date, d(2024, 1, 1))) return 84;
    if (isSameOrAfter(date, d(2023, 1, 1))) return 83;
    return 82;
  }
}