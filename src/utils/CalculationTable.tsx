import { CategoryRecord } from "@/types/categories";
import { RowType } from "./BudgetTable";
import { asNumberString } from "./Finance";


type CalculatorCategory<KeyType> = {
    income: boolean,
    subcategories: Map<string, Map<KeyType, number>>,
    totals: Map<KeyType, number>
}

class CalculationTable<KeyType> {
    // 3-level map keyed by category, subcategory, and period
    values: Map<string, CalculatorCategory<KeyType>>;
    grandTotals: Map<KeyType, number>;

    constructor() {
        this.values = new Map();
        this.grandTotals = new Map();
    }

    getAmount(categoryReference: CategoryRecord, mapKey: KeyType) : number {
        if (!categoryReference) {
            console.error("Null category reference");
        }
        let subcatMap = this.values.get(categoryReference.category);
        if (!subcatMap) {
            return 0;
        }

        let valueMap = subcatMap.subcategories.get(categoryReference.subcategory);
        if (!valueMap) {
            return 0;
        }

        let amount = valueMap.get(mapKey);
        if (amount == null) {
            return 0;
        }

        return amount;
    }

    getTotalCategory(category: string, mapKey: KeyType) : number {
        let calculatorCategory = this.values.get(category);
        if (!calculatorCategory) {
            return 0;
        }

        let total = calculatorCategory.totals.get(mapKey);
        if (!total) {
            return 0;
        }

        return total;
    }

    getGrandTotal(mapKey: KeyType) : number {
        let total = this.grandTotals.get(mapKey);
        if (!total) {
            return 0;
        }

        return total;
    }

    getAmountByRowType(rowType: RowType, categoryReference: CategoryRecord, mapKey: KeyType) : number {
        if (rowType == RowType.VALUE) {
            return this.getAmount(categoryReference, mapKey);
        } else if (rowType == RowType.TOTAL) {
            return this.getTotalCategory(categoryReference.category, mapKey);
        } else if (rowType == RowType.GRAND_TOTAL) {
            return this.getGrandTotal(mapKey);
        } else {
            return 0;
        }
    }

    protected setAmount(categoryReference: CategoryRecord, mapKey: KeyType, amount: number) : void {
        let subcatMap = this.values.get(categoryReference.category);
        if (!subcatMap) {
            subcatMap = {
                income: categoryReference.income,
                subcategories: new Map(),
                totals : new Map()
            };
            this.values.set(categoryReference.category, subcatMap);
        }

        let valueMap = subcatMap.subcategories.get(categoryReference.subcategory);
        if (!valueMap) {
            valueMap = new Map();
            subcatMap.subcategories.set(categoryReference.subcategory, valueMap);
        }

        // Drop floating point errors by converting to string and back
        valueMap.set(mapKey, +(asNumberString(amount)));
    }

    protected calculateTotalCategory(category: string, mapKey: KeyType) : number {
        let total = 0;

        let calculatorCategory = this.values.get(category);
        if (!calculatorCategory) {
            return 0;
        }

        calculatorCategory.subcategories.values().forEach((periodMap) => {
            if (periodMap.has(mapKey)) {
                let itemAmount = periodMap.get(mapKey) as number;
                total += itemAmount;
            }
        });

        // Drop floating point errors by converting to string and back
        total = +(asNumberString(total));
        calculatorCategory.totals.set(mapKey, total);

        return total;
    }

    protected calculateTotals(mapKey: KeyType) : number {
        let total = 0;

        // When calculating the grand total, treat income categories as positive and expense categories as negative
        this.values.entries().forEach(([name, category]) => {
            let categoryAmount = this.calculateTotalCategory(name, mapKey);
            if (category.income) {
                total += categoryAmount;
            } else {
                total -= categoryAmount;
            }
        })

        // Drop floating point errors by converting to string and back
        total = +(asNumberString(total));
        this.grandTotals.set(mapKey, total);

        return total;
    }
};



export default CalculationTable;
