'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { deleteStatements } from '@/io/admin';
import { newStateTuple, SuccessResult } from '@/types/general';
import { BusyTaskStates } from '../components/BusyTask';
import ConfirmationDialog from '../components/ConfirmationDialog';



function ClearStatements(props : { busyStates: BusyTaskStates }) {
	const busyStates = props.busyStates;

	const [clearDialogOpen, setClearDialogOpen] = React.useState(false);



	function clearStatements() {
		busyStates.working.start(async () => {
			let result : SuccessResult = await deleteStatements();
			busyStates.message.set("Statements cleared");
			busyStates.taskComplete.set(result.success);
		});
	}

	const handleClearDialogOpen = () => {
		setClearDialogOpen(true);
	};

	return (
		<React.Fragment>
			<ConfirmationDialog
					openState={newStateTuple<boolean>(clearDialogOpen, setClearDialogOpen)}
					title="Clear all statements and transactions?"
					callback={clearStatements}
			>
				Clearing statements will remove all uploaded statements and transactions from your history.  Your expense book will be empty.
				Any defined categories and patterns will remain.
			</ConfirmationDialog>

			<Typography variant="h5" component="div">
				Clear Statements and Transactions
			</Typography>
			<Typography variant="subtitle1" component="div">
				Clear statements and transactions from your expense book.
				This erases your entire expense history.
			</Typography>
			<Box padding={3}>
				<Button
					variant="contained"
					onClick={handleClearDialogOpen}
				>Clear Statements</Button>
			</Box>
		</React.Fragment>
	);
}

export default ClearStatements;
