import { BudgetBook, ExpenseBook } from "@/types/budget";
import { fetchBudgets, fetchExpenseBook } from "@/io/budget";
import { repairBudgetMaps, repairExpenseMaps } from "@/utils/MapUtils";



async function queryBudgets() : Promise<BudgetBook> {
	// Load the catalog
	const book : BudgetBook = await fetchBudgets();

	// Repair the catalog's maps
	repairBudgetMaps(book);

	return book;
}

async function queryExpenses(start: string, end: string) : Promise<ExpenseBook> {
	// Load the expense book
	let book : ExpenseBook = await fetchExpenseBook(start, end);

	// Repair the expense book's maps
	repairExpenseMaps(book);

	return book;
}



export { queryBudgets, queryExpenses};
