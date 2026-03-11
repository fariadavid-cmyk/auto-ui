import { BudgetBook, Budget, ExpenseBook } from "@/types/budget";

import { fetchGet, fetchPost } from "@/io/fetchApi";
import { SuccessMessageResult } from "@/types/general";
import { mapReplacer } from "@/utils/MapUtils";



const FETCH_EXPENSE_BOOK_URL = "budget/expenses/range";
const FETCH_BUDGETS_URL = "budget/budgets";
const SAVE_BUDGET_URL = "budget/budget";

const PARAM_START = "start";
const PARAM_END = "end"



function fetchExpenseBook(start: string, end: string) : Promise<ExpenseBook>
{
	let params = new URLSearchParams([
		[PARAM_START, start],
		[PARAM_END, end]
	]).toString();

	return fetchGet<ExpenseBook>(FETCH_EXPENSE_BOOK_URL + "?" + params);
}

function fetchBudgets() : Promise<BudgetBook>
{
	return fetchGet<BudgetBook>(FETCH_BUDGETS_URL);
}

function updateBudget(budget: Budget) : Promise<SuccessMessageResult>
{
	return fetchPost<SuccessMessageResult>(SAVE_BUDGET_URL, JSON.stringify(budget, mapReplacer));
}



export { fetchExpenseBook, fetchBudgets, updateBudget };
