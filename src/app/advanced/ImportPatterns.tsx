'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { useDropzone } from 'react-dropzone';

import { uploadPatterns } from '@/io/admin';
import { newStateTuple, PersistedEntity } from '@/types/general';
import { BusyTaskStates } from '../components/BusyTask';
import ConfirmationDialog from '../components/ConfirmationDialog';



type UploadFormFields = {
	selectedSourceType: string | null,
	inputSourceType: string,
	patternFiles: File[]
};

function ImportPatterns(props : {
			sourceTypes : string[],
			busyStates : BusyTaskStates
		}) {
	const sourceTypes = props.sourceTypes;
	const busyStates = props.busyStates;

	const [importDialogOpen, setImportDialogOpen] = React.useState(false);
	const [formData, setFormData] = React.useState<UploadFormFields>({
		selectedSourceType: null,
		inputSourceType: "",
		patternFiles: []
	});



	function importPatterns() {
		if (formData.patternFiles.length > 0) {
			busyStates.working.start(async () => {
				let patternFile : File = formData.patternFiles[0];
				let entity: PersistedEntity = await uploadPatterns(formData.selectedSourceType as string, patternFile);

				if (entity.persistId !== null) {
					setFormData({ ...formData, patternFiles: [] });
					busyStates.message.set("Patterns imported");
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
				setFormData({ ...formData, patternFiles: acceptedFiles });
			}
		});

		return (
			<div {...getRootProps()} style={{ border: '2px dashed gray', padding: 20 }}>
				<input {...getInputProps()} />
				<p>Drag file to upload here, or click to select</p>
				<List dense={true}>
					{formData.patternFiles.map((file) =>
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
					title="Import patterns?"
					callback={importPatterns}
			>
				Importing patterns will remove all configured patterns for the selected source type and replace them with the contents of the uploaded file.
				Any new categories will be added. Previously defined categories will remain.
			</ConfirmationDialog>

			<Typography variant="h5" component="div">
				Import Patterns
			</Typography>
			<Typography variant="subtitle1" component="div">
				Import patterns and categories from a JSON file. This action replaces any and all patterns for the selected source type.
			</Typography>

			<Box role="presentation" padding={2} sx={{ width: '50%' }}>
				<Stack spacing={2}>
					<Autocomplete
						id="inputSourcetype"
						freeSolo
						options={sourceTypes}
						renderInput={(params) => <TextField {...params} required label="Source Type" error={formData.selectedSourceType == null || formData.selectedSourceType != formData.inputSourceType} helperText="Select the statement source patterns to export" />}
						value={formData.selectedSourceType}
						onChange={(event: any, newValue: string | null) => { setFormData({ ...formData, selectedSourceType: newValue, inputSourceType: newValue ? newValue : "" }); }}
						inputValue={formData.inputSourceType}
						onInputChange={(event, newInputValue) => { setFormData({ ...formData, inputSourceType: newInputValue }); }}
					/>

					<DropzoneArea />

					<Button
						variant="contained"
						onClick={handleImportDialogOpen}
						disabled={ formData.selectedSourceType == null || formData.selectedSourceType != formData.inputSourceType || formData.patternFiles == null || formData.patternFiles.length != 1 }
					>Import Patterns</Button>
				</Stack>
			</Box>
		</React.Fragment>
	);
}

export default ImportPatterns;
