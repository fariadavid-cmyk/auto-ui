'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { BusyTaskStates } from '../components/BusyTask';
import { deleteSourceType } from '@/io/admin';
import { newStateTuple, SuccessResult } from '@/types/general';
import ConfirmationDialog from '../components/ConfirmationDialog';



interface DeleteSourceTypeForm {
	selectedSourceType: string | null,
	inputSourceType: string,
};

function DeleteSourceType(props : {
			sourceTypes : string[],
			busyStates: BusyTaskStates,
			triggerRefresh: () => void
		}) {
	const sourceTypes = props.sourceTypes;
	const busyStates = props.busyStates;
	const triggerRefresh = props.triggerRefresh;

	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [formData, setFormData] = React.useState<DeleteSourceTypeForm>({
		selectedSourceType: null,
		inputSourceType: ""
	});



	function deleteTheSourceType() {
		if (formData.selectedSourceType) {
			let sourceType : string = formData.selectedSourceType;
			busyStates.working.start(async () => {
				let result : SuccessResult = await deleteSourceType(sourceType);

				if (result.success) {
					busyStates.message.set("Source type deleted");
				} else {
					busyStates.message.set("Failed to delete source type");
				}
				busyStates.taskComplete.set(true);
				triggerRefresh();
			});
		}
	}

	const handleDeleteDialogOpen = () => {
		setDeleteDialogOpen(true);
	};

	return (
		<React.Fragment>
			<ConfirmationDialog
					openState={newStateTuple<boolean>(deleteDialogOpen, setDeleteDialogOpen)}
					title="Delete Source Type?"
					callback={deleteTheSourceType}
			>
				Deleting a source type will remove it from the repositoy, along with all of its associated statements, transactions, and pattern definitions.
			</ConfirmationDialog>

			<Typography variant="h5" component="div">
				Delete Source Type
			</Typography>
			<Typography variant="subtitle1" component="div">
				Delete a source type and all its associated statements, transactions, and patterns.
			</Typography>

			<Grid container spacing={2} padding={2} alignItems={"center"}>
				<Grid size={4}>
					<Autocomplete
						id="inputSourcetype"
						freeSolo
						options={sourceTypes}
						renderInput={(params) => <TextField {...params} required label="Source Type" error={formData.selectedSourceType == null || formData.selectedSourceType != formData.inputSourceType} helperText="Select the source type to delete" />}
						value={formData.selectedSourceType}
						onChange={(event: any, newValue: string | null) => { setFormData({ ...formData, selectedSourceType: newValue, inputSourceType: newValue ? newValue : "" }); }}
						inputValue={formData.inputSourceType}
						onInputChange={(event, newInputValue) => { setFormData({ ...formData, inputSourceType: newInputValue }); }}
					/>
				</Grid>
				<Grid size={3}>
					<Button
						variant="contained"
						onClick={handleDeleteDialogOpen}
						disabled={ formData.selectedSourceType == null || formData.selectedSourceType != formData.inputSourceType }
					>Delete Source Type</Button>
				</Grid>
			</Grid>
		</React.Fragment>
	);
}

export default DeleteSourceType;
