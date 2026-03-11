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
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import dayjs, { Dayjs } from 'dayjs';

import AddIcon from '@mui/icons-material/Add';
import EmergencyOutlinedIcon from '@mui/icons-material/EmergencyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { StateTuple, newStateTuple, PersistedMultiEntities, PersistedEntity } from '@/types/general';
import { Catalog, CategoryRecord, CategoryOptions, CategorizationFlag } from "@/types/categories";
import { DisplayTransaction, MultiEntity, NewTransactionFormFields, SourceTypeImportConfig, Transaction, TransactionFormFields } from "@/types/transactions";
import { getCategoryRecordFromCatalog } from '@/utils/CategoryUtils';
import { dateToString } from '@/utils/DateUtils';
import { saveTransaaction, saveEntities } from "@/io/transaction";

import { BusyTaskStates } from '../components/BusyTask';
import { createCategoryFromForm } from '@/app/components/CategoryInput';
import CategoryEntry from './CategoryEntry';
import TransactionEntry from './TransactionEntry';



enum ValueType {
	CHAR,
	NUMERIC,
	ICON
}

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
	id: keyof DisplayTransaction;
	label: string;
	valueType: ValueType;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'date',
		valueType: ValueType.CHAR,
		disablePadding: true,
		label: 'Date'
	},
	{
		id: 'sourceType',
		valueType: ValueType.CHAR,
		disablePadding: false,
		label: 'Source'
	},
	{
		id: 'debit',
		valueType: ValueType.NUMERIC,
		disablePadding: false,
		label: 'Debit'
	},
	{
		id: 'credit',
		valueType: ValueType.NUMERIC,
		disablePadding: false,
		label: 'Credit'
	},
	{
		id: 'merchant',
		valueType: ValueType.CHAR,
		disablePadding: false,
		label: 'Merchant'
	},
	{
		id: 'action',
		valueType: ValueType.CHAR,
		disablePadding: false,
		label: 'Action'
	},
	{
		id: 'category',
		valueType: ValueType.CHAR,
		disablePadding: false,
		label: 'Category'
	},
	{
		id: 'subcategory',
		valueType: ValueType.CHAR,
		disablePadding: false,
		label: 'Subcategory'
	},
	{
		id: 'flag',
		valueType: ValueType.ICON,
		disablePadding: false,
		label: 'Categorized'
	}
];

interface EnhancedTableProps {
	selectedRow: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DisplayTransaction) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { order, orderBy, selectedRow, rowCount, onRequestSort } = props;
	const createSortHandler = (property: keyof DisplayTransaction) => (event: React.MouseEvent<unknown>) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.valueType == ValueType.CHAR ? 'left' : headCell.valueType == ValueType.NUMERIC ? 'left' : 'center'}
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
	isCategoryEntryOpen: boolean;
	selectedRow: number;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
	const { isCategoryEntryOpen, selectedRow } = props;
	return (
		<Toolbar
			sx={[
				{
					pl: { sm: 2 },
					pr: { xs: 1, sm: 1 },
				},
				isCategoryEntryOpen && {
					bgcolor: (theme) =>
						alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
				},
			]}
		>
			{isCategoryEntryOpen ? (
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
					Transactions
				</Typography>
			)}
		</Toolbar>
	);
}

function TransactionTable(props: {
			catalog: StateTuple<Catalog>,
			sourceTypes: SourceTypeImportConfig[],
			txns: StateTuple<Transaction[]>, 
			categoryOptions: StateTuple<CategoryOptions>,
			busyStates: BusyTaskStates
		}) {
	const [order, setOrder] = React.useState<Order>('asc');
	const [orderBy, setOrderBy] = React.useState<keyof DisplayTransaction>('date');
	const [selected, setSelected] = React.useState(-1);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const [isCategoryEntryOpen, setIsCategoryEntryOpen] = React.useState(false);
    const [isTransactionEntryOpen, setIsTransactionEntryOpen] = React.useState(false);

	const [selectedTransaction, setSelectedTransaction] = React.useState<DisplayTransaction>({} as DisplayTransaction);
	const [formData, setFormData] = React.useState<TransactionFormFields>({
		selectedCategory: null,
		inputCategory: "",
		isIncome: false,
		selectedSubcategory: null,
		inputSubcategory: "",
		flag: CategorizationFlag.INIT
	});
	const [txnFormData, setTxnFormData] = React.useState<NewTransactionFormFields>({
		date: dayjs(),
		selectedSourceType: null,
		inputSourceType: "",
		debit: "0",
		credit: "0",
		merchant: "",
		action: ""
	});

	const catalog : StateTuple<Catalog> = props.catalog;
	const sourceTypes : SourceTypeImportConfig[] = props.sourceTypes;
	const transactions : StateTuple<Transaction[]> = props.txns;
	const categoryOptions : StateTuple<CategoryOptions> = props.categoryOptions;
	const busyStates : BusyTaskStates = props.busyStates;



	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof DisplayTransaction,
	) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

    const toggleCategoryEntry = () => {
        setIsCategoryEntryOpen(!isCategoryEntryOpen);
    };

    const toggleTransactionEntry = () => {
        setIsTransactionEntryOpen(!isTransactionEntryOpen);
    };

	const handleClick = (event: React.MouseEvent<unknown>, txn: DisplayTransaction) => {
		setSelected(txn.id);
		setSelectedTransaction(txn);

		let txnCategory : CategoryRecord = getCategoryRecordFromCatalog(catalog.get, txn.category, txn.subcategory);

		let resetFormFields : TransactionFormFields = {
			selectedCategory: txn.category ? txn.category : null,
			inputCategory: txn.category ? txn.category : "",
			isIncome: txnCategory.income,
			selectedSubcategory: txn.subcategory ? txn.subcategory : null,
			inputSubcategory: txn.subcategory ? txn.subcategory : "",
			flag: txn.flag
		};
		setFormData(resetFormFields);

        toggleCategoryEntry();
        setIsTransactionEntryOpen(false);
	};

	const handleClickNewTransaction = (event: React.MouseEvent<unknown>) => {
		let resetFormFields : NewTransactionFormFields = {
			date: dayjs(),
			selectedSourceType: null,
			inputSourceType: "",
			debit: "0",
			credit: "0",
			merchant: "",
			action: ""
		};
		setTxnFormData(resetFormFields);

        toggleTransactionEntry();
	};

	function getCategoryFlagIcon(flag: CategorizationFlag) {
		switch (flag) {
			case CategorizationFlag.INIT:
				return (
					<Tooltip title="New transaction" arrow>
						<EmergencyOutlinedIcon/>
					</Tooltip>
				);
			case CategorizationFlag.CATEGORIZED:
				return (
					<Tooltip title="Categorized" arrow>
						<CheckCircleOutlinedIcon/>
					</Tooltip>
				);
			case CategorizationFlag.UNCATEGORIZED:
				return (
					<Tooltip title="Uncategorized" arrow>
						<CircleOutlinedIcon/>
					</Tooltip>
				);
			default:
				return (
					<Tooltip title="Error categorizing this transaction" arrow>
						<ErrorOutlineIcon/>
					</Tooltip>
				);
		}
	}

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};



	const handleSaveTransaction = (categoryInfo: TransactionFormFields, callback: (success: boolean) => void) => {
		transactions.get.forEach((value: Transaction, index: number) => {
			if (value.id == selected) {
				value.flag = categoryInfo.flag;

				// Collect the category. The multi-save call will cascade the category ID
				let categoryRecord : CategoryRecord = getCategoryRecordFromCatalog(catalog.get, categoryInfo.inputCategory, categoryInfo.inputSubcategory);
				if (categoryRecord.id < 0) {
					// This is a new category. Populate the rest of the fields
					categoryRecord.income = categoryInfo.isIncome;
				}
				value.category = categoryRecord;

				// Build the multi-entity for saving
				let multiEntity: MultiEntity = {
					category: categoryInfo.flag == CategorizationFlag.UNCATEGORIZED ? null : categoryRecord,
					pattern: null,
					transaction: {
						transactionId: value.id,
						categoryId: categoryRecord.id,
						flag: categoryInfo.flag
					}
				};

				// Save the transaction with the new category/subcategory info
				busyStates.working.start(async () => {
					let entity: PersistedMultiEntities = await saveEntities(multiEntity);
					if (categoryInfo.flag == CategorizationFlag.UNCATEGORIZED || (entity.categoryId !== null && entity.categoryId >= 0)) {
						if (entity.transactionId !== null && entity.transactionId != 0) {
							console.log("Transaction saved (" + entity.transactionId + ")");

							// Update catalog
							if (categoryInfo.flag != CategorizationFlag.UNCATEGORIZED) {
								createCategoryFromForm(catalog.get, entity.categoryId, formData, categoryOptions.get);
								let newCatalog : Catalog = {...catalog.get};
								catalog.set(newCatalog);
							}

							// Update transactions
							let txns : Transaction[] = [...transactions.get];
							transactions.set(txns);

							callback(true);
						} else {
							console.log("Failed to save transaction");
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



	const handleSaveNewTransaction = (txnInfo: NewTransactionFormFields, callback: (success: boolean) => void) => {
		if (txnInfo.date && txnInfo.selectedSourceType) {
			busyStates.working.start(async () => {
				let txn: Transaction = {
					id: -1,
					date: dateToString(txnInfo.date as Dayjs),
					month: "",
					sourceType: txnInfo.inputSourceType,
					debit: +(txnInfo.debit),
					credit: +(txnInfo.credit),
					merchant: txnInfo.merchant,
					action: txnInfo.action,
					category: { id: -1, category: "", income: false, subcategory: "" },
					flag: CategorizationFlag.INIT
				};

				let entity: PersistedEntity = await saveTransaaction(txn);
				if (entity.persistId != null) {
					txn.id = entity.persistId;
					transactions.set([...transactions.get, txn]);
					callback(true);
				} else {
					console.log("Failed to save transaction");
					callback(false);
				}
			});
		}
	}



	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - transactions.get.length) : 0;

	const visibleRows = React.useMemo(
		() => {
			let rows : DisplayTransaction[] = transactions.get.map( (txn) => { return {
				id: txn.id,
				date: txn.date,
				month: txn.month,
				sourceType: txn.sourceType,
				debit: txn.debit,
				credit: txn.credit,
				merchant: txn.merchant,
				action: txn.action,
				category: txn.category ? txn.category.category : "",
				subcategory: txn.category ? txn.category.subcategory : "",
				flag: txn.flag
			}});
			rows = rows
				.sort(getComparator(order, orderBy))
				.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
			return rows;
		},
		[transactions, order, orderBy, page, rowsPerPage]
	);



	return (
		<>
			<Box sx={{ width: '100%' }}>
				<Paper sx={{ width: '100%', mb: 2 }}>
					<EnhancedTableToolbar isCategoryEntryOpen={isCategoryEntryOpen} selectedRow={selected} />
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
							rowCount={transactions.get.length}
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
										<TableCell align="left">{row.category}</TableCell>
										<TableCell align="left">{row.subcategory}</TableCell>
										<TableCell align="center">{getCategoryFlagIcon(row.flag)}</TableCell>
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
						count={transactions.get.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</Paper>
	  		</Box>

			<Box sx={{ '& > :not(style)': { m: 1 } }}>
				<Fab 
					color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }}
					onClick={(event) => handleClickNewTransaction(event)}
				>
					<AddIcon />
				</Fab>
			</Box>

			<CategoryEntry
				isOpen={isCategoryEntryOpen}
				toggle={toggleCategoryEntry}
				formData={newStateTuple<TransactionFormFields>(formData, setFormData)}
				transaction={selectedTransaction}
				catalog={catalog}
				categoryOptions={categoryOptions}
				busyStates={busyStates}
				handleSaveTransaction={handleSaveTransaction}
			/>

			<TransactionEntry
				isOpen={isTransactionEntryOpen}
				toggle={toggleTransactionEntry}
				sourceTypes={sourceTypes}
				formData={newStateTuple<NewTransactionFormFields>(txnFormData, setTxnFormData)}
				busyStates={busyStates}
				handleSaveTransaction={handleSaveNewTransaction}
			/>
		</>
	);
}

export default TransactionTable;
