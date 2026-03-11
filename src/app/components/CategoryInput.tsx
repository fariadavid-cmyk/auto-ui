import * as React from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import { StateTuple, PersistedEntity } from "@/types/general";
import { Catalog, CategoryOptions, CategorySelectionFormFields, CategoryOptionDependencies, CategoryRecord, HIDDEN_CATEGORY } from '@/types/categories';
import { addCategoryToCatalog, getCategoryRecordFromCatalog } from '@/utils/CategoryUtils';
import { MessageState } from './StatusMessage';



// After saving a new category for a transaction, add any new category and/or subcategory to the availble lists
function addNewCategoryToOptions(category: CategoryRecord, categoryOptionsMap: CategoryOptions) {
	let catOptDep : CategoryOptionDependencies;
	if (categoryOptionsMap.has(category.category)) {
		catOptDep = categoryOptionsMap.get(category.category) as CategoryOptionDependencies;
	} else {
		catOptDep = { isIncome: category.income, availableSubcategories: [] } as CategoryOptionDependencies;
		categoryOptionsMap.set(category.category, catOptDep);
	}

	if (!catOptDep.availableSubcategories.includes(category.subcategory)) {
		catOptDep.availableSubcategories.push(category.subcategory);
		catOptDep.availableSubcategories.sort();
	}
}

function createCategoryFromForm(catalog: Catalog, categoryRecordId: number, formData: CategorySelectionFormFields, categoryOptionsMap: CategoryOptions) : CategoryRecord {
	let categoryRecord : CategoryRecord = getCategoryRecordFromCatalog(catalog, formData.inputCategory, formData.inputSubcategory);
	categoryRecord.id = categoryRecordId;

	addCategoryToCatalog(catalog, categoryRecord);

	addNewCategoryToOptions(categoryRecord, categoryOptionsMap);

	return categoryRecord;
}



function CategoryInput<F extends CategorySelectionFormFields>(props: {
			formData : StateTuple<F>,
			catalog: StateTuple<Catalog>,
			categoryOptions: StateTuple<CategoryOptions>
		}) {
	const formData = props.formData;
	const catalog = props.catalog;
	const categoryOptionsMap = props.categoryOptions;

	// Enables/disables the "income" checkbox depending on selection vs input of category
	const [isCheckEnabled, setCheckEnabled] = React.useState<boolean>(true);

	// Enables/disables the subcategory list "Hidden" is selected as the category
	const [isSubcategoryEnabled, setSubcategoryEnabled] = React.useState<boolean>(formData.get.selectedCategory !== HIDDEN_CATEGORY.category);

	// Transition and result for saving category
	const [isSavingCategory, startSavingCategory] = React.useTransition();

	// Category and subcategory options
	let categoryOptions : string[] = [];
	let subcategoryOptions : string[] = [];



	// Sets the selected category and income flag after selecting a category from the dropdown
	function selectCategoryFromList(newCategory: string | null)
	{
		setCheckEnabled(false);
		// If category has changed, clear the subcategory
		if (newCategory !== formData.get.selectedCategory) {
			let newSubcategory: string | null = null;

			// If "Hidden" is selected, disable the subcategory
			if (newCategory === HIDDEN_CATEGORY.category) {
				newSubcategory = HIDDEN_CATEGORY.subcategory;
				setSubcategoryEnabled(false);
			} else {
				setSubcategoryEnabled(true);
			}

			formData.set({ ...formData.get, selectedCategory: newCategory, inputCategory: newCategory == null ? "" : newCategory,
					isIncome: isCategoryAnIncomeCategory(newCategory),
					selectedSubcategory : newSubcategory, inputSubcategory : newSubcategory ? newSubcategory : "" });
		} else {
			formData.set({ ...formData.get, selectedCategory: newCategory, inputCategory: newCategory == null ? "" : newCategory,
					isIncome: isCategoryAnIncomeCategory(newCategory) });
		}
	}

	// Sets the input category after typing a category in the text box
	function setCategoryFromInput(newCategory: string)
	{
		if (formData.get.selectedCategory != newCategory) {
			setSubcategoryEnabled(true);
			setCheckEnabled(true);
	
			formData.set({ ...formData.get, selectedCategory: null, inputCategory: newCategory });
		} else {
			setCheckEnabled(false);

			// If "Hidden" is selected, disable the subcategory
			if (newCategory === HIDDEN_CATEGORY.category) {
				setSubcategoryEnabled(false);

				formData.set({ ...formData.get, inputCategory: newCategory, selectedSubcategory: HIDDEN_CATEGORY.subcategory, inputSubcategory: HIDDEN_CATEGORY.subcategory });
			} else {
				setSubcategoryEnabled(true);

				formData.set({ ...formData.get, inputCategory: newCategory });
			}
		}
	}

	// Determines if the given category is an income category
	function isCategoryAnIncomeCategory(newCategory: string | null) {
		if (newCategory != null) {
			if (categoryOptionsMap.get.has(newCategory)) {
				let catEntry : CategoryOptionDependencies | undefined = categoryOptionsMap.get.get(newCategory);
				if (catEntry) {
					return catEntry.isIncome;
				}
			}
		}
		
		return false;
	}

	// Populates the subcategory options list given a category name
	function setSubcategoryOptions(newCategory: string | null) {
		if (newCategory != null) {
			if (categoryOptionsMap.get.has(newCategory)) {
				let catOptDep : CategoryOptionDependencies | undefined = categoryOptionsMap.get.get(newCategory);
				if (catOptDep) {
					subcategoryOptions = catOptDep.availableSubcategories;
				}
			}
		} else {
			subcategoryOptions = [];
		}
	}



	// Populate the options list for the category and subcategory¸
	// Put "Hidden" first
	categoryOptions.push(HIDDEN_CATEGORY.category);
	categoryOptionsMap.get.keys().forEach( (categoryName : string) => {
		if (categoryName != HIDDEN_CATEGORY.category) {
			categoryOptions.push(categoryName);
		}
	})
	categoryOptions.sort();
	setSubcategoryOptions(formData.get.selectedCategory);



	// Generate the form fragment
	return (
		<>
			<Grid size={3}>
				<Autocomplete
					id="inputCategoryField"
					freeSolo
					options={categoryOptions}
					renderInput={(params) => <TextField {...params} required label="Category" error={formData.get.inputCategory.length == 0} helperText="Select or enter a category for this transaction" />}
					value={formData.get.selectedCategory}
					onChange={(event: any, newValue: string | null) => { selectCategoryFromList(newValue); }}
					inputValue={formData.get.inputCategory}
					onInputChange={(event, newInputValue) => { setCategoryFromInput(newInputValue); }}
				/>
			</Grid>
			<Grid size={1}>
				<FormControlLabel control={<Checkbox 
					id="isIncomeField"
					disabled={!isCheckEnabled}
					checked={formData.get.isIncome}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => { formData.set({ ...formData.get, isIncome: event.target.checked }); }}
				/>} label="Income" />
			</Grid>
			<Grid size={3}>
				<Autocomplete
					id="inputSubcategoryField"
					freeSolo
					options={subcategoryOptions}
					disabled={!isSubcategoryEnabled}
					renderInput={(params) => <TextField {...params} required label="Subcategory" error={formData.get.inputSubcategory.length == 0} helperText="Select or enter a subcategory for this transaction" />}
					value={formData.get.selectedSubcategory}
					onChange={(event: any, newValue: string | null) => { formData.set({ ...formData.get, selectedSubcategory: newValue ? newValue : "" }); }}
					inputValue={formData.get.inputSubcategory}
					onInputChange={(event, newInputValue) => { formData.set({ ...formData.get, inputSubcategory: newInputValue }); }}
				/>
			</Grid>
		</>
	);
}



export { CategoryInput, createCategoryFromForm };
