'use client'

import * as React from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { newStateTuple, newTransitionTuple, StateTuple, TransitionTuple } from '@/types/general';



export type BusyTaskStates = {
    message: StateTuple<string>,
    working : TransitionTuple,
    taskComplete : StateTuple<boolean>
};



function newBusyTaskStatesObject(
            messageTuple: StateTuple<string>,
            workingTuple : TransitionTuple,
            taskTuple : StateTuple<boolean>
        ) : BusyTaskStates {
    let states = {
        message: messageTuple,
        working: workingTuple,
        taskComplete: taskTuple
    };

    return states;
}

function newBusyTaskStates(initialMessage: string) : BusyTaskStates {
    const [message, setMessage] = React.useState(initialMessage);
    const [isWorking, startWorking] = React.useTransition();
    const [taskCompleteOpen, setTaskCompleteOpen] = React.useState(false);

    const messageTuple : StateTuple<string> = newStateTuple(message, setMessage);
    const workingTuple : TransitionTuple = newTransitionTuple(isWorking, startWorking);
    const taskTuple : StateTuple<boolean> = newStateTuple(taskCompleteOpen, setTaskCompleteOpen);

    return newBusyTaskStatesObject(messageTuple, workingTuple, taskTuple);
}



function BusyTask(props: { states: BusyTaskStates }) {
    const states = props.states;

	// Manage display of task completion snackbar
	const handleSnackbarClose = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
		if (reason === 'clickaway') {
			return;
		}
		states.taskComplete.set(false);
	};

    // Snackbar close icon
	const taskCompletionSnackbar = (
		<React.Fragment>
			<IconButton
				size="small"
				aria-label="close"
				color="inherit"
				onClick={handleSnackbarClose}
			>
				<CloseIcon fontSize="small" />
			</IconButton>
		</React.Fragment>
	);

    return (
        <>
			<Backdrop
				sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
				open={states.working.busy}
			>
				<CircularProgress color="inherit" />
			</Backdrop>

			<Snackbar
				open={states.taskComplete.get}
				autoHideDuration={6000}
				onClose={handleSnackbarClose}
				message={states.message.get}
				action={taskCompletionSnackbar}
			/>
        </>
    );
}



export { BusyTask, newBusyTaskStates }