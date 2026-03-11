import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { CategoryRecord, HIDDEN_CATEGORY, Catalog, Category, Subcategory } from '@/types/categories';



// Enum describing the type of row in the budget table
export enum RowType {
    TOP_HEADER,
	HEADER,
	VALUE,
	TOTAL,
	GRAND_TOTAL,
	SPACER
}



// Styled row components for the budget table. Use one based on the RowType value for the row
const BudgetTableRowStyles = {
    TableRow : styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(even)': {
            backgroundColor: theme.palette.grey[100],
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        }
    })),

    TopHeaderRow : styled(TableRow)(({ theme }) => ({
        '& th': {
            color: theme.palette.common.white
        },
        '& td': {
            color: theme.palette.common.white
        },
        backgroundColor: theme.palette.common.black
    })),

    HeaderRow : styled(TableRow)(({ theme }) => ({
        '& th': {
            color: theme.palette.common.white
        },
        '& td': {
            color: theme.palette.common.white
        },
        backgroundColor: theme.palette.grey[800]
    })),

    TotalRow : styled(TableRow)(({ theme }) => ({
        backgroundColor: theme.palette.grey[300]
    })),

    GrandTotalRow : styled(TableRow)(({ theme }) => ({
        '& th': {
            color: theme.palette.common.white
        },
        '& td': {
            color: theme.palette.common.white
        },
        backgroundColor: theme.palette.grey[900]
    })),

    SpacerRow : styled(TableRow)(({ theme }) => ({
        backgroundColor: theme.palette.grey[600]
    }))
};



// Table row component for the budget table. Selects the style based on the RowType for the given row
function BudgetRow(props: { rowIndex: number, labelRow: LabelRow, children: React.ReactNode }) {
    if (props.labelRow.rowType == RowType.HEADER) {
        return (
            <BudgetTableRowStyles.HeaderRow key={props.rowIndex} role="listitem" tabIndex={-1} sx={{ cursor: 'pointer' }}>
                { props.children }
            </BudgetTableRowStyles.HeaderRow>
        );
    } else if (props.labelRow.rowType == RowType.VALUE) {
        return (
            <BudgetTableRowStyles.TableRow hover key={props.rowIndex} role="listitem" tabIndex={-1} sx={{ cursor: 'pointer' }}>
                { props.children }
            </BudgetTableRowStyles.TableRow>
        );
    } else if (props.labelRow.rowType == RowType.TOTAL) {
        return (
            <BudgetTableRowStyles.TotalRow key={props.rowIndex} role="listitem" tabIndex={-1} sx={{ cursor: 'pointer' }}>
                { props.children }
            </BudgetTableRowStyles.TotalRow>
        );
    } else if (props.labelRow.rowType == RowType.GRAND_TOTAL) {
        return (
            <BudgetTableRowStyles.GrandTotalRow key={props.rowIndex} role="listitem" tabIndex={-1} sx={{ cursor: 'pointer' }}>
                { props.children }
            </BudgetTableRowStyles.GrandTotalRow>
        );
    } else if (props.labelRow.rowType == RowType.SPACER) {
        return (
            <BudgetTableRowStyles.SpacerRow key={props.rowIndex} role="listitem" tabIndex={-1} sx={{ cursor: 'pointer' }}>
                { props.children }
            </BudgetTableRowStyles.SpacerRow>
        );
    }
}



function subcategoryComparator(left: Subcategory, right: Subcategory) : number {
    return left.name.localeCompare(right.name);
}



// Describes a row of the budget table
type LabelRow = {
	rowType: RowType,                           // Type of row (value, header, spacer, etc)
	category: string,                           // Contents of the first column (category name, or blank)
	subcategory: string,                        // Contents of the second column (subcategory name)
	categoryReference: CategoryRecord | null    // CategoryRecord reference identifying the category for this row
}

// Describes all the rows of the budget table
class BudgetTableLabels {
    rows: LabelRow[];

    constructor(catalog: Catalog) {
        this.rows = [];

        let categories: Category[] = this.sortCategoriesFromCatalog(catalog);

        this.buildRowsForEachCategory(categories);
        this.rows.push(this.createGrandTotalRow());
    }

    // Category comparator for sorting
    private compareCategories(left: Category, right: Category) : number {
        return left.name.toUpperCase().localeCompare(right.name);
    }

    // Sorts items in the table: income categories first, then expense categories. Sorted alphabetically whithin
    private sortCategoriesFromCatalog(catalog: Catalog) : Category[] {
        let incomeCategories: Category[] = [];
        let expenseCategories: Category[] = [];

        // Build array of categories from the catalog, putting income categories first
        catalog.categories.values().forEach((category: Category) => {
            if (category.income) {
                incomeCategories.push(category);
            }
        });
        catalog.categories.values().forEach((category: Category) => {
            if (!category.income && category.name != HIDDEN_CATEGORY.category) {
                expenseCategories.push(category);
            }
        });

        incomeCategories.sort(this.compareCategories);
        expenseCategories.sort(this.compareCategories);

        return incomeCategories.concat(expenseCategories);
    }

    // Generate LabelRows for each category/subcategory
    private buildRowsForEachCategory(categories: Category[]) {
        let processingIncome = true;
        this.rows.push(this.createHeaderRow("Income", ""));

        categories.forEach((category: Category) => {
            if (processingIncome && !category.income) {
                // Finished income categories. Switch to expense
                processingIncome = false;
                this.rows.push(this.createHeaderRow("Expenses", ""));
            }

            let sortedSubcategories: Subcategory[] = category.subcategories.values().toArray().sort(subcategoryComparator);

            let first: boolean = true;
            sortedSubcategories.forEach((subcategory: Subcategory) => {
                this.rows.push(this.createValueRow(first ? category.name : "", subcategory));
                first = false;
            });

            this.rows.push(this.createTotalRow(category));
            this.rows.push(this.createSpacerRow());
        });
    }

    // Creates a header row object
    private createHeaderRow(categoryName: string, subcategoryName: string) : LabelRow {
        return { 
            rowType: RowType.HEADER,
            category: categoryName,
            subcategory: subcategoryName,
            categoryReference: { id: -1, category: categoryName, income: false, subcategory: subcategoryName }
        };
    }

    // Creates a value row object
    private createValueRow(categoryName: string, subcategory: Subcategory) : LabelRow {
        return { 
            rowType: RowType.VALUE,
            category: categoryName,
            subcategory: subcategory.name,
            categoryReference: subcategory.categoryReference
        };
    }

    // Creates a total row object
    private createTotalRow(category: Category) : LabelRow {
        return {
            rowType: RowType.TOTAL,
            category: "Total " + category.name,
            subcategory: "",
            categoryReference: { id: -1, category: category.name, income: category.income, subcategory: "" }
        };
    }

    // Creates a spacer row object
    private createSpacerRow() : LabelRow {
        return {
            rowType: RowType.SPACER,
            category: "",
            subcategory: "",
            categoryReference: null
        };
    }

    // Creates a grand total row object
    private createGrandTotalRow() : LabelRow {
        return {
            rowType: RowType.GRAND_TOTAL,
            category: "Totals",
            subcategory: "",
            categoryReference: null
        };
    }
}



export { BudgetTableRowStyles, BudgetRow, BudgetTableLabels };
export type { LabelRow };
