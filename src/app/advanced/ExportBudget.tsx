'use client'

import * as React from 'react';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

import { downloadBudget } from '@/io/admin';
import { downloadBlob } from '@/utils/Files';
import { BusyTaskStates } from '../components/BusyTask';



interface ExportBudgetForm {
	selectedBudget: string
};

function ExportBudget(props : {
			budgets : string[],
			busyStates: BusyTaskStates 
		}) {
	const budgets = props.budgets;
	const busyStates = props.busyStates;

	const [formData, setFormData] = React.useState<ExportBudgetForm>({
		selectedBudget: ""
	});



	function exportBudget() {
		if (formData.selectedBudget) {
			let budget : string = formData.selectedBudget;
			busyStates.working.start(async () => {
				let result : Blob = await downloadBudget(budget);
				downloadBlob(result, budget + ".json");
				busyStates.message.set("Budget exported");
				busyStates.taskComplete.set(true);
			});
		}
	}

	return (
		<React.Fragment>
			<Typography variant="h5" component="div">
				Export Budget
			</Typography>
			<Typography variant="subtitle1" component="div">
				Export budget to a JSON file. The file can be distributed, or edited and re-imported.
			</Typography>

			<Grid container spacing={2} padding={2} alignItems={"center"}>
				<Grid size={4}>
					<FormControl fullWidth>
						<InputLabel id="inputBudgetLabel">Budget</InputLabel>
						<Select
							labelId="inputBudgetLabel"
							id="inputBudget"
							value={formData.selectedBudget}
							error={formData.selectedBudget == ""}
							label="Budget"
							onChange={(event) => { setFormData({ selectedBudget: event.target.value }); }}
						>
							{ budgets.map( (budgetName) => (
								<MenuItem value={budgetName}>{budgetName}</MenuItem>
							)) }
						</Select>
						<FormHelperText>Select a budget to export</FormHelperText>
					</FormControl>
				</Grid>
				<Grid size={3}>
					<Button
						variant="contained"
						onClick={exportBudget}
						disabled={ formData.selectedBudget == "" }
					>Export Budget</Button>
				</Grid>
			</Grid>
		</React.Fragment>
	);
}

export default ExportBudget;
