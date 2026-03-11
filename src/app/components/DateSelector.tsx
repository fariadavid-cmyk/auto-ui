import { StateTuple } from "@/types/general";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";



export enum SelectionStyle {
    RANGE = "RANGE",
    TWELVEMONTHS = "TWELVEMONTHS",
    LAST_YEAR = "LAST_YEAR",
    LAST_QUARTER = "LAST_QUARTER",
    LAST_MONTH = "LAST_MONTH",
    THIS_YEAR = "THIS_YEAR",
    THIS_QUARTER = "THIS_QUARTER",
    THIS_MONTH = "THIS_MONTH"
};

type DateSelectorForm = {
    selectionStyle: SelectionStyle,
    startDate: Dayjs | null,
    endDate: Dayjs | null
};



function DateRange(props: { form: StateTuple<DateSelectorForm> }) {
    const form = props.form;

    return (
        <>
            <Grid size={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Start Date"
                        value={form.get.startDate}
                        onChange={(newDate : Dayjs | null) => form.set({ ...form.get, startDate: newDate })}
                    />
                </LocalizationProvider>
            </Grid>
            <Grid size={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="End Date"
                        value={form.get.endDate}
                        onChange={(newDate : Dayjs | null) => form.set({ ...form.get, endDate: newDate })}
                    />
                </LocalizationProvider>
            </Grid>
        </>
    );
}



function DateSelector(props: { 
            form: StateTuple<DateSelectorForm>,
            callback: () => void
        }) {
    const form = props.form;

    function beginningOfQuarter() : Dayjs {
        let date = dayjs();
        date = date.month(date.month() - (date.month() % 3));

        return date.startOf("month");
    }

    function selectDateStyle(style: SelectionStyle) {
        if (style != SelectionStyle.RANGE) {
            let start: Dayjs;
            let end: Dayjs;

            switch (style) {
                case SelectionStyle.TWELVEMONTHS:
                    start = dayjs().subtract(12, "month").startOf("month");
                    end = dayjs().subtract(1, "month").endOf("month");
                    break;
                case SelectionStyle.LAST_YEAR:
                    start = dayjs().subtract(1, "year").startOf("year");
                    end = dayjs().subtract(1, "year").endOf("year");
                    break;
                case SelectionStyle.LAST_QUARTER:
                    start = beginningOfQuarter().subtract(3, "month");
                    end = start.add(2, "month").endOf("month");
                    break;
                case SelectionStyle.LAST_MONTH:
                    start = dayjs().subtract(1, "month").startOf("month");
                    end = dayjs().subtract(1, "month").endOf("month");
                    break;
                case SelectionStyle.THIS_YEAR:
                    start = dayjs().startOf("year");
                    end = dayjs().endOf("year");
                    break;
                case SelectionStyle.THIS_QUARTER:
                    start = beginningOfQuarter();
                    end = start.add(2, "month").endOf("month");
                    break;
                case SelectionStyle.THIS_MONTH:
                    start = dayjs().startOf("month");
                    end = dayjs().endOf("month");
            }

            form.set({ ...form.get, selectionStyle: style, startDate: start, endDate: end });

            props.callback();
        } else {
            form.set({ ...form.get, selectionStyle: style });
        }
    }

    return (
        <>
            <Grid size={2}>
                <FormControl fullWidth>
                    <InputLabel id="dateSelectionStyleLabel">Date selection</InputLabel>
                    <Select
                        labelId="dateSelectionStyleLabel"
                        id="dateSelectionStyle"
                        value={form.get.selectionStyle.toString()}
                        label="Date selection"
                        onChange={(event: SelectChangeEvent) => {
                            selectDateStyle(SelectionStyle[event.target.value as keyof typeof SelectionStyle])
                        }}
                    >
                        <MenuItem value="RANGE">Date Range</MenuItem>
                        <MenuItem value="TWELVEMONTHS">Last 12 Months</MenuItem>
                        <MenuItem value="LAST_YEAR">Last Year</MenuItem>
                        <MenuItem value="LAST_QUARTER">Last Quarter</MenuItem>
                        <MenuItem value="LAST_MONTH">Last Month</MenuItem>
                        <MenuItem value="THIS_YEAR">This Year</MenuItem>
                        <MenuItem value="THIS_QUARTER">This Quarter</MenuItem>
                        <MenuItem value="THIS_MONTH">This Month</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            { form.get.selectionStyle == SelectionStyle.RANGE && (
                <>
                    <DateRange form={form} />

                    <Grid size={2}>
                        <Button variant="contained" onClick={(event) => { props.callback() }}>Go</Button>
                    </Grid>
                </>
            )}
        </>
    );
}



export type { DateSelectorForm }
export { DateSelector };