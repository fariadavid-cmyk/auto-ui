'use client'

import * as React from 'react';

import Grid from '@mui/material/Grid';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

import dayjs from 'dayjs';

import { newStateTuple } from '@/types/general';
import { Budget, BudgetBook, ExpenseBook } from "@/types/budget";
import { Catalog } from '@/types/categories';
import { queryCatalog } from '@/utils/CategoryUtils';
import { queryBudgets, queryExpenses } from '@/utils/BudgetUtils';
import { endMonthToString, startMonthToString } from '@/utils/DateUtils';

import { BusyTask, BusyTaskStates, newBusyTaskStates } from '@/app/components/BusyTask';
import ExpenseBookDisplay from "@/app/expenses/ExpenseBookDisplay";
import { DateSelector, DateSelectorForm, SelectionStyle } from '../components/DateSelector';



const emptyBook: ExpenseBook = {
	book: new Map(),
	amount: 0
};

function ExpenseBookGrid() {
	const [dateSelectorForm, setDateSelectorForm] = React.useState<DateSelectorForm>({
			selectionStyle: SelectionStyle.RANGE,
			startDate: dayjs().startOf('month'),
			endDate: dayjs().endOf('month')
		});
	const [triggerRefresh, setTriggerRefresh] = React.useState<boolean>(false);
	const [catalog, setCatalog] = React.useState<Catalog>({ categories: new Map() });
	const [budgetBook, setBudgetBook] = React.useState<BudgetBook>({} as BudgetBook);
	const [expenseBook, setExpenseBook] = React.useState<ExpenseBook>(emptyBook);
	const [budgetData, setBudgetData] = React.useState<Budget | null>(null);
	const [budgetOptions, setBudgetOptions] = React.useState<string[]>([]);
	const [budgetNameField, setBudgetNameField] = React.useState<string>("");
	const busyStates: BusyTaskStates = newBusyTaskStates("");

	React.useEffect(() => {
		console.log("Loading expense book...");
		busyStates.working.start(async () => {
			let freshCatalog : Catalog = await queryCatalog();
			let budgets : BudgetBook = await queryBudgets();
			let book : ExpenseBook = await queryExpenses(startMonthToString(dateSelectorForm.startDate), endMonthToString(dateSelectorForm.endDate));

			setCatalog(freshCatalog);
			setBudgetBook(budgets);
			setExpenseBook(book);

			let budgetOptions: string[] = [];
			budgets.budgets.keys().forEach( (budgetName : string) => {
				budgetOptions.push(budgetName);
			});
			setBudgetOptions(budgetOptions);

			console.log("Loaded expense book:");
			console.log(book);
		});
	}, [triggerRefresh]);

	// Populate fields with selected budget
	function selectBudget(budgetName : string) {
		setBudgetNameField(budgetName);

		if (budgetName && budgetBook.budgets.has(budgetName)) {
			setBudgetData(budgetBook.budgets.get(budgetName) as Budget);
		} else {
			setBudgetData(null);
		}
	}

	function selectDate() {
		setTriggerRefresh(!triggerRefresh);
	}

	return (
		<>

			<Grid container spacing={2} padding={2}>
				<Grid size={3}>
					<FormControl fullWidth>
						<InputLabel id="inputBudgetLabel">Budget</InputLabel>
						<Select
							labelId="inputBudgetLabel"
							id="inputBudget"
							value={budgetNameField}
							label="Budget"
							onChange={(event) => { selectBudget(event.target.value); }}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							{ budgetOptions.map( (budgetName) => (
								<MenuItem value={budgetName}>{budgetName}</MenuItem>
							)) }
						</Select>
						<FormHelperText>Select a budget to compare with your expenses</FormHelperText>
					</FormControl>
				</Grid>

				<DateSelector form={newStateTuple<DateSelectorForm>(dateSelectorForm, setDateSelectorForm)} callback={selectDate} />
			</Grid>

			<ExpenseBookDisplay
				catalog={newStateTuple<Catalog>(catalog, setCatalog)}
				budget={newStateTuple<Budget | null>(budgetData, setBudgetData)}
				book={newStateTuple<ExpenseBook>(expenseBook, setExpenseBook)}
			/>

			<BusyTask states={busyStates} />
		</>
	);
}

export default ExpenseBookGrid;
