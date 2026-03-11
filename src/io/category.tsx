import { PersistedEntity } from "@/types/general";
import { Catalog, CategoryRecord } from "@/types/categories";
import { Transaction } from "@/types/transactions";

import { fetchGet, fetchPost } from "@/io/fetchApi";



const APPLY_CATEGORY_URL = "statements/categorize";
const FETCH_CATALOG_URL = "categories";
const SAVE_CATEGORY_URL = "categories/update";



function applyCategorization() : Promise<Transaction[]>
{
	return fetchPost<Transaction[]>(APPLY_CATEGORY_URL, "");
}

function fetchCatalog() : Promise<Catalog>
{
	return fetchGet<Catalog>(FETCH_CATALOG_URL);
}

function saveCategory(category: CategoryRecord) : Promise<PersistedEntity>
{
	return fetchPost<PersistedEntity>(SAVE_CATEGORY_URL, JSON.stringify(category));
}



export { applyCategorization, fetchCatalog, saveCategory };
