'use client'

import * as React from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { ExpenseBook, ExpenseSet, Budget, Period, comparePeriods } from "@/types/budget";
import { Catalog, CategoryRecord } from "@/types/categories";
import { StateTuple } from '@/types/general';
import BudgetCalculationTable from '@/utils/BudgetCalculationTable';
import { ExpenseCalculationTable, EXPENSE_TOTAL } from '@/utils/ExpenseCalculationTable';
import { BudgetRow, BudgetTableLabels, BudgetTableRowStyles, LabelRow, RowType } from '@/utils/BudgetTable';
import { BudgetCell, cellKey, NON_STICKY_COL, SpendingStatus } from '@/utils/BudgetTableStickyCellStyles';
import Currency from '../components/Currency';
import { recalculateForPeriod } from '@/utils/Finance';



const TOP_HEADER_LABEL_ROW: LabelRow = {
	rowType: RowType.TOP_HEADER,
	category: "",
	subcategory: "",
	categoryReference: null
};

// Title bar above the table
function ExpenseTableTitlebar() {
	return (
		<Toolbar sx={[{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }]}>
			<Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
				Expense Book
			</Typography>
		</Toolbar>
	);
}

function ExpenseTableHead(props: { budget: Budget | null, expenseSets: ExpenseSet[] }) {
	const expenseSets : ExpenseSet[] = props.expenseSets;
	const budget : Budget | null = props.budget;

	return (
		<TableHead>
			<BudgetTableRowStyles.TopHeaderRow>
				<BudgetCell colIndex={0} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>Category</BudgetCell>
				<BudgetCell colIndex={1} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>Subcategory</BudgetCell>

				<BudgetCell colIndex={2} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>Monthly Budget</BudgetCell>
				<BudgetCell colIndex={3} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>Annual Budget</BudgetCell>

				<BudgetCell colIndex={4} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}><></></BudgetCell>
				<BudgetCell colIndex={5} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>Expense Total</BudgetCell>

				<BudgetCell colIndex={6} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}><></></BudgetCell>

				{ expenseSets.map((es: ExpenseSet, monthIndex: number) => (
					<BudgetCell key={cellKey(-1, monthIndex + 1)} colIndex={NON_STICKY_COL + monthIndex} rowIndex={-1} labelRow={TOP_HEADER_LABEL_ROW}>{es.name}</BudgetCell>
				))}
			</BudgetTableRowStyles.TopHeaderRow>
		</TableHead>
	);
}



function compareNum(left: number, right: number) : number {
	if (Number.isNaN(left)) {
		return 1;
	} else if (Number.isNaN(right)) {
		return -1;
	} else {
		if (left < right) {
			return -1;
		} else if (left > right) {
			return 1;
		}
	}

	return 0;
}

function expenseSetComparator(leftES: ExpenseSet, rightES: ExpenseSet) : number {
	let left: string = leftES.name;
	let right: string = rightES.name;

	// Compare year
	let leftYear = +(left.substring(0, 4));
	let rightYear = +(right.substring(0, 4));
	let comparison = compareNum(leftYear, rightYear);

	if (comparison == 0) {
		// Compare month
		let leftMonth = +(left.substring(5, 7));
		let rightMonth = +(right.substring(5, 7));
		comparison = compareNum(leftMonth, rightMonth);
	}

	return comparison;
}



function ExpenseBookDisplay(props: {
		catalog: StateTuple<Catalog>,
		budget: StateTuple<Budget | null>,
		book: StateTuple<ExpenseBook>
	}) {
	const catalog : StateTuple<Catalog> = props.catalog;
	const budget : StateTuple<Budget | null> = props.budget;
	const book : StateTuple<ExpenseBook> = props.book;

	// Expense table columns
	const expenseSets : ExpenseSet[] = React.useMemo<ExpenseSet[]>(() => {
		let es: ExpenseSet[] = [];
		book.get.book.values().forEach((expenseSet) => es.push(expenseSet) );
		es.sort(expenseSetComparator).reverse();
		return es;
	}, [book.get]);

	// Descriptors for each row of the table
	const labels : BudgetTableLabels = React.useMemo<BudgetTableLabels>(() => new BudgetTableLabels(catalog.get), [catalog.get]);

	// Table for all calculated budget amounts
	const budgetCalculationTable : BudgetCalculationTable = React.useMemo<BudgetCalculationTable>(() => {
		let table: BudgetCalculationTable = new BudgetCalculationTable();
		if (budget.get) {
			table.calculate(labels, budget.get);
		}
		return table;
	}, [catalog.get, budget.get]);

	// Table for all calculated expense amounts
	const expenseCalculationTable : ExpenseCalculationTable = React.useMemo<ExpenseCalculationTable>(() => {
		let table: ExpenseCalculationTable = new ExpenseCalculationTable();
		if (expenseSets.length > 0) {
			table.calculate(labels, expenseSets);
		}
		return table;
	}, [catalog.get, book.get]);
	


	function generateBudgetCell(labelRow: LabelRow, period: Period) {
		if (budget.get == null) {
			return <></>;
		}

		let cellValue : string | React.JSX.Element = "";

		if (labelRow.rowType == RowType.VALUE) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			let amount = budgetCalculationTable.getAmount(catRef, period);

			cellValue = ( <Currency amount={amount} /> );
		} else if (labelRow.rowType == RowType.TOTAL) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			let amount = budgetCalculationTable.getTotalCategory(catRef.category, period);

			cellValue = ( <Currency amount={amount} /> );
		} else if (labelRow.rowType == RowType.GRAND_TOTAL) {
			let amount = budgetCalculationTable.getGrandTotal(period);

			cellValue = ( <Currency amount={amount} /> );
		}

		return cellValue;
	}



	function generateExpenseCell(labelRow: LabelRow, expenseSet: ExpenseSet) {
		let cellValue : string | React.JSX.Element = "";

		if (labelRow.rowType == RowType.VALUE) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			let amount = expenseCalculationTable.getAmount(catRef, expenseSet.name);

			cellValue = ( <Currency amount={amount} /> );
		} else if (labelRow.rowType == RowType.TOTAL) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			let amount = expenseCalculationTable.getTotalCategory(catRef.category, expenseSet.name);

			cellValue = ( <Currency amount={amount} /> );
		} else if (labelRow.rowType == RowType.GRAND_TOTAL) {
			let amount = expenseCalculationTable.getGrandTotal(expenseSet.name);

			cellValue = ( <Currency amount={amount} /> );
		}

		return cellValue;
	}

	function isTooExpensive(catRef: CategoryRecord, budgetAmount: number, expenseAmount: number) : boolean {
		if (catRef) {
			// Value or Total row
			return ((catRef.income && budgetAmount > expenseAmount) || (!catRef.income && expenseAmount > budgetAmount));
		} else {
			// Grand Total row
			return (budgetAmount > expenseAmount);
		}
	}

	function compareExpenseAmountsAsStatus(catRef: CategoryRecord, expenseSetName: string, rowType : RowType) : SpendingStatus {
		let expensePeriod = expenseSetName == EXPENSE_TOTAL.name ? Period.ANNUALLY : Period.MONTHLY;
		let budgetPeriod = budgetCalculationTable.getPeriodForCategory(catRef);
		let expensePeriodIsShorter = (comparePeriods(expensePeriod, budgetPeriod) < 0);

		let expenseAmount = expenseCalculationTable.getAmountByRowType(rowType, catRef, expenseSetName);
		let budgetAmount = budgetCalculationTable.getAmountByRowType(rowType, catRef, expensePeriodIsShorter ? budgetPeriod : expensePeriod);

		// Calculate for the larger period for comparisons
		if (expensePeriodIsShorter) {
			expenseAmount = recalculateForPeriod(expenseAmount, expensePeriod, budgetPeriod);
		}

		let cellStatus = SpendingStatus.GREEN;
		let expensiveStatus = SpendingStatus.RED;

		// If the budget period does not fit evenly into the expense period, then an overage is a warning instead of an error
		// e.g. DAILY and MONTHLY fit evenly into a month, so error. WEEKLY does not fit exactly into a month (a month is 4 weeks plus some days), so warning
		if (expensePeriod == Period.MONTHLY && budgetPeriod != Period.MONTHLY && budgetPeriod != Period.DAILY) {
			expensiveStatus = SpendingStatus.YELLOW;
		}

		// Error if expense is larger than budget.  For income categories, warning if budget is larger than income
		if (isTooExpensive(catRef, budgetAmount, expenseAmount)) {
			cellStatus = expensiveStatus;
		}

		return cellStatus;
	}

	function ExpenseCell(props: {
				rowIndex: number,
				colIndex: number,
				labelRow: LabelRow,
				expenseSet: ExpenseSet
			}) {
		const rowIndex = props.rowIndex;
		const colIndex = props.colIndex;
		const labelRow = props.labelRow;
		const expenseSet = props.expenseSet;

		let cellStatus = SpendingStatus.NIL;

		// Colourise value cells
		if (budget.get && (labelRow.rowType == RowType.VALUE || labelRow.rowType == RowType.TOTAL || labelRow.rowType == RowType.GRAND_TOTAL)) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			cellStatus = compareExpenseAmountsAsStatus(catRef, expenseSet.name, labelRow.rowType);
		}
	
		return (
			<BudgetCell key={cellKey(rowIndex, colIndex + 1)} colIndex={colIndex} rowIndex={rowIndex} labelRow={labelRow} cellStatus={cellStatus}>
				{ generateExpenseCell(labelRow, expenseSet) }
			</BudgetCell>
		);
	}



	return (
		<>
			<Box>
				<Paper sx={{ mb: 2 }}>
					<ExpenseTableTitlebar />

					<TableContainer style={{ maxWidth: 1500 }}>
						<Table aria-labelledby="tableTitle" size={'small'}>
							<ExpenseTableHead budget={budget.get} expenseSets={expenseSets}/>

							<TableBody>
								{ labels.rows.map((labelRow: LabelRow, rowIndex: number) => {
									return (
										<BudgetRow key={rowIndex} rowIndex={rowIndex} labelRow={labelRow}>
											<BudgetCell colIndex={0} rowIndex={rowIndex} labelRow={labelRow}>{labelRow.category}</BudgetCell>
											<BudgetCell colIndex={1} rowIndex={rowIndex} labelRow={labelRow}>{labelRow.subcategory}</BudgetCell>

											<BudgetCell colIndex={2} rowIndex={rowIndex} labelRow={labelRow}>
												{ generateBudgetCell(labelRow, Period.MONTHLY) }
											</BudgetCell>
											<BudgetCell colIndex={3} rowIndex={rowIndex} labelRow={labelRow}>
												{ generateBudgetCell(labelRow, Period.ANNUALLY) }
											</BudgetCell>

											<BudgetCell colIndex={4} rowIndex={rowIndex} labelRow={labelRow}><></></BudgetCell>
											<ExpenseCell rowIndex={rowIndex} colIndex={5} labelRow={labelRow} expenseSet={EXPENSE_TOTAL} />
											<BudgetCell colIndex={6} rowIndex={rowIndex} labelRow={labelRow}><></></BudgetCell>

											{ expenseSets.map((expenseSet : ExpenseSet, colIndex: number) => (
												<ExpenseCell key={cellKey(rowIndex, colIndex + 1)} rowIndex={rowIndex} colIndex={NON_STICKY_COL + colIndex} labelRow={labelRow} expenseSet={expenseSet} />
											))}
										</BudgetRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>
			</Box>
		</>
	);
}

export default ExpenseBookDisplay;
