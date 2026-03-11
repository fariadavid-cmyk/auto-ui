import { fetchCatalog } from "@/io/category";
import { Catalog, Category, Subcategory, CategoryOptions, CategoryOptionDependencies, CategoryRecord } from "@/types/categories";
import { repairCatalogMaps } from "@/utils/MapUtils";



async function queryCatalog() : Promise<Catalog> {
	// Load the catalog
	const catalog : Catalog = await fetchCatalog();

	// Repair the catalog's maps
	repairCatalogMaps(catalog);

	return catalog;
}

function getCategoryRecordFromCatalog(catalog: Catalog, category: string, subcategory: string) : CategoryRecord
{
	let categoryRecord : CategoryRecord = {
		id: -1,
		category: category,
		income: false,
		subcategory: subcategory
	};

	let categoryItem : Category | undefined = catalog.categories.get(category);
	if (categoryItem) {
		let subcategoryItem : Subcategory | undefined = categoryItem.subcategories.get(subcategory);
		if (subcategoryItem && subcategoryItem.categoryReference) {
			categoryRecord = subcategoryItem.categoryReference;
		}
	}

	return categoryRecord;
}

function addCategoryToCatalog(catalog : Catalog, categoryRecord : CategoryRecord) {
	let category : Category | undefined = catalog.categories.get(categoryRecord.category);
	if (!category) {
		category = {
			name: categoryRecord.category,
			income: categoryRecord.income,
			subcategories: new Map()
		};

		catalog.categories.set(categoryRecord.category, category);
	}

	let subcategory : Subcategory | undefined = category.subcategories.get(categoryRecord.subcategory);
	if (!subcategory) {
		subcategory = {
			name: categoryRecord.subcategory,
			categoryReference: categoryRecord
		};

		category.subcategories.set(categoryRecord.subcategory, subcategory);
	} else {
		subcategory.categoryReference.id = categoryRecord.id;
	}

}

function buildCategoryOptionsFromCatalog(catalog : Catalog) : CategoryOptions {
	let categoryOptions: CategoryOptions = new Map<string, CategoryOptionDependencies>();

	// For every category in the catalog
	catalog.categories.forEach((category : Category, categoryName: string) => {
		let subcategories : string[] = [];

		// Gather all the subcategories
		category.subcategories.forEach((subcategory : Subcategory, subcategoryName : string) => {
			subcategories.push(subcategoryName);
		});

		subcategories.sort();

		let categoryDependencies: CategoryOptionDependencies = {isIncome: category.income, availableSubcategories: subcategories};
		categoryOptions.set(categoryName, categoryDependencies);
	});

	return categoryOptions;
}



export { queryCatalog, getCategoryRecordFromCatalog, addCategoryToCatalog, buildCategoryOptionsFromCatalog };
