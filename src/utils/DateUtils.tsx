import dayjs, { Dayjs } from "dayjs";



const DATE_FORMAT : string = "YYYY-MM-DD";
const MONTH_FORMAT : string = "YYYY-MM";

function dateToString(date : Dayjs) : string {
    return date.format(DATE_FORMAT);
}

function startDateToString(date : Dayjs | null) : string {
	if (date == null) {
		return dayjs().startOf('month').format(DATE_FORMAT);
	} else {
		return date.format(DATE_FORMAT);
	}
}

function endDateToString(date : Dayjs | null) : string{
	if (date == null) {
		return dayjs().endOf('month').format(DATE_FORMAT);
	} else {
		return date.add(1, 'day').format(DATE_FORMAT);
	}
}

function startMonthToString(date : Dayjs | null) : string {
	if (date == null) {
		return dayjs().startOf('month').format(MONTH_FORMAT);
	} else {
		return date.format(MONTH_FORMAT);
	}
}

function endMonthToString(date : Dayjs | null) : string{
	if (date == null) {
		return dayjs().endOf('month').format(MONTH_FORMAT);
	} else {
		return date.format(MONTH_FORMAT);
	}
}


export { dateToString, startDateToString, endDateToString, startMonthToString, endMonthToString };

