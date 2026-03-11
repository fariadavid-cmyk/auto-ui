import { ExpenseSet, Period } from "@/types/budget";
import { CategoryRecord } from "@/types/categories";
import { BudgetTableLabels, LabelRow, RowType } from "./BudgetTable";
import CalculationTable from "./CalculationTable";



const EXPENSE_TOTAL_NAME = "ExpenseTotal";

const EXPENSE_TOTAL: ExpenseSet = {
    name: EXPENSE_TOTAL_NAME,
    categories: new Map(),
    amount: 0
};


class ExpenseCalculationTable extends CalculationTable<string> {
    constructor() {
        super();
    }

    calculate(labels : BudgetTableLabels, expenseSets : ExpenseSet[]) {
        // Calculate amounts for each category in each expense set
		labels.rows.forEach((labelRow: LabelRow, rowIndex: number) => {
            if (labelRow.rowType == RowType.VALUE) {
                let catRef = labelRow.categoryReference as CategoryRecord;
                let total = 0;

                expenseSets.forEach((expenseSet : ExpenseSet, colIndex: number) => {
                    let category = expenseSet.categories.get(catRef.category);
                    if (category) {
                        let subcategory = category.subcategories.get(catRef.subcategory);
                        if (subcategory) {
                            this.setAmount(catRef, expenseSet.name, subcategory.amount);
                            total += subcategory.amount;
                        }
                    }
                });

                // Set the total of all expense sets for this category
                this.setAmount(catRef, EXPENSE_TOTAL.name, total);
            }
        });

        expenseSets.forEach((expenseSet : ExpenseSet, colIndex: number) => {
            this.calculateTotals(expenseSet.name);
        });
        this.calculateTotals(EXPENSE_TOTAL.name);
    }
};



export { ExpenseCalculationTable, EXPENSE_TOTAL };
