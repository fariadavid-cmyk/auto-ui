export enum CategorizationFlag {
	INIT = "INIT",
	CATEGORIZED = "CATEGORIZED",
	UNCATEGORIZED = "UNCATEGORIZED",
	ERROR = "ERROR"
}



type CategoryRecord = {
	id: number,
	category: string,
	income: boolean,
	subcategory: string
};



const HIDDEN_CATEGORY: CategoryRecord = {
	id: 0,
	category: "-- Hidden --",
	income: false,
	subcategory: "-- Hidden --"
};



type Catalog = {
	categories: Map<string, Category>;
}

type Category = {
	name: string,
	income: boolean,
	subcategories: Map<string, Subcategory>
};

type Subcategory = {
	name: string,
	categoryReference: CategoryRecord
};



type CategoryOptionDependencies = {
	isIncome: boolean,
	availableSubcategories: string[]
};

type CategoryOptions = Map<string, CategoryOptionDependencies>;



interface CategorySelectionFormFields {
	selectedCategory: string | null,
	inputCategory: string,
	isIncome: boolean,
	selectedSubcategory: string | null,
	inputSubcategory: string
};



export type { CategoryRecord, Catalog, Category, Subcategory, CategoryOptions, CategoryOptionDependencies, CategorySelectionFormFields };
export { HIDDEN_CATEGORY };
