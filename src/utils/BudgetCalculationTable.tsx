import { Budget, BudgetFormEntry, Period } from "@/types/budget";
import { CategoryRecord } from "@/types/categories";
import { BudgetTableLabels, LabelRow, RowType } from "./BudgetTable";
import { recalculateForPeriod } from "./Finance";
import CalculationTable from "./CalculationTable";


class BudgetCalculationTable extends CalculationTable<Period> {
    periods: Map<CategoryRecord, Period>;

    constructor() {
        super();

        this.periods = new Map();
    }

    calculate(labels : BudgetTableLabels, budget : Budget) {
		labels.rows.forEach((labelRow: LabelRow, rowIndex: number) => {
            if (labelRow.rowType == RowType.VALUE) {
                let catRef = labelRow.categoryReference as CategoryRecord;
                let category = budget.categories.get(catRef.category);
                if (category) {
                    let subcategory = category.subcategories.get(catRef.subcategory);
                    if (subcategory) {
                        // Calculate for MONTHLY, QUARTERLY, and ANNUALLY. Store native period.
                        this.setAmount(catRef, Period.MONTHLY, recalculateForPeriod(subcategory.amount, subcategory.period, Period.MONTHLY));
                        this.setAmount(catRef, Period.QUARTERLY, recalculateForPeriod(subcategory.amount, subcategory.period, Period.QUARTERLY));
                        this.setAmount(catRef, Period.ANNUALLY, recalculateForPeriod(subcategory.amount, subcategory.period, Period.ANNUALLY));
                        this.setAmount(catRef, subcategory.period, subcategory.amount);

                        this.periods.set(catRef, subcategory.period);
                    }
                }
            }
        });
        
        this.calculateTotals(Period.MONTHLY);
        this.calculateTotals(Period.QUARTERLY);
        this.calculateTotals(Period.ANNUALLY);
    }

    calculateFromForm(labels : BudgetTableLabels, budgetForm : Map<number, BudgetFormEntry>) {
		labels.rows.forEach((labelRow: LabelRow, rowIndex: number) => {
            if (labelRow.rowType == RowType.VALUE) {
                let catRef = labelRow.categoryReference as CategoryRecord;
                let budgetEntry = budgetForm.get(catRef.id) as BudgetFormEntry;
                if (budgetEntry) {
                    let amount = +(budgetEntry.amount);
                    if (!Number.isNaN(amount)) {
                        // Calculate for MONTHLY, QUARTERLY, and ANNUALLY. Store native period.
                        this.setAmount(catRef, Period.MONTHLY, recalculateForPeriod(amount, budgetEntry.period, Period.MONTHLY));
                        this.setAmount(catRef, Period.QUARTERLY, recalculateForPeriod(amount, budgetEntry.period, Period.QUARTERLY));
                        this.setAmount(catRef, Period.ANNUALLY, recalculateForPeriod(amount, budgetEntry.period, Period.ANNUALLY));
                        this.setAmount(catRef, budgetEntry.period, amount);

                        this.periods.set(catRef, budgetEntry.period);
                    }
                }
            }
        });
        
        this.calculateTotals(Period.MONTHLY);
        this.calculateTotals(Period.QUARTERLY);
        this.calculateTotals(Period.ANNUALLY);
    }

    getPeriodForCategory(catRef: CategoryRecord) : Period {
        if (this.periods.has(catRef)) {
            return this.periods.get(catRef) as Period;
        } else {
            return Period.MONTHLY;
        }
    }
};



export default BudgetCalculationTable;
