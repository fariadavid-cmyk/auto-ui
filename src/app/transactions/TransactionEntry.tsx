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
import { NewTransactionFormFields, SourceTypeImportConfig } from '@/types/transactions';

import { BusyTaskStates } from '../components/BusyTask';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import { MessageState, StatusMessage } from '../components/StatusMessage';



function TransactionEntry(props: {
            isOpen: boolean,
            toggle: () => void,
			sourceTypes : SourceTypeImportConfig[],
            formData: StateTuple<NewTransactionFormFields>,
            busyStates: BusyTaskStates,
            handleSaveTransaction: (transactionFields: NewTransactionFormFields, callback: (success: boolean) => void) => void;
        }) {
	const isOpen = props.isOpen;
	const sourceTypes = props.sourceTypes;
	const formData = props.formData;
	const busyStates = props.busyStates;

    const [creditDisabled, setCreditDisabled] = React.useState<boolean>(false);
    const [debitDisabled, setDebitDisabled] = React.useState<boolean>(false);

	// Result for saving txn
	const result = new MessageState();

    const sourceTypeNames : string[] = [];
    sourceTypes.forEach((sourceType) => {
        sourceTypeNames.push(sourceType.name);
    });

	// Toggles the drawer component
	const toggleDrawer = () => {
		result.setMessage("");

    	props.toggle();
    };

	function selectSourceType(sourceTypeName: string | null) {
		formData.set({ ...formData.get, selectedSourceType: sourceTypeName, inputSourceType: sourceTypeName ? sourceTypeName : "" });

		let sourceType: SourceTypeImportConfig | null = null;
		if (sourceTypeName) {
			for (const st of sourceTypes) {
				if (st.name == sourceTypeName) {
					sourceType = st;
				}
			}
		}
		
		if (sourceType) {
			setCreditDisabled(sourceType.creditField == null);
			setDebitDisabled(sourceType.debitField == null);
		} else {
			setCreditDisabled(false);
			setDebitDisabled(false);
		}
	}

    // Saves the transaction via the provided handler
    function submitTransaction(formFieldData: React.FormEvent<HTMLFormElement>) {
        formFieldData.preventDefault();

        props.handleSaveTransaction(formData.get, (success: boolean) => {
            if (success) {
                busyStates.message.set("Transaction saved");
                busyStates.taskComplete.set(true);
                toggleDrawer();
            } else {
				result.setMessage("Could not save transaction.", "error");
            }
        });
    }



	// Generate the form
	const DrawerForm = (
		<Box role="presentation" component="form" onSubmit={submitTransaction} padding={2}>
			<Grid container spacing={2}>
				<Grid size={3}>
					<Autocomplete
						id="inputSourcetype"
						freeSolo
						options={sourceTypeNames}
						renderInput={(params) => <TextField {...params} required label="Source Type" error={formData.get.selectedSourceType == null || formData.get.selectedSourceType != formData.get.inputSourceType} helperText="Select the source type of this transaction" />}
						value={formData.get.selectedSourceType}
						onChange={(event: any, newValue: string | null) => { selectSourceType(newValue); }}
						inputValue={formData.get.inputSourceType}
						onInputChange={(event, newInputValue) => { formData.set({ ...formData.get, inputSourceType: newInputValue, selectedSourceType: null }); }}
					/>
				</Grid>
				<Grid size={3}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Date"
                            value={formData.get.date}
                            onChange={(newDate : Dayjs | null) => formData.set({ ...formData.get, date: newDate })}
                        />
                    </LocalizationProvider>
                </Grid>
				<Grid size={3}>
					<TextField 
						id={"credit"}
						variant="outlined"
						size="small"
						label="Credit"
						disabled={creditDisabled}
						error={Number.isNaN(+(formData.get.credit))}
						slotProps={{
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
								sx: { "& input": { textAlign: "right" } }
							},
						}}
						value={formData.get.credit}
						helperText="Enter the credit value of this transaction. Enter only one of credit or debit."
						onChange={(event) => formData.set({ ...formData.get, credit: event.target.value })}
					/>
                </Grid>
				<Grid size={3}>
					<TextField 
						id={"debit"}
						variant="outlined"
						size="small"
						label="Debit"
						disabled={debitDisabled}
						error={Number.isNaN(+(formData.get.debit))}
						slotProps={{
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
								sx: { "& input": { textAlign: "right" } }
							},
						}}
						value={formData.get.debit}
						helperText="Enter the debit value of this transaction. Enter only one of credit or debit."
						onChange={(event) => formData.set({ ...formData.get, debit: event.target.value })}
					/>
                </Grid>

				<Grid size={6}>
					<TextField fullWidth
						required
						error={formData.get.merchant == ""}
						id="inputMerchantField"
						label="Merchant"
						value={formData.get.merchant}
						helperText="Enter the name of the merchant"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => formData.set({ ...formData.get, merchant: event.target.value })}
					/>
                </Grid>
				<Grid size={6}>
					<TextField fullWidth
						required
						error={formData.get.action == ""}
						id="inputActionField"
						label="Action"
						value={formData.get.action}
						helperText="Enter the action performed"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => formData.set({ ...formData.get, action: event.target.value })}
					/>
                </Grid>

				<Grid size={8}>
					<StatusMessage state={result} />
				</Grid>
				<Grid size={2}>
                </Grid>
				<Grid size={2}>
					<Button
						type="submit"
						variant="contained"
						disabled={formData.get.selectedSourceType == null || formData.get.date == null || formData.get.merchant == "" || formData.get.action == ""
							|| Number.isNaN(+(formData.get.credit)) || Number.isNaN(+(formData.get.debit)) || (+(formData.get.credit) != 0 && +(formData.get.debit) != 0)}
					>Create Transaction</Button>
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



export default TransactionEntry;
