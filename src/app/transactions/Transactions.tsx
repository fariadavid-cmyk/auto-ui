'use client'

import * as React from 'react';

import Grid from '@mui/material/Grid';

import dayjs from 'dayjs';

import { newStateTuple } from '@/types/general';
import { Catalog, CategoryOptions } from '@/types/categories';
import { SourceTypeImportConfig, Transaction } from "@/types/transactions";
import { queryCatalog, buildCategoryOptionsFromCatalog } from '@/utils/CategoryUtils';
import { endDateToString, startDateToString } from '@/utils/DateUtils';
import { fetchSourceTypes, fetchTransactions } from "@/io/transaction";

import { BusyTask, BusyTaskStates, newBusyTaskStates } from '../components/BusyTask';
import TransactionTable from "@/app/transactions/TransactionTable";
import { DateSelector, DateSelectorForm, SelectionStyle } from '../components/DateSelector';



function Transactions() {
	const [sourceTypes, setSourceTypes] = React.useState<SourceTypeImportConfig[]>([]);
	const [dateSelectorForm, setDateSelectorForm] = React.useState<DateSelectorForm>({
			selectionStyle: SelectionStyle.RANGE,
			startDate: dayjs().startOf('month'),
			endDate: dayjs().endOf('month')
		});
	const [triggerRefresh, setTriggerRefresh] = React.useState<boolean>(false);
	const [catalog, setCatalog] = React.useState<Catalog>({ categories: new Map() });
	const [transactions, setTransactions] = React.useState<Transaction[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<CategoryOptions>(new Map());
	const busyStates: BusyTaskStates = newBusyTaskStates("Transaction saved");

	React.useEffect(() => {
		console.log("Loading uncategorized transactions...");
		busyStates.working.start(async () => {
			let freshCatalog : Catalog = await queryCatalog();
			let sourceTypeConfigs : SourceTypeImportConfig[] = await fetchSourceTypes();
			let txns : Transaction[] = await fetchTransactions(startDateToString(dateSelectorForm.startDate), endDateToString(dateSelectorForm.endDate));
			let catOptions : CategoryOptions = buildCategoryOptionsFromCatalog(freshCatalog);

			setCatalog(freshCatalog);
			setSourceTypes(sourceTypeConfigs);
			setTransactions(txns);
			setCategoryOptions(catOptions);
			console.log("Loaded " + txns.length + " transactions");
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

			<TransactionTable
				catalog={newStateTuple<Catalog>(catalog, setCatalog)}
				sourceTypes={sourceTypes}
				txns={newStateTuple<Transaction[]>(transactions, setTransactions)} 
				categoryOptions={newStateTuple<CategoryOptions>(categoryOptions, setCategoryOptions)}
				busyStates={busyStates}
			/>

			<BusyTask states={busyStates} />
		</>
	)
}

export default Transactions;
