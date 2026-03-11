'use client'

import * as React from 'react';

import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { AutocompleteField, SuccessMessageResult, newStateTuple } from '@/types/general';
import { Catalog } from '@/types/categories';
import { Budget, BudgetBook } from "@/types/budget";
import { queryCatalog } from '@/utils/CategoryUtils';
import { queryBudgets } from '@/utils/BudgetUtils';
import { updateBudget } from '@/io/budget';

import { BusyTask, BusyTaskStates, newBusyTaskStates } from '../components/BusyTask';
import BudgetDisplay from "@/app/budget/BudgetDisplay";



function BudgetGrid() {
	const [catalog, setCatalog] = React.useState<Catalog>({ categories: new Map() });
	const [budgetBook, setBudgetBook] = React.useState<BudgetBook>({} as BudgetBook);
	const [budgetData, setBudgetData] = React.useState<Budget | null>(null);
	const [budgetOptions, setBudgetOptions] = React.useState<string[]>([]);
	const [budgetNameField, setBudgetNameField] = React.useState<AutocompleteField>({ select: null, input: "" });

	const [triggerRefresh, setTriggerRefresh] = React.useState<boolean>(false);
	const busyStates: BusyTaskStates = newBusyTaskStates("Budget saved");


	React.useEffect(() => {
		console.log("Loading budgets...");
		busyStates.working.start(async () => {
			let freshCatalog : Catalog = await queryCatalog();
			let budgets : BudgetBook = await queryBudgets();

			setCatalog(freshCatalog);
			setBudgetBook(budgets);

			let budgetOptions: string[] = [];
			budgets.budgets.keys().forEach( (budgetName : string) => {
				budgetOptions.push(budgetName);
			});
			setBudgetOptions(budgetOptions);

			console.log("Loaded budgets:");
			console.log(budgets);
		});
	}, [triggerRefresh]);

	// Populate fields with selected budget or clear for a new budget
	function selectBudget(budgetName : string | null) {
		setBudgetNameField({ select: budgetName, input: budgetName ? budgetName : "" });

		if (budgetName && budgetBook.budgets.has(budgetName)) {
			setBudgetData(budgetBook.budgets.get(budgetName) as Budget);
		} else {
			setBudgetData(null);
		}
	}

	function inputBudget(budgetName : string) {
		setBudgetNameField({ input: budgetName, select: null });
		setBudgetData(null);
	}

	function saveBudget(budget: Budget) {
		console.log("Saving budget...");
		budget.name = budgetNameField.input;

		busyStates.working.start(async () => {
			let result : SuccessMessageResult = await updateBudget(budget);
			if (result.success) {
				budgetBook.budgets.set(budget.name, budget);
				setBudgetBook({ ...budgetBook });

				console.log("Saved budget:");
				busyStates.message.set("Budget saved");
				busyStates.taskComplete.set(true);
				setTriggerRefresh(!triggerRefresh);
			} else {
				console.log("Failed to save budget: " + result.message);
			}
		});
	}

	return (
		<>
			<Box role="presentation" padding={2}>
				<Autocomplete
					id="inputBudget"
					freeSolo
					options={budgetOptions}
					renderInput={(params) => <TextField {...params} required label="Budget" error={budgetNameField.input.length == 0} helperText="Select or enter the name of this budget" />}
					value={budgetNameField.select}
					onChange={(event, newValue) => { selectBudget(newValue); }}
					inputValue={budgetNameField.input}
					onInputChange={(event, newInputValue) => { inputBudget(newInputValue); }}
				/>
			</Box>
			
			<BudgetDisplay
				catalog={newStateTuple<Catalog>(catalog, setCatalog)}
				budget={newStateTuple<Budget | null>(budgetData, setBudgetData)}
				handleSaveBudget={budgetNameField.input.length > 0 ? saveBudget : null}
			/>

			<BusyTask states={busyStates} />
		</>
	);
}

export default BudgetGrid;
