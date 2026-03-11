'use client'

import * as React from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { StateTuple } from '@/types/general';
import { Catalog, CategoryRecord } from "@/types/categories";
import { Budget, BudgetCategory, BudgetFormEntry, BudgetSubcategory, Period } from "@/types/budget";
import { asNumberString } from '@/utils/Finance';
import BudgetCalculationTable from '@/utils/BudgetCalculationTable';
import { BudgetRow, BudgetTableLabels, BudgetTableRowStyles, LabelRow, RowType } from '@/utils/BudgetTable';
import Currency from '../components/Currency';



// Title bar above the table
function BudgetTableTitlebar() {
	return (
		<Toolbar sx={[{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }]}>
			<Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
				Budgets
			</Typography>
		</Toolbar>
	);
}

// Header row of the table
function BudgetTableHead() {
	return (
		<TableHead>
			<BudgetTableRowStyles.TopHeaderRow>
				<TableCell key="Category" align={'left'} style={{ minWidth: 150 }}>Category</TableCell>
				<TableCell key="Subcategory" align={'left'} style={{ minWidth: 150 }}>Subcategory</TableCell>
				<TableCell key="amount" align={'right'} style={{ minWidth: 150 }}>Amount</TableCell>
				<TableCell key="period" align={'left'} style={{ minWidth: 150 }}>Period</TableCell>
				<TableCell key="spacer" align={'left'} style={{ maxWidth: 10 }}></TableCell>
				<TableCell key="monthly" align={'right'} style={{ minWidth: 150 }}>Monthly</TableCell>
				<TableCell key="quarterly" align={'right'} style={{ minWidth: 150 }}>Quarterly</TableCell>
				<TableCell key="annually" align={'right'} style={{ minWidth: 150 }}>Annually</TableCell>
			</BudgetTableRowStyles.TopHeaderRow>
		</TableHead>
	);
}



// Component displaying the budget table
function BudgetDisplay(props: {
		catalog: StateTuple<Catalog>,
		budget: StateTuple<Budget | null>,
		handleSaveBudget: ((budget: Budget) => void) | null
	}) {
	const [budgetForm, setBudgetForm] = React.useState<Map<number, BudgetFormEntry>>(new Map());

	const catalog : StateTuple<Catalog> = props.catalog;
	const budget : StateTuple<Budget | null> = props.budget;
	const handleSaveBudget = props.handleSaveBudget;

	// Descriptors for each row of the table
	const labels : BudgetTableLabels = React.useMemo<BudgetTableLabels>(() => new BudgetTableLabels(catalog.get), [catalog.get]);

	// Table for all calculated budget amounts
	const budgetCalculationTable : BudgetCalculationTable = React.useMemo<BudgetCalculationTable>(() => {
		let table: BudgetCalculationTable = new BudgetCalculationTable();
		table.calculateFromForm(labels, budgetForm);
		return table;
	}, [catalog.get, budgetForm]);



	// Populate the entry map. Repopulate if the budget or catalog changes
	React.useEffect(() => {
		labels.rows.map((labelRow: LabelRow, rowIndex: number) => {
			// Only VALUE rows have entry fields
			if (labelRow.rowType == RowType.VALUE) {
				// Amount and Period values for each row
				let entry : BudgetFormEntry = {
					amount: "0.00",
					period: Period.MONTHLY
				};

				if (budget.get && labelRow.categoryReference) {
					let catRef = labelRow.categoryReference;
					// Populate from existing budget
					let category : BudgetCategory = budget.get.categories.get(catRef.category) as BudgetCategory;
					if (category) {
						let subcategory : BudgetSubcategory = category.subcategories.get(catRef.subcategory) as BudgetSubcategory;
						if (subcategory) {
							entry.amount = "" + asNumberString(subcategory.amount);
							entry.period = subcategory.period;
						}
					}

				}

				// Key each entry pair by the category reference ID
				let refID = labelRow.categoryReference ? labelRow.categoryReference.id : 0;
				if (budget.get != null || budgetForm.get(refID) == undefined) {
					budgetForm.set(refID, entry);
				}
			}
		});

		setBudgetForm(new Map(budgetForm));
	}, [budget.get, catalog.get]);



	// Generates a cell containing the entry field for the amount of a single subcategory
	function generateAmountCell(labelRow: LabelRow) : string | React.JSX.Element {
		let cellValue : string | React.JSX.Element = "";

		// Only VALUE rows have an entry field
		if (labelRow.rowType == RowType.VALUE) {
			cellValue = ( <Currency amount={0} /> );

			let catRef = labelRow.categoryReference as CategoryRecord;
			let budgetEntry = budgetForm.get(catRef.id) as BudgetFormEntry;

			if (budgetEntry) {
				cellValue = (<TextField 
					id={"amount_" + catRef.id}
					variant="outlined"
					size="small"
					error={Number.isNaN(+(budgetEntry.amount))}
					slotProps={{
						input: {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
							sx: { "& input": { textAlign: "right" } }
						},
					}}
					value={budgetEntry.amount}
					onChange={(event) => { setBudgetItemAmount(catRef.id, event.target.value); }}
				/>);
			}
		}

		return cellValue;
	}

	// Generate select widget for the associated amount's period
	function PeriodSelect({ labelRow } : { labelRow : LabelRow }) {
		if (labelRow.rowType == RowType.VALUE) {
			let catRef = labelRow.categoryReference as CategoryRecord;
			let id = catRef.id;

			return (
				<Select 
						id={"period_" + id}
						value={budgetForm.get(id)?.period}
						size="small"
						sx={{ minWidth: 120 }}
						onChange={(event) => { setBudgetItemPeriod(id, event.target.value); }}
				>
					<MenuItem value="DAILY">Daily</MenuItem>
					<MenuItem value="WEEKLY">Weekly</MenuItem>
					<MenuItem value="BIWEEKLY">Bi-Weekly</MenuItem>
					<MenuItem value="SEMIMONTHLY">Semi-Monthly</MenuItem>
					<MenuItem value="MONTHLY">Monthly</MenuItem>
					<MenuItem value="QUARTERLY">Quarterly</MenuItem>
					<MenuItem value="ANNUALLY">Annually</MenuItem>
				</Select>
			);
		} else {
			return (<></>);
		}
	}

	// Set the amount for a budget item.
	// onChange handler for the amount text field
	function setBudgetItemAmount(entryId: number, amount: string) {
		let budgetEntry = budgetForm.get(entryId);
		if (budgetEntry) {
			budgetEntry.amount = amount;
			setBudgetForm(new Map(budgetForm));
		}
	}

	// Set the period for a budget item
	// onChange handler for the period select widget
	function setBudgetItemPeriod(entryId: number, period: string) {
		let budgetEntry = budgetForm.get(entryId);
		let periodValue: Period = period as Period;

		if (budgetEntry) {
			budgetEntry.period = periodValue;
			setBudgetForm(new Map(budgetForm));
		}
	}

	// Calculate or display the row's amount for the given period
	function amountAsCurrency(labelRow: LabelRow, period: Period) {
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

	// Determine if all entry fields are valid
	// i.e. a budget name is provided (determined by presence of save handler function) and all amount entry fields are numbers
	function allFieldsValid() {
		if (handleSaveBudget == null) {
			return false;
		}

		let result = true;
		budgetForm.values().forEach((entry) => {
			if (Number.isNaN(+(entry.amount))) {
				result = false;
			}
		});

		return result;
	}

	// Save or update the budget
	function saveBudget() {
		if (handleSaveBudget) {
			// Generate a Budget object based on the amount and period entry fields
			let	newBudget : Budget = budget.get ? budget.get : {
				name: "",
				categories: new Map()
			};

			// Build budget from form data
			labels.rows.forEach((labelRow: LabelRow) => {
				if (labelRow.rowType == RowType.VALUE) {
					let catRef = labelRow.categoryReference as CategoryRecord;
					let budgetEntry = budgetForm.get(catRef.id);
					if (budgetEntry) {
						// Only add non-zero amounts
						let amount = +(budgetEntry.amount);
						if (!Number.isNaN(amount) && amount != 0) {
							// Create category and subcategory entries in the map if not present
							let category = newBudget.categories.get(catRef.category);
							if (!category) {
								category = {
									name: catRef.category,
									income: catRef.income,
									subcategories: new Map<string, BudgetSubcategory>()
								};
								newBudget.categories.set(catRef.category, category);
							}

							let subcategory = category.subcategories.get(catRef.subcategory);
							if (!subcategory) {
								subcategory = {
									budgetItemId: -1,
									name: catRef.subcategory,
									categoryReference: catRef,
									period: budgetEntry.period,
									amount: +(budgetEntry.amount)
								};
								category.subcategories.set(catRef.subcategory, subcategory);
							} else {
								subcategory.amount = +(budgetEntry.amount);
								subcategory.period = budgetEntry.period;
							}
						}
					}
				}
			});

			// Save the budget
			handleSaveBudget(newBudget);
		}
	}



	return (
		<>
			<Box>
				<Paper sx={{ mb: 2 }}>
					<BudgetTableTitlebar />

					<TableContainer >
						<Table
							aria-labelledby="tableTitle"
							size={'small'}
						>
							<BudgetTableHead />

							<TableBody>
								{ labels.rows.map((labelRow: LabelRow, rowIndex: number) => {
									return (
										<BudgetRow key={rowIndex} rowIndex={rowIndex} labelRow={labelRow}>
											<TableCell component="th" scope="row">{labelRow.category}</TableCell>
											<TableCell component="th" scope="row">{labelRow.subcategory}</TableCell>

											<TableCell align="right">{ generateAmountCell(labelRow) }</TableCell>
											<TableCell align="left"><PeriodSelect labelRow={labelRow}/></TableCell>

											<TableCell></TableCell>

											<TableCell>{ amountAsCurrency(labelRow, Period.MONTHLY) }</TableCell>
											<TableCell>{ amountAsCurrency(labelRow, Period.QUARTERLY) }</TableCell>
											<TableCell>{ amountAsCurrency(labelRow, Period.ANNUALLY) }</TableCell>
										</BudgetRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
				</Paper>

				<Box sx={{ mb: 2 }}>
					<Button
						variant="contained"
						disabled={!allFieldsValid()}
						onClick={(event) => { saveBudget() }}
					>Save Budget</Button>
				</Box>
			</Box>
		</>
	);
}

export default BudgetDisplay;
