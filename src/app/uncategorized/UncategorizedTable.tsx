'use client'

import * as React from 'react';

import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

import { StateTuple, newStateTuple, PersistedMultiEntities } from '@/types/general';
import { Catalog, CategoryRecord, CategoryOptions, CategorizationFlag } from "@/types/categories";
import { MultiEntity, SourceTypeImportConfig, Transaction, UncategorizedTransaction } from "@/types/transactions";
import { PatternFormFields } from "@/types/patterns";
import { getCategoryRecordFromCatalog } from '@/utils/CategoryUtils';
import { saveEntities } from "@/io/transaction";

import { BusyTaskStates } from '../components/BusyTask';
import { createCategoryFromForm } from '@/app/components/CategoryInput';
import PatternEntry from "@/app/uncategorized/PatternEntry";



function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (
	a: { [key in Key]: number | string },
	b: { [key in Key]: number | string },
) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof UncategorizedTransaction;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'date',
		numeric: false,
		disablePadding: true,
		label: 'Date'
	},
	{
		id: 'sourceType',
		numeric: false,
		disablePadding: false,
		label: 'Source'
	},
	{
		id: 'debit',
		numeric: true,
		disablePadding: false,
		label: 'Debit'
	},
	{
		id: 'credit',
		numeric: true,
		disablePadding: false,
		label: 'Credit'
	},
	{
		id: 'merchant',
		numeric: false,
		disablePadding: false,
		label: 'Merchant'
	},
	{
		id: 'action',
		numeric: false,
		disablePadding: false,
		label: 'Action'
	}
];

interface EnhancedTableProps {
	selectedRow: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof UncategorizedTransaction) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { order, orderBy, selectedRow, rowCount, onRequestSort } = props;
	const createSortHandler = (property: keyof UncategorizedTransaction) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'right' : 'left'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : 'asc'}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface EnhancedTableToolbarProps {
	isPatternEntryOpen: boolean;
	selectedRow: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const { isPatternEntryOpen, selectedRow } = props;
	return (
		<Toolbar
			sx={[
				{
					pl: { sm: 2 },
					pr: { xs: 1, sm: 1 },
				},
				isPatternEntryOpen && {
					bgcolor: (theme) =>
						alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
				},
			]}
		>
			{isPatternEntryOpen ? (
				<Typography
					sx={{ flex: '1 1 100%' }}
					color="inherit"
					variant="subtitle1"
					component="div"
				>
					Selected transaction {selectedRow}
				</Typography>
			) : (
				<Typography
					sx={{ flex: '1 1 100%' }}
					variant="h6"
					id="tableTitle"
					component="div"
				>
					Uncategorized Transactions
				</Typography>
			)}
		</Toolbar>
	);
}

function UncategorizedTable(props: {
			catalog: StateTuple<Catalog>,
			sourceTypes: SourceTypeImportConfig[],
			txns: StateTuple<UncategorizedTransaction[]>,
			categoryOptions: StateTuple<CategoryOptions>,
			busyStates: BusyTaskStates
		}) {
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof UncategorizedTransaction>('date');
	const [selected, setSelected] = React.useState(0);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [isPatternEntryOpen, setIsPatternEntryOpen] = React.useState(false);

	const [txnInfo, setTxnInfo] = React.useState({} as Transaction);
	const [formData, setFormData] = React.useState<PatternFormFields>({
		selectedCategory: null,
		inputCategory: "",
		isIncome: false,
		selectedSubcategory: null,
		inputSubcategory: "",
		merchant: "",
		action: "",
		rule: ""
	});

	const catalog : StateTuple<Catalog> = props.catalog;
	const sourceTypes : SourceTypeImportConfig[] = props.sourceTypes;
	const uncategorizedTxns : StateTuple<UncategorizedTransaction[]> = props.txns;
	const categoryOptions : StateTuple<CategoryOptions> = props.categoryOptions;
	const busyStates : BusyTaskStates = props.busyStates;


	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof UncategorizedTransaction,
	) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

    const togglePatternEntry = () => {
        setIsPatternEntryOpen(!isPatternEntryOpen);
    };

	const handleClick = (event: React.MouseEvent<unknown>, txn: UncategorizedTransaction) => {
		setSelected(txn.id);

		// Show pattern entry panel
		let txnInfo : Transaction = {
			id: 0,
			date: txn.date,
			month: txn.month,
			sourceType: txn.sourceType,
			debit: txn.debit,
			credit: txn.credit,
			merchant: txn.merchant,
			action: txn.action,
			category : {
				id: 0,
				category: "",
				income: false,
				subcategory: ""
			},
			flag: CategorizationFlag.UNCATEGORIZED
		}
		setTxnInfo(txnInfo);

		let resetFormFields : PatternFormFields = {
			selectedCategory: null,
			inputCategory: "",
			isIncome: false,
			selectedSubcategory: null,
			inputSubcategory: "",
			merchant: txn.merchant,
			action: txn.action,
			rule: ""
		};
		setFormData(resetFormFields);

        togglePatternEntry();
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};



	const handleSaveTransaction = (patternFields: PatternFormFields, includePattern: boolean, callback: (success: boolean) => void) => {
		uncategorizedTxns.get.forEach((value: UncategorizedTransaction, index: number) => {
			if (value.id == selected) {
				// Collect the category. The multi-save call will cascade the category ID
				let categoryRecord : CategoryRecord = getCategoryRecordFromCatalog(catalog.get, patternFields.inputCategory, patternFields.inputSubcategory);
				if (categoryRecord.id < 0) {
					// This is a new category. Populate the rest of the fields
					categoryRecord.income = patternFields.isIncome;
				}

				// Build the multi-entity for saving
				let multiEntity: MultiEntity = {
					category: categoryRecord,
					pattern: includePattern ? {
						id: -1,
						sourceType: value.sourceType,
						category: categoryRecord,
						merchant: patternFields.merchant,
						action: patternFields.action,
						rule: patternFields.rule
					} : null,
					transaction: {
						transactionId: value.id,
						categoryId: categoryRecord.id,
						flag: CategorizationFlag.CATEGORIZED
					}
				};

				// Save the transaction with the new category/subcategory info
				busyStates.working.start(async () => {
					let entity: PersistedMultiEntities = await saveEntities(multiEntity);
					if (entity.categoryId !== null && entity.categoryId >= 0) {
						if (!includePattern || (entity.patternId !== null && entity.patternId >= 0)) {
							if (entity.transactionId !== null && entity.transactionId != 0) {
								console.log("Transaction saved (" + entity.transactionId + ")");

								// Update catalog
								createCategoryFromForm(catalog.get, entity.categoryId, formData, categoryOptions.get);
								let newCatalog : Catalog = {...catalog.get};
								catalog.set(newCatalog);

								// Update transactions - Remove row from table
								let uncatTxns : UncategorizedTransaction[] = [...uncategorizedTxns.get];
								uncatTxns.splice(index, 1);
								uncategorizedTxns.set(uncatTxns);

								callback(true);
							} else {
								console.log("Failed to save transaction");
								callback(false);
							}
						} else {
							console.log("Failed to save pattern");
							callback(false);
						}
					} else {
						console.log("Failed to save category");
						callback(false);
					}
				});
			}
		});
	};



	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - uncategorizedTxns.get.length) : 0;

	const visibleRows = React.useMemo(
		() =>
			[...uncategorizedTxns.get]
				.sort(getComparator(order, orderBy))
				.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[uncategorizedTxns, order, orderBy, page, rowsPerPage]
	);



	return (
		<>
			<Box sx={{ width: '100%' }}>
				<Paper sx={{ width: '100%', mb: 2 }}>
					<EnhancedTableToolbar isPatternEntryOpen={isPatternEntryOpen} selectedRow={selected} />
					<TableContainer>
					<Table
						sx={{ minWidth: 750 }}
						aria-labelledby="tableTitle"
						size={'small'}
					>
						<EnhancedTableHead
							selectedRow={selected}
							order={order}
							orderBy={orderBy}
							onRequestSort={handleRequestSort}
							rowCount={uncategorizedTxns.get.length}
						/>
						<TableBody>
							{visibleRows.map((row, index) => {
								const isItemSelected = (selected == row.id);
								const labelId = `enhanced-table-checkbox-${index}`;

								return (
									<TableRow
										hover
										onClick={(event) => handleClick(event, row)}
										role="listitem"
										aria-checked={isItemSelected}
										tabIndex={-1}
										key={row.id}
										selected={isItemSelected}
										sx={{ cursor: 'pointer' }}
									>
										<TableCell component="th" id={labelId} scope="row" padding="none">
											{row.date}
										</TableCell>
										<TableCell align="left">{row.sourceType}</TableCell>
										<TableCell align="right">{row.debit}</TableCell>
										<TableCell align="right">{row.credit}</TableCell>
										<TableCell align="left">{row.merchant}</TableCell>
										<TableCell align="left">{row.action}</TableCell>
									</TableRow>
								);
							})}
							{emptyRows > 0 && (
								<TableRow
									style={{
										height: 33 * emptyRows,
									}}
								>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
					</TableContainer>
					<TablePagination
						rowsPerPageOptions={[5, 10, 25]}
						component="div"
						count={uncategorizedTxns.get.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</Paper>
			</Box>

			<PatternEntry
				isOpen={isPatternEntryOpen}
				toggle={togglePatternEntry}
				formData={newStateTuple<PatternFormFields>(formData, setFormData)}
				sourceTypes={sourceTypes}
				txnInfo={txnInfo}
				catalog={catalog}
				categoryOptions={categoryOptions}
				busyStates={busyStates}
				handleSaveTransaction={handleSaveTransaction}
			/>
		</>
	);
}

export default UncategorizedTable;
