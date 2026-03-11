'use client'

import * as React from 'react';

import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

import { SourceTypeImportConfig } from '@/types/transactions';
import { BudgetBook } from '@/types/budget';
import { queryBudgets } from '@/utils/BudgetUtils';
import { fetchSourceTypes } from '@/io/transaction';

import { BusyTask, BusyTaskStates, newBusyTaskStates } from '../components/BusyTask';
import Refresh from '@/app/advanced/Refresh';
import ClearStatements from "@/app/advanced/ClearStatements";
import ImportPatterns from "@/app/advanced/ImportPatterns";
import ExportPatterns from "@/app/advanced/ExportPatterns";
import ImportBudget from '@/app/advanced/ImportBudget';
import ExportBudget from '@/app/advanced/ExportBudget';
import DeleteSourceType from '@/app/advanced/DeleteSourceType';



function AdvancedOperations() {
	const busyStates: BusyTaskStates = newBusyTaskStates("Task Complete");

	// Source types and budgets
	const [sourceTypes, setSourceTypes] = React.useState<string[]>([]);
	const [budgets, setBudgets] = React.useState<string[]>([]);
	const [triggerRefresh, setTriggerRefresh] = React.useState(false);

	React.useEffect(() => {
		busyStates.working.start(async () => {
			let sourceTypeConfigs : SourceTypeImportConfig[] = await fetchSourceTypes();
			let budgetBooks : BudgetBook = await queryBudgets();

			const sourceTypeNames : string[] = [];
			sourceTypeConfigs.forEach((sourceType) => {
				sourceTypeNames.push(sourceType.name);
			});

			const budgetNames : string[] = [];
			budgetBooks.budgets.forEach((budget) => {
				budgetNames.push(budget.name);
			});

			setSourceTypes(sourceTypeNames);
			setBudgets(budgetNames);
		});
	}, [triggerRefresh]);

	function doTriggerRefresh() {
		setTriggerRefresh(!triggerRefresh);
	}

	const Item = styled(Paper) (({ theme }) => ({
		backgroundColor: '#fff',
		...theme.typography.body2,
		padding: theme.spacing(2),
		textAlign: 'left',
		color: (theme.vars ?? theme).palette.text.secondary,
		...theme.applyStyles('dark', {
			backgroundColor: '#1A2027',
		}),
	}));

	return (
		<>
			<Stack
				divider={<Divider orientation="horizontal" flexItem />}
				spacing={2}
				padding={1}
			>
				<Item><Refresh busyStates={busyStates} /></Item>
				<Item><ImportPatterns sourceTypes={sourceTypes} busyStates={busyStates} /></Item>
				<Item><ExportPatterns sourceTypes={sourceTypes} busyStates={busyStates}/></Item>
				<Item><ImportBudget busyStates={busyStates}/></Item>
				<Item><ExportBudget budgets={budgets} busyStates={busyStates}/></Item>
				<Item><DeleteSourceType sourceTypes={sourceTypes} busyStates={busyStates} triggerRefresh={doTriggerRefresh}/></Item>
				<Item><ClearStatements busyStates={busyStates} /></Item>
			</Stack>

			<BusyTask states={busyStates} />
		</>
	);
}

export default AdvancedOperations;
