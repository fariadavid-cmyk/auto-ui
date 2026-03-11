import { Period } from "@/types/budget";



// Currency formatter.  CAD for now; add other locales/currencies later
const cadNumberFormat : Intl.NumberFormat = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
const numberFormat : Intl.NumberFormat = new Intl.NumberFormat("en-CA", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });

let opt: Intl.NumberFormatOptions;
let reg: Intl.NumberFormatOptionsCurrencyDisplayRegistry;

export type Currency = {
    symbolAtHead: boolean,
    symbol: string,
    value: string
}



type ScalarFunction = ((value: number) => number);
type ScalarMap = Map<Period, ScalarFunction>;
type ScalarMatrix = Map<Period, ScalarMap>;

const DAILY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value)],
	[Period.WEEKLY, (value: number) => (value * 7)],
	[Period.BIWEEKLY, (value: number) => (value * 14)],
	[Period.SEMIMONTHLY, (value: number) => (value * 365 / 24)],
	[Period.MONTHLY, (value: number) => (value * 365 / 12)],
	[Period.QUARTERLY, (value: number) => (value * 365 / 4)],
    [Period.ANNUALLY, (value: number) => (value * 365)]
]);

const WEEKLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value / 7)],
	[Period.WEEKLY, (value: number) => (value)],
	[Period.BIWEEKLY, (value: number) => (value * 2)],
	[Period.SEMIMONTHLY, (value: number) => (value * 52 / 24)],
	[Period.MONTHLY, (value: number) => (value * 52 / 12)],
	[Period.QUARTERLY, (value: number) => (value * 52 / 4)],
    [Period.ANNUALLY, (value: number) => (value * 52)]
]);

const BIWEEKLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value / 14)],
	[Period.WEEKLY, (value: number) => (value / 2)],
	[Period.BIWEEKLY, (value: number) => (value)],
	[Period.SEMIMONTHLY, (value: number) => (value * 26 / 24)],
	[Period.MONTHLY, (value: number) => (value * 26 / 12)],
	[Period.QUARTERLY, (value: number) => (value * 26 / 4)],
    [Period.ANNUALLY, (value: number) => (value * 26)]
]);

const SEMIMONTHLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value * 24 / 365)],
	[Period.WEEKLY, (value: number) => (value * 24 / 52)],
	[Period.BIWEEKLY, (value: number) => (value * 24 / 26)],
	[Period.SEMIMONTHLY, (value: number) => (value)],
	[Period.MONTHLY, (value: number) => (value * 2)],
	[Period.QUARTERLY, (value: number) => (value * 6)],
    [Period.ANNUALLY, (value: number) => (value * 24)]
]);

const MONTHLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value * 12 / 365)],
	[Period.WEEKLY, (value: number) => (value * 12 / 52)],
	[Period.BIWEEKLY, (value: number) => (value * 12 / 26)],
	[Period.SEMIMONTHLY, (value: number) => (value * 2)],
	[Period.MONTHLY, (value: number) => (value)],
	[Period.QUARTERLY, (value: number) => (value * 3)],
    [Period.ANNUALLY, (value: number) => (value * 12)]
]);

const QUARTERLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value * 4 / 365)],
	[Period.WEEKLY, (value: number) => (value / 13)],
	[Period.BIWEEKLY, (value: number) => (value * 2 / 26)],
	[Period.SEMIMONTHLY, (value: number) => (value / 6)],
	[Period.MONTHLY, (value: number) => (value / 3)],
	[Period.QUARTERLY, (value: number) => (value)],
    [Period.ANNUALLY, (value: number) => (value * 4)]
]);

const ANNUALLY_SCALAR_MAP: ScalarMap = new Map<Period, ((value: number) => number)>([
	[Period.DAILY, (value: number) => (value / 365)],
	[Period.WEEKLY, (value: number) => (value / 52)],
	[Period.BIWEEKLY, (value: number) => (value / 26)],
	[Period.SEMIMONTHLY, (value: number) => (value / 24)],
	[Period.MONTHLY, (value: number) => (value / 12)],
	[Period.QUARTERLY, (value: number) => (value / 4)],
    [Period.ANNUALLY, (value: number) => (value)]
]);

const SCALAR_MATRIX: ScalarMatrix = new Map<Period, ScalarMap>([
	[Period.DAILY, DAILY_SCALAR_MAP],
	[Period.WEEKLY, WEEKLY_SCALAR_MAP],
	[Period.BIWEEKLY, BIWEEKLY_SCALAR_MAP],
	[Period.SEMIMONTHLY, SEMIMONTHLY_SCALAR_MAP],
	[Period.MONTHLY, MONTHLY_SCALAR_MAP],
	[Period.QUARTERLY, QUARTERLY_SCALAR_MAP],
    [Period.ANNUALLY, ANNUALLY_SCALAR_MAP]
]);



function recalculateForPeriod(amount: number, fromPeriod: Period, toPeriod: Period) : number {
    let map = SCALAR_MATRIX.get(fromPeriod);
    if (map) {
        let scalar = map.get(toPeriod);
        if (scalar) {
            return scalar(amount); 
        }
    }

    return amount;
}



function asCurrencyString(amount: number) : string {
    return cadNumberFormat.format(amount);
}

function asNumberString(amount: number) : string {
    return numberFormat.format(amount);
}

function stripSymbols(parts: Intl.NumberFormatPart[]) : string {
    let symbol = "";

    if (parts[0].type == "currency") {
        // Currency-leading formats
        symbol = parts[0].value;
        parts.splice(0, 1);
    } else if (parts[0].type == "minusSign" && parts[1].type == "currency") {
        // Currency-leading format of a negative amount
        symbol = parts[1].value;
        parts.splice(1, 1);
    } else if (parts[parts.length - 1].type == "currency") {
        // Currency-trailing formats
        symbol = parts[parts.length - 1].value;
        parts.splice(parts.length - 1, 1);
    }

    return symbol;
}

function asCurrency(amount: number) : Currency {
    let result: Currency = {
        symbolAtHead: true,
        symbol: "$",
        value: "0.00"
    }

    let parts = cadNumberFormat.formatToParts(amount);

    result.symbol = stripSymbols(parts);
    result.value = parts.map((part: Intl.NumberFormatPart) => part.value ).join("");

    return result;
}



export { recalculateForPeriod, asCurrency, asCurrencyString, asNumberString };
