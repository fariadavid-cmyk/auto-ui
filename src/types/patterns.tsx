import { CategoryRecord, CategorySelectionFormFields } from "@/types/categories";



type Pattern = {
	id: number,
	sourceType: string,
	category: CategoryRecord,
	merchant: string,
	action: string,
	rule: string
};

interface PatternFormFields extends CategorySelectionFormFields {
	merchant: string,
	action: string,
	rule: string
};

type TestPattern = {
	pattern: {
		merchant: string,
		action: string,
		rule: string
	},
	transaction: {
		date: string,
		month: string,
		credit: number,
		debit: number,
		merchant: string,
		action: string
	}
};

type DateResult = {
	success: boolean,
	today: string,
	originalDate: string,
	testDate: string,
	message: string
}



export type { Pattern, PatternFormFields, TestPattern, DateResult };
