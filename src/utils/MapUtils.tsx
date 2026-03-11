import { BudgetBook, Budget, BudgetCategory, BudgetSubcategory, ExpenseBook, ExpenseSet, ExpenseCategory, ExpenseSubcategory } from "@/types/budget";
import { Catalog, Category, Subcategory } from "@/types/categories";



function repairCatalogMaps(catalog : Catalog) {
	// For every category in the catalog
	Object.values(catalog.categories).forEach((category : Category) => {
		// Regenerate the subcategories map
		let subcategories = new Map<string, Subcategory>(Object.entries(category.subcategories));
		category.subcategories = subcategories;
	});

	// Regenerate the categories map
	let catalogMap = new Map<string, Category>(Object.entries(catalog.categories));
	catalog.categories = catalogMap;
}

function repairBudgetMaps(book : BudgetBook) {
    if (!book.budgets) {
        book.budgets = new Map<string, Budget>();
    } else {
        // For every budget
    	Object.values(book.budgets).forEach((budget : Budget) => {
            // For every category in the catalog
            Object.values(budget.categories).forEach((category : BudgetCategory) => {
                // Regenerate the subcategories map
                let subcategories = new Map<string, BudgetSubcategory>(Object.entries(category.subcategories));
                category.subcategories = subcategories;
            });

            // Regenerate the categories map
            let categoryMap = new Map<string, BudgetCategory>(Object.entries(budget.categories));
            budget.categories = categoryMap;
        });

        // Regenerate the budget map
        let budgetMap = new Map<string, Budget>(Object.entries(book.budgets));
        book.budgets = budgetMap;
    }
}

function repairExpenseMaps(book : ExpenseBook) {
    if (!book.book) {
        book.book = new Map<string, ExpenseSet>();
    } else {
        // For every expenseSet
    	Object.values(book.book).forEach((expenseSet : ExpenseSet) => {
            // For every category in the catalog
            Object.values(expenseSet.categories).forEach((category : ExpenseCategory) => {
                // Regenerate the subcategories map
                let subcategories = new Map<string, ExpenseSubcategory>(Object.entries(category.subcategories));
                category.subcategories = subcategories;
            });

            // Regenerate the categories map
            let categoryMap = new Map<string, ExpenseCategory>(Object.entries(expenseSet.categories));
            expenseSet.categories = categoryMap;
        });

        // Regenerate the expense map
        let expenseMap = new Map<string, ExpenseSet>(Object.entries(book.book));
        book.book = expenseMap;
    }
}

function mapReplacer(key : string, value : any) {
    if (value instanceof Map) {
        return Object.fromEntries(value);
    } else {
        return value;
    }
}



export { repairCatalogMaps, repairBudgetMaps, repairExpenseMaps, mapReplacer };
