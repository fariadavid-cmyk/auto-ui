'use client'

import * as React from 'react';

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import dayjs from 'dayjs';

import { newStateTuple } from '@/types/general';
import { Catalog, CategoryOptions } from '@/types/categories';
import { UncategorizedTransaction, Transaction, SourceTypeImportConfig } from "@/types/transactions";
import { endDateToString, startDateToString } from '@/utils/DateUtils';
import { buildCategoryOptionsFromCatalog, queryCatalog } from '@/utils/CategoryUtils';
import { applyCategorization } from "@/io/category";
import { fetchSourceTypes, fetchUncategorized } from "@/io/transaction";

import { BusyTask, BusyTaskStates, newBusyTaskStates } from '../components/BusyTask';
import { DateSelector, DateSelectorForm, SelectionStyle } from '../components/DateSelector';
import UncategorizedTable from "@/app/uncategorized/UncategorizedTable";



function Uncategorized() {
	const [dateSelectorForm, setDateSelectorForm] = React.useState<DateSelectorForm>({
			selectionStyle: SelectionStyle.RANGE,
			startDate: dayjs().startOf('month'),
			endDate: dayjs().endOf('month')
		});
	const [sourceTypes, setSourceTypes] = React.useState<SourceTypeImportConfig[]>([]);
	const [uncategorizedTxns, setUncategorizedTxns] = React.useState<UncategorizedTransaction[]>([]);
	const [catalog, setCatalog] = React.useState<Catalog>({ categories: new Map() });
	const [categoryOptions, setCategoryOptions] = React.useState<CategoryOptions>(new Map());
	const [triggerRefresh, setTriggerRefresh] = React.useState<boolean>(false);
	const busyStates: BusyTaskStates = newBusyTaskStates("Pattern saved");

	function doCategorize(event: React.MouseEvent<unknown>) {
		console.log("Perform categorization");
		busyStates.working.start(async () => {
			let txns : Transaction[] = await applyCategorization();

			setTriggerRefresh(!triggerRefresh);
		});
	}

	React.useEffect(() => {
		console.log("Loading uncategorized transactions...");
		busyStates.working.start(async () => {
			let freshCatalog : Catalog = await queryCatalog();
			let sourceTypeConfigs : SourceTypeImportConfig[] = await fetchSourceTypes();
			let uncatTxns : UncategorizedTransaction[] = await fetchUncategorized(startDateToString(dateSelectorForm.startDate), endDateToString(dateSelectorForm.endDate));
			let catOptions : CategoryOptions = buildCategoryOptionsFromCatalog(freshCatalog);

			setCatalog(freshCatalog);
			setSourceTypes(sourceTypeConfigs);
			setUncategorizedTxns(uncatTxns);
			setCategoryOptions(catOptions);
			console.log("Loaded " + uncatTxns.length + " uncategorized transactions");
		});
	}, [triggerRefresh]);

	function selectDate() {
		setTriggerRefresh(!triggerRefresh);
	}

	return (
		<>
			<Grid container spacing={2} padding={2}>
				<DateSelector form={newStateTuple<DateSelectorForm>(dateSelectorForm, setDateSelectorForm)} callback={selectDate} />
			</Grid>

			<Grid container spacing={2} padding={2}>
				<Grid size={10}>
					<p>Select a transaction to define a category and matching pattern for it.</p>
				</Grid>
				<Grid size={2}>
					<Tooltip title="Apply category patterns to uncategorized transactions" arrow>
						<span><Button variant="contained" onClick={doCategorize}>Categorize</Button></span>
					</Tooltip>
				</Grid>
			</Grid>

			<UncategorizedTable
				catalog={newStateTuple<Catalog>(catalog, setCatalog)}
				sourceTypes={sourceTypes}
				txns={newStateTuple<UncategorizedTransaction[]>(uncategorizedTxns, setUncategorizedTxns)}
				categoryOptions={newStateTuple<CategoryOptions>(categoryOptions, setCategoryOptions)}
				busyStates={busyStates}
			/>

			<BusyTask states={busyStates} />
		</>
	)
}

export default Uncategorized;
  