export enum ServerType {
  SELECT = "",
  PEBPM = "Professor de Educação Básica (PEBPM)",
  EEBPM = "Especialista em Educação Básica (EEBPM)",
  ASPM = "Assistente Administrativo (ASPM)",
  AAPM = "Auxiliar Administrativo (AAPM)",
  AGPM = "Analista de Gestão (AGPM)"
}

export enum Gender {
  SELECT = "",
  MALE = "Masculino",
  FEMALE = "Feminino"
}

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: number;
}

export interface DiscountPeriod {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
}

export interface FormData {
  serverType: ServerType;
  gender: Gender;
  simulationDate: string;
  birthDate: string;
  admissionDate: string;
  averbedPeriods: Period[];
  discountPeriods: DiscountPeriod[];
  entryPublicServiceBefore2003: boolean;
  entryPublicService2003to2020: boolean;
  tenYearsPublicService: boolean;
  fiveYearsPosition: boolean;
  exclusiveRegencyTime: number; // Years
}

export interface RuleCheck {
  name: string;
  met: boolean;
  details: string;
  requirements: { label: string; value: string; status: 'ok' | 'fail' | 'info' }[];
}

export interface CalculationResult {
  age: { years: number; days: number; totalDays: number };
  grossTimePMMG: number; // days
  totalAverbed: number; // days
  totalDiscount: number; // days
  netTimePMMG: number; // days
  contributionTime: { years: number; days: number; totalDays: number };
  points: { value: number; display: string };
  toll: {
    required: number; // days required on 15/09/2020
    accumulatedOnBaseDate: number; // days had on 15/09/2020
    deficit: number; // days missing
    tollValue: number; // 50% of deficit
    totalToServe: number; // accumulated + toll
    retirementDate: string;
  };
  compulsoryDate: string;
  rules: {
    points: RuleCheck[];
    toll: RuleCheck[];
    permanent: RuleCheck[];
    compulsory: RuleCheck;
  };
  isQualified: boolean;
  qualifiedModalities: string[];
}