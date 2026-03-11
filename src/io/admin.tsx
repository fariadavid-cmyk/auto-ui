import { fetchGetFile, fetchPost, fetchDelete, fetchPostFile } from "@/io/fetchApi";
import { SuccessResult, PersistedEntity } from "@/types/general";



const REFRESH_URL = "admin/reload";

const DELETE_STATEMENTS_URL = "admin/clear";

const DELETE_SOURCETYPE_URL = "admin/sourceType";
const PARAM_DELETE_SOURCE_TYPE = "sourceType";

const EXPORT_PATTERNS_URL = "patterns/export";
const PARAM_EXPORT_SOURCE_TYPE = "sourceType";

const IMPORT_PATTERNS_URL = "patterns/import";
const PARAM_IMPORT_SOURCE_TYPE = "sourceType"
const PARAM_IMPORT_FILES = "files"

const EXPORT_BUDGET_URL = "budget/export";
const PARAM_EXPORT_BUDGET = "name";

const IMPORT_BUDGET_URL = "budget/import";



function refreshCategoriesAndPatterns() : Promise<SuccessResult> {
	return fetchPost<SuccessResult>(REFRESH_URL, "");
}

function deleteStatements() : Promise<SuccessResult> {
	return fetchDelete<SuccessResult>(DELETE_STATEMENTS_URL);
}

function deleteSourceType(sourceType : string) : Promise<SuccessResult> {
	let params = new URLSearchParams([
		[PARAM_DELETE_SOURCE_TYPE, sourceType]
	]).toString();

	return fetchDelete<SuccessResult>(DELETE_SOURCETYPE_URL + "?" + params);
}

function downloadPatterns(sourceType : string) : Promise<Blob> {
	let params = new URLSearchParams([
		[PARAM_EXPORT_SOURCE_TYPE, sourceType]
	]).toString();

	return fetchGetFile(EXPORT_PATTERNS_URL + "?" + params);
}

function uploadPatterns(sourceType: string, file: File) : Promise<PersistedEntity>
{
	const formData = new FormData();
	formData.set(PARAM_IMPORT_SOURCE_TYPE, sourceType);
	formData.append(PARAM_IMPORT_FILES, file, file.name);

	return fetchPostFile<PersistedEntity>(IMPORT_PATTERNS_URL, formData);
}

function downloadBudget(budget : string) : Promise<Blob> {
	let params = new URLSearchParams([
		[PARAM_EXPORT_BUDGET, budget]
	]).toString();

	return fetchGetFile(EXPORT_BUDGET_URL + "?" + params);
}

function uploadBudget(file: File) : Promise<PersistedEntity>
{
	const formData = new FormData();
	formData.append(PARAM_IMPORT_FILES, file, file.name);

	return fetchPostFile<PersistedEntity>(IMPORT_BUDGET_URL, formData);
}



export { refreshCategoriesAndPatterns, deleteStatements, deleteSourceType, downloadPatterns, uploadPatterns, downloadBudget, uploadBudget };
