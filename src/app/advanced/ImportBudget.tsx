'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';

import { useDropzone } from 'react-dropzone';

import { uploadBudget } from '@/io/admin';
import { newStateTuple, PersistedEntity } from '@/types/general';
import { BusyTaskStates } from '../components/BusyTask';
import ConfirmationDialog from '../components/ConfirmationDialog';



type UploadFormFields = {
	budgetFiles: File[]
};

function ImportBudget(props : {
			busyStates : BusyTaskStates
		}) {
	const busyStates = props.busyStates;

	const [importDialogOpen, setImportDialogOpen] = React.useState(false);
	const [formData, setFormData] = React.useState<UploadFormFields>({
		budgetFiles: []
	});



	function importBudget() {
		if (formData.budgetFiles.length > 0) {
			busyStates.working.start(async () => {
				let patternFile : File = formData.budgetFiles[0];
				let entity: PersistedEntity = await uploadBudget(patternFile);

				if (entity.persistId !== null) {
					setFormData({ budgetFiles: [] });
					busyStates.message.set("Budget imported");
					busyStates.taskComplete.set(true);
				}
			});
		}
	}

	const handleImportDialogOpen = () => {
		setImportDialogOpen(true);
	};

	const DropzoneArea = () => {
		const { getRootProps, getInputProps } = useDropzone({
			maxFiles: 1,
			onDrop: (acceptedFiles) => {
				setFormData({ budgetFiles: acceptedFiles });
			}
		});

		return (
			<div {...getRootProps()} style={{ border: '2px dashed gray', padding: 20 }}>
				<input {...getInputProps()} />
				<p>Drag file to upload here, or click to select</p>
				<List dense={true}>
					{formData.budgetFiles.map((file) =>
						<ListItem key={file.name}>
							<ListItemText primary={file.name}/>
						</ListItem>
					)}
				</List>
			</div>
		);
	};

	return (
		<React.Fragment>
			<ConfirmationDialog
					openState={newStateTuple<boolean>(importDialogOpen, setImportDialogOpen)}
					title="Import budget?"
					callback={importBudget}
			>
				Importing a budget will replace any existing budget with the same name and replace it with the contents of the uploaded file.
				Any new categories will be added. Previously defined categories will remain.
			</ConfirmationDialog>

			<Typography variant="h5" component="div">
				Import Budget
			</Typography>
			<Typography variant="subtitle1" component="div">
				Import budget and categories from a JSON file. This action replaces any existing budget with the same name.
			</Typography>

			<Box role="presentation" padding={2} sx={{ width: '50%' }}>
				<Stack spacing={2}>
					<DropzoneArea />

					<Button
						variant="contained"
						onClick={handleImportDialogOpen}
						disabled={ formData.budgetFiles == null || formData.budgetFiles.length != 1 }
					>Import Budget</Button>
				</Stack>
			</Box>
		</React.Fragment>
	);
}

export default ImportBudget;
