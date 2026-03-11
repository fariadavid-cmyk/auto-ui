import { PersistedMultiEntities, SuccessMessageResult } from "@/types/general";
import { DateResult, Pattern, TestPattern } from "@/types/patterns";

import { fetchGet, fetchPost } from "@/io/fetchApi";



const FETCH_PATTERNS_URL = "patterns";
const TEST_PATTERN_URL = "patterns/test";
const SAVE_PATTERN_URL = "patterns/update";
const TEST_DATE_FORMAT_URL = "patterns/testDate";

const SOURCE_TYPE_PARAM = "sourceType";
const DATE_FORMAT_PARAM = "dateFormat";
const TEST_DATE_PARAM = "testDate";



function fetchPatterns(sourceType: string) : Promise<Pattern[]> {
	let params = new URLSearchParams([
		[SOURCE_TYPE_PARAM, sourceType]
	]).toString();

	return fetchGet<Pattern[]>(FETCH_PATTERNS_URL + "?" + params);
}

function testPattern(test: TestPattern) : Promise<SuccessMessageResult> {
	return fetchPost<SuccessMessageResult>(TEST_PATTERN_URL, JSON.stringify(test));
}

function savePattern(pattern: Pattern) : Promise<PersistedMultiEntities> {
	return fetchPost<PersistedMultiEntities>(SAVE_PATTERN_URL, JSON.stringify(pattern));
}

function testDateFormat(format: string, testDate: string) : Promise<DateResult> {
	let params = new URLSearchParams([
		[DATE_FORMAT_PARAM, format],
		[TEST_DATE_PARAM, testDate]
	]).toString();

	return fetchGet<DateResult>(TEST_DATE_FORMAT_URL + "?" + params);
}



export { fetchPatterns, testPattern, savePattern, testDateFormat };
