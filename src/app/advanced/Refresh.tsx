'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { refreshCategoriesAndPatterns } from '@/io/admin';
import { StateTuple, newStateTuple, TransitionTuple, newTransitionTuple, SuccessResult } from '@/types/general';
import { BusyTaskStates } from '../components/BusyTask';



function Refresh(props : { busyStates : BusyTaskStates }) {
	const busyStates = props.busyStates;



	function refresh() {
		busyStates.working.start(async () => {
			let result : SuccessResult = await refreshCategoriesAndPatterns();
			busyStates.taskComplete.set(result.success);
		});
	}

	return (
		<React.Fragment>
			<Typography variant="h5" component="div">
				Refresh Categories and Patterns
			</Typography>
			<Typography variant="subtitle1" component="div">
				Reloads all categories and patterns from the data store.
				Use this task if the database has been modified manually and the budget server needs to reflect the changes.
			</Typography>
			<Box padding={3}>
				<Button
					variant="contained"
					onClick={refresh}
				>Refresh</Button>
			</Box>
		</React.Fragment>
	);
}

export default Refresh;
