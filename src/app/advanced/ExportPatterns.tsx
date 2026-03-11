'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { downloadPatterns } from '@/io/admin';
import { downloadBlob } from '@/utils/Files';
import { BusyTaskStates } from '../components/BusyTask';



interface ExportPatternsForm {
	selectedSourceType: string | null,
	inputSourceType: string,
};

function ExportPatterns(props : {
			sourceTypes : string[],
			busyStates: BusyTaskStates 
		}) {
	const sourceTypes = props.sourceTypes;
	const busyStates = props.busyStates;

	const [formData, setFormData] = React.useState<ExportPatternsForm>({
		selectedSourceType: null,
		inputSourceType: ""
	});



	function exportPatterns() {
		if (formData.selectedSourceType) {
			let sourceType : string = formData.selectedSourceType;
			busyStates.working.start(async () => {
				let result : Blob = await downloadPatterns(sourceType);
				downloadBlob(result, sourceType + ".json");
				busyStates.message.set("Patterns exported");
				busyStates.taskComplete.set(true);
			});
		}
	}

	return (
		<React.Fragment>
			<Typography variant="h5" component="div">
				Export Patterns
			</Typography>
			<Typography variant="subtitle1" component="div">
				Export patterns and categories to a JSON file. The file can be distributed, or edited and re-imported.
			</Typography>

			<Grid container spacing={2} padding={2} alignItems={"center"}>
				<Grid size={4}>
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
				</Grid>
				<Grid size={3}>
					<Button
						variant="contained"
						onClick={exportPatterns}
						disabled={ formData.selectedSourceType == null || formData.selectedSourceType != formData.inputSourceType }
					>Export Patterns</Button>
				</Grid>
			</Grid>
		</React.Fragment>
	);
}

export default ExportPatterns;
