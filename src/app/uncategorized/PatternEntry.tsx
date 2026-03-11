'use client'

import * as React from 'react';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

import { StateTuple, SuccessMessageResult, newStateTuple } from '@/types/general';
import { Catalog, CategoryOptions } from '@/types/categories';
import { PatternFormFields, TestPattern } from '@/types/patterns';

import { CategoryInput } from '@/app/components/CategoryInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { SourceTypeImportConfig, Transaction } from '@/types/transactions';
import { testPattern } from '@/io/pattern';
import { BusyTaskStates } from '../components/BusyTask';
import { MessageState, StatusMessage } from '../components/StatusMessage';



// Object type to hold state values tracking if the pattern matches the transaction value
type PatternMatch = {
	isMatch: boolean,
	helperText: string
}

function PatternEntry(props: { 
			isOpen: boolean,
			toggle: () => void,
			formData: StateTuple<PatternFormFields>,
			txnInfo: Transaction,
			sourceTypes : SourceTypeImportConfig[],
			catalog: StateTuple<Catalog>,
			categoryOptions: StateTuple<CategoryOptions>,
			busyStates: BusyTaskStates,
			handleSaveTransaction: (patternFields: PatternFormFields, includePattern: boolean, callback: (success: boolean) => void) => void
		}) {
	const isOpen = props.isOpen;
	const formData = props.formData;
	const txnInfo = props.txnInfo;
	const sourceTypes = props.sourceTypes;
	const catalog = props.catalog;
	const categoryOptionsMap = props.categoryOptions;
	const busyStates = props.busyStates;

	// State for showing/hiding advanced rule fields
	const [showAdvancedRule, setShowAdvancedRule] = React.useState<boolean>(false)
	const [ruleTested, setRuleTested] = React.useState<boolean>(false)

	// State values validating merchant and action pattern matches
	const [merchantMatch, setMerchantMatch] = React.useState<PatternMatch>({
		isMatch: true,
		helperText: ""
	})
	const [actionMatch, setActionMatch] = React.useState<PatternMatch>({
		isMatch: true,
		helperText: ""
	})

	// Transition and result for saving pattern
	const result = new MessageState();

	const sourceTypeConfig = getSourceTypeByName(txnInfo.sourceType);



	function getSourceTypeByName(sourceTypeName : string) : SourceTypeImportConfig | null {
		let	foundSourceType: SourceTypeImportConfig | null = null;

		sourceTypes.forEach((sourceType) => {
			if (sourceType.name == sourceTypeName) {
				foundSourceType = sourceType;
			}
		});

		return foundSourceType;
	}

	// Toggles the drawer component
	// Clears the match state for merchant and action patterns
	const toggleDrawer = () => {
		setMerchantMatch({ isMatch: true, helperText: "" });
		setActionMatch({ isMatch: true, helperText: "" });
		result.setMessage("");

    	props.toggle();
    };

	// Determines if the pattern is a match for the value
	// Wraps the pattern in ^ and $ to match the entire value
	function isMatch(pattern: string, value: string): boolean {
		let regExp: RegExp;

		try {
			regExp = new RegExp("^" + pattern + "$", "i");
		} catch (e) {
			console.log("Error in regular expression: ", e);
			return false;
		}

		return regExp.test(value);
	}

	// Determines if the pattern for "merchant" matches the value in the transaction
	function checkMerchantMatch(pattern: string, value: string): boolean {
		formData.set({ ...formData.get, merchant: pattern });
		let result: boolean = isMatch(pattern, value);
		setMerchantMatch({ isMatch: result, helperText: result ? "" : "This pattern does not match the selected merchant" });
		return result;
	}

	// Determines if the pattern for "action" matches the value in the transaction
	function checkActionMatch(pattern: string, value: string): boolean {
		formData.set({ ...formData.get, action: pattern });
		let result: boolean = isMatch(pattern, value);
		setActionMatch({ isMatch: result, helperText: result ? "" : "This pattern does not match the selected action" });
		return result;
	}

	// Tests the defined rule against this transaction on the server
	function testRule() {
		busyStates.working.start(async () => {
			let test: TestPattern = {
				pattern: {
					merchant: formData.get.merchant,
					action: formData.get.action,
					rule: formData.get.rule
				},
				transaction: {
					date: txnInfo.date,
					month: txnInfo.month,
					credit: txnInfo.credit,
					debit: txnInfo.debit,
					merchant: txnInfo.merchant,
					action: txnInfo.action
				}
			};

			let testResult: SuccessMessageResult = await testPattern(test);
			result.setMessage(testResult.message, testResult.success ? "success" : "error");
			setRuleTested(testResult.success);
		});
	}

	// Applies the category to the transaction only. Does not create a pattern.
	function applyCategory() {
		props.handleSaveTransaction(formData.get, false, (success: boolean) => {
			if (success) {
				busyStates.message.set("Transaction updated");
				busyStates.taskComplete.set(true);
				toggleDrawer();
			} else {
				result.setMessage("Could not save updated transaction.", "error");
			}
		});
	}

	// Saves the pattern to the store upon form submission
	function submitTransaction(formFieldData: React.FormEvent<HTMLFormElement>) {
		formFieldData.preventDefault();

		props.handleSaveTransaction(formData.get, true, (success: boolean) => {
			if (success) {
				busyStates.message.set("Pattern saved");
				busyStates.taskComplete.set(true);
				toggleDrawer();
			} else {
				result.setMessage("Could not save updated transaction.", "error");
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
						defaultValue={txnInfo.sourceType}
					/>
				</Grid>

				<CategoryInput 
					formData={formData}
					catalog={catalog}
					categoryOptions={categoryOptionsMap}
				/>

				<Grid size={2}>
					<Button
						variant="contained"
						disabled={formData.get.inputCategory.length == 0 || formData.get.inputSubcategory.length == 0}
						onClick={applyCategory}
					>Apply Category</Button>
				</Grid>

				<Grid size={6}>
					<TextField fullWidth
						required
						error={!showAdvancedRule && !merchantMatch.isMatch}
						id="inputMerchantField"
						label="Merchant Pattern"
						disabled={showAdvancedRule}
						value={formData.get.merchant}
						helperText={merchantMatch.helperText}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => { checkMerchantMatch(event.target.value, txnInfo.merchant); }}
					/>
				</Grid>
				<Grid size={6}>
					<TextField
						required fullWidth
						error={!showAdvancedRule && !actionMatch.isMatch}
						id="inputActionField"
						label="Action Pattern"
						disabled={showAdvancedRule || (sourceTypeConfig != null && sourceTypeConfig.actionField == null)}
						value={formData.get.action}
						helperText={actionMatch.helperText}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => { checkActionMatch(event.target.value, txnInfo.action); }}
					/>
				</Grid>
				<Grid size={12} container alignItems={"center"}>
					<Grid size={10} sx={{display: showAdvancedRule ? 'inline' : 'none'}}>
						<TextField fullWidth
							id="inputRuleField"
							multiline
							value={formData.get.rule}
							helperText="Enter advanced rule definition"
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => { 
								formData.set({...formData.get, rule: event.target.value});
								setRuleTested(false);
								result.setMessage("");
							}}
						/>
					</Grid>
					<Grid size={2} sx={{display: showAdvancedRule ? 'inline' : 'none'}}>
						<Button
							variant="contained"
							disabled={formData.get.rule.length == 0}
							onClick={testRule}
						>Test Rule</Button>
					</Grid>
				</Grid>
				<Grid size={2}>
					<StatusMessage state={result} />
				</Grid>
				<Grid size={5}>
				</Grid>
				<Grid size={3}>
					<FormControlLabel control={<Checkbox 
						id="showAdvancedRuleField"
						checked={showAdvancedRule}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setShowAdvancedRule(event.target.checked); }}
					/>} label="Use advanced rule definition" />
				</Grid>
				<Grid size={2}>
					<Button
						type="submit"
						variant="contained"
						disabled={(showAdvancedRule && !ruleTested) || (!showAdvancedRule && (!merchantMatch.isMatch || !actionMatch.isMatch)) || formData.get.inputCategory.length == 0 || formData.get.inputSubcategory.length == 0}
					>Add Pattern</Button>
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

export default PatternEntry;
