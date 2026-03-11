import { CategoryRecord } from "@/types/categories";



type ExpenseBook = {
    book: Map<string, ExpenseSet>,
    amount: number
};

type ExpenseSet = {
    name: string,
    categories: Map<string, ExpenseCategory>,
    amount: number
};

type ExpenseCategory = {
    name: string,
    income: boolean,
    subcategories: Map<string, ExpenseSubcategory>,
    amount: number
};

type ExpenseSubcategory = {
    name: string,
    categoryReference: CategoryRecord,
    transactions: Transaction[];
    amount: number
};

type Transaction = {
    merchant: string,
    action: string,
    amount: number
}



type BudgetBook = {
    budgets: Map<string, Budget>
}

type Budget = {
    name: string,
    categories: Map<string, BudgetCategory>
}

type BudgetCategory = {
    name: string,
    income: boolean,
    subcategories: Map<string, BudgetSubcategory>
};

type BudgetSubcategory = {
    name: string,
    categoryReference: CategoryRecord,
    budgetItemId: number,
    period: Period,
    amount: number
};



type BudgetFormEntry = {
    amount: string,
    period : Period
}



export enum Period {
	DAILY = "DAILY",
	WEEKLY = "WEEKLY",
	BIWEEKLY = "BIWEEKLY",
	SEMIMONTHLY = "SEMIMONTHLY",
	MONTHLY = "MONTHLY",
	QUARTERLY = "QUARTERLY",
    ANNUALLY = "ANNUALLY"
}

const PERIOD_ORDER: Map<Period, number> = new Map([
    [Period.DAILY, 1],
    [Period.WEEKLY, 2],
    [Period.BIWEEKLY, 3],
    [Period.SEMIMONTHLY, 4],
    [Period.MONTHLY, 5],
    [Period.QUARTERLY, 6],
    [Period.ANNUALLY, 7]
]);

function comparePeriods(left: Period, right: Period) : number {
    let leftRank = PERIOD_ORDER.get(left) as number;
    let rightRank = PERIOD_ORDER.get(right) as number;

    if (leftRank == rightRank) {
        return 0;
    } else if (leftRank < rightRank) {
        return -1;
    } else {
        return 1;
    }
}


export type { ExpenseBook, ExpenseSet, ExpenseCategory, ExpenseSubcategory, Transaction, BudgetBook, Budget, BudgetCategory, BudgetSubcategory, BudgetFormEntry };
export { comparePeriods };
