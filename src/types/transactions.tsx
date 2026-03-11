import { CategorizationFlag, CategoryRecord, CategorySelectionFormFields } from "@/types/categories";
import { Pattern } from '@/types/patterns';
import { Dayjs } from "dayjs";



type SourceTypeImportConfig = {
	name: string,
	firstRowHeader: boolean,
	dateFormat: string,
	dateField: number | null,
	debitField: number | null,
	creditField: number | null,
	merchantField: number | null,
	actionField: number | null
};

type SourceTypeImportConfigMap = Map<string, SourceTypeImportConfig>;


type UncategorizedTransaction = {
	id: number,
	date: string,
	month: string,
	sourceType: string,
	debit: number,
	credit: number,
	merchant: string,
	action: string,
	flag: CategorizationFlag
};

type Transaction = {
	id: number,
	date: string,
	month: string,
	sourceType: string,
	debit: number,
	credit: number,
	merchant: string,
	action: string,
	category: CategoryRecord,
	flag: CategorizationFlag
};

type DisplayTransaction = {
	id: number,
	date: string,
	month: string,
	sourceType: string,
	debit: number,
	credit: number,
	merchant: string,
	action: string,
	category: string,
	subcategory: string,
	flag: CategorizationFlag
};

interface TransactionFormFields extends CategorySelectionFormFields {
	flag: CategorizationFlag
};

type NewTransactionFormFields = {
	date: Dayjs | null,
	selectedSourceType: string | null,
	inputSourceType: string,	
	debit: string,
	credit: string,
	merchant: string,
	action: string
};

type TransactionUpdate = {
	transactionId: number,
	categoryId: number,
	flag: string
};

type MultiEntity = {
	category: CategoryRecord | null,
	pattern: Pattern | null,
	transaction: TransactionUpdate | null
};

type StatementPreview = string[][];



export type { SourceTypeImportConfig, SourceTypeImportConfigMap, UncategorizedTransaction, Transaction, DisplayTransaction, TransactionFormFields,
	NewTransactionFormFields, TransactionUpdate, MultiEntity, StatementPreview };
