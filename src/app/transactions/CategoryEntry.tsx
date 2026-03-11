'use client'

import * as React from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { StateTuple, newStateTuple } from "@/types/general";
import { Catalog, CategoryOptions, CategorizationFlag } from '@/types/categories';
import { DisplayTransaction, TransactionFormFields } from '@/types/transactions';

import { BusyTaskStates } from '../components/BusyTask';
import { CategoryInput } from '@/app/components/CategoryInput';



function CategoryEntry(props: { 
			isOpen: boolean; 
			toggle: () => void; 
			formData: StateTuple<TransactionFormFields>; 
			transaction: DisplayTransaction;
			catalog: StateTuple<Catalog>,
			categoryOptions: StateTuple<CategoryOptions>;
			busyStates: BusyTaskStates,
			handleSaveTransaction: (categoryFields: TransactionFormFields, callback: (success: boolean) => void) => void;
		}) {
	const isOpen = props.isOpen;
	const formData = props.formData;
	const transaction = props.transaction;
	const catalog = props.catalog;
	const busyStates = props.busyStates;
	const categoryOptionsMap = props.categoryOptions;

	// Transition and result for saving category
	const [submissionResult, setSubmissionResult] = React.useState<string>("");



	// Toggles the drawer component
	// Clears the match state for merchant and action patterns
	const toggleDrawer = () => {
		setSubmissionResult("");

    	props.toggle();
    };

	// Removes the category info from the transation
	function removeCategorization(event: React.MouseEvent<unknown>) {
		let clearedForm : TransactionFormFields = {
			selectedCategory : null,
			inputCategory : "",
			isIncome : false,
			selectedSubcategory : null,
			inputSubcategory : "",
			flag : CategorizationFlag.UNCATEGORIZED
		};

		props.handleSaveTransaction(clearedForm, (success: boolean) => {
			if (success) {
				busyStates.message.set("Transaction saved");
				busyStates.taskComplete.set(true);
				toggleDrawer();
			} else {
				setSubmissionResult("Could not remove categorization from transaction.");
			}
		});

		formData.set(clearedForm);
	}

	// Saves the category and transaction via the provided handler
	function submitTransaction(formFieldData: React.FormEvent<HTMLFormElement>) {
		formFieldData.preventDefault();

		formData.get.flag = CategorizationFlag.CATEGORIZED;

		props.handleSaveTransaction(formData.get, (success: boolean) => {
			if (success) {
				busyStates.message.set("Transaction saved");
				busyStates.taskComplete.set(true);
				toggleDrawer();
			} else {
				setSubmissionResult("Could not save updated transaction.");
			}
		});
	}



	// Generate the form
	const DrawerForm = (
		<Box role="presentation" component="form" onSubmit={submitTransaction} padding={2}>
			<Grid container spacing={2}>
				<Grid size={3}>
					<TextField fullWidth
						disabled
						id="inputSourceTypeField"
						label="Source Type"
						defaultValue={transaction.sourceType}
					/>
				</Grid>

				<CategoryInput 
					formData={formData}
					catalog={catalog}
					categoryOptions={categoryOptionsMap}
				/>

				<Grid size={8}>
					<Typography color="error">{submissionResult}</Typography>
				</Grid>
				<Grid size={2}>
					<Button
						variant="contained"
						onClick={removeCategorization}
					>Uncategorize</Button>
				</Grid>
				<Grid size={2}>
					<Button
						type="submit"
						variant="contained"
						disabled={formData.get.inputCategory.length == 0 || formData.get.inputSubcategory.length == 0}
					>Update Transaction</Button>
				</Grid>
			</Grid>
		</Box>
	);

	return (
		<div>
			<Drawer anchor='bottom' open={isOpen} onClose={toggleDrawer}>
				{DrawerForm}
			</Drawer>
		</div>
	);
}

export default CategoryEntry;
