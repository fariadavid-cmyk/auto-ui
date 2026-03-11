import { PersistedEntity, PersistedMultiEntities } from "@/types/general";
import { Transaction, UncategorizedTransaction, MultiEntity, StatementPreview, SourceTypeImportConfig } from "@/types/transactions";

import { fetchGet, fetchPost, fetchPostFile } from "@/io/fetchApi";



const FETCH_SOURCE_TYPES_URL = "statements/sourceTypes";
const FETCH_TRANSACTIONS_URL = "statements/byDate";
const FETCH_UNCATEGORIZED_URL = "statements/uncategorized/byDate";
const SAVE_TRANSACTION_URL = "statements/saveTransaction";
const SAVE_ENTITIES_URL = "entities/update/multi";
const SAVE_TRANSACTION_CATEGORY_URL = "statements/updateTransaction";
const UPLOAD_STATEMENTS_URL = "statements/import";
const PREVIEW_STATEMENTS_URL = "statements/preview";
const SAVE_SOURCE_TYPE_URL = "statements/sourceType";

const PARAM_START = "start";
const PARAM_END = "end"
const PARAM_SOURCE_TYPE = "sourceType"
const PARAM_FILES = "files"



function fetchSourceTypes() : Promise<SourceTypeImportConfig[]>
{
	return fetchGet<SourceTypeImportConfig[]>(FETCH_SOURCE_TYPES_URL);
}

function fetchTransactions(start: string, end: string) : Promise<Transaction[]>
{
	let params = new URLSearchParams([
		[PARAM_START, start],
		[PARAM_END, end]
	]).toString();

	return fetchGet<Transaction[]>(FETCH_TRANSACTIONS_URL + "?" + params);
}

function fetchUncategorized(start: string, end: string) : Promise<UncategorizedTransaction[]>
{
	let params = new URLSearchParams([
		[PARAM_START, start],
		[PARAM_END, end]
	]).toString();

	return fetchGet<UncategorizedTransaction[]>(FETCH_UNCATEGORIZED_URL + "?" + params);
}

function saveTransaaction(transaction: Transaction) : Promise<PersistedEntity>
{
	return fetchPost<PersistedEntity>(SAVE_TRANSACTION_URL, JSON.stringify(transaction));
}

function saveEntities(entities: MultiEntity) : Promise<PersistedMultiEntities>
{
	return fetchPost<PersistedMultiEntities>(SAVE_ENTITIES_URL, JSON.stringify(entities));
}

function saveTransactionCategory(transactionId: number, categoryRecordId: number, flag: string) : Promise<PersistedEntity>
{
	let txnInfo = {
		transactionId: transactionId,
		categoryRecordId: categoryRecordId,
		flag: flag
	};

	return fetchPost<PersistedEntity>(SAVE_TRANSACTION_CATEGORY_URL, JSON.stringify(txnInfo));
}

function uploadStatement(sourceType: string, file: File) : Promise<PersistedEntity>
{
	const formData = new FormData();
	formData.set(PARAM_SOURCE_TYPE, sourceType);
	formData.append(PARAM_FILES, file, file.name);

	return fetchPostFile<PersistedEntity>(UPLOAD_STATEMENTS_URL, formData);
}

function previewStatement(file: File) : Promise<StatementPreview>
{
	const formData = new FormData();
	formData.append(PARAM_FILES, file, file.name);

	return fetchPostFile<StatementPreview>(PREVIEW_STATEMENTS_URL, formData);
}

function saveSourceType(sourceType: SourceTypeImportConfig) : Promise<PersistedEntity>
{
	return fetchPost<PersistedEntity>(SAVE_SOURCE_TYPE_URL, JSON.stringify(sourceType));
}


export { fetchSourceTypes, fetchTransactions, fetchUncategorized, saveTransaaction, saveEntities, saveTransactionCategory, uploadStatement, previewStatement, saveSourceType };
