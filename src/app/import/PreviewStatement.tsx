'use client'

import React from "react";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Box, Button } from "@mui/material";
import { styled } from "@mui/material/styles";

import { SourceTypeImportConfig, SourceTypeImportConfigMap, StatementPreview } from "@/types/transactions";
import { DateResult } from "@/types/patterns";
import { testDateFormat } from "@/io/pattern";



function PreviewStatement(props: { 
            data : StatementPreview,
            sourceTypes : SourceTypeImportConfigMap,
            sourceTypeName : string | null,
            createSourceTypeHandler : (sourceType: SourceTypeImportConfig) => void
        }) {
    const data = props.data;
    const sourceTypes = props.sourceTypes;
    const sourceTypeName = props.sourceTypeName;
    const selectedSourceType = sourceTypeName ? sourceTypes.get(sourceTypeName) : null;
    const createSourceTypeHandler = props.createSourceTypeHandler;

    const [isHeaderRow, setHeaderRow] = React.useState<boolean>(false);
    const [columnTypes, setColumnTypes] = React.useState<string[]>([]);
    const [selectedDateFormat, setSelectedDateFormat] = React.useState<string | null>(null);
    const [inputDateFormat, setInputDateFormat] = React.useState<string>("");
    const [isTesting, startTesting] = React.useTransition();
    const [dateFormatTest, setDateFormatTest] = React.useState<DateResult>({success: true, today: "", originalDate: "", testDate: "", message: ""});
    const [refreshDateFormat, setRefreshDateFormat] = React.useState<boolean>(false);
    const [newSourceTypeReady, setNewSourceTypeReady] = React.useState<boolean>(false);
    const [newSourceTypeMessage, setNewSourceTypeMessage] = React.useState<string>("");

    const showHeaderRow = (selectedSourceType ? !selectedSourceType.firstRowHeader : !isHeaderRow);
    React.useEffect(() => {
        // Verify we have statement data to do date format test on. We need at least 2 rows
        if (data.length > 1) {
            let format: string;
            let dateField: number = -1;

            // Determine if using a selected source type, or entering a new one
            if (selectedSourceType == null) {
                // Use the user-defined configuration
                format = inputDateFormat;
                columnTypes.forEach((colType, colIndex) => {
                    if (colType == "date") {
                        dateField = colIndex;
                    }
                });
            } else {
                // Use the configuration for the selected source type
                format = selectedSourceType.dateFormat;
                dateField = selectedSourceType.dateField ? selectedSourceType.dateField - 1 : -1;
            }

            if (format.length > 0 && dateField >= 0) {
                let testDate = data[1][dateField];

                startTesting(async () => {
                    let result: DateResult = await testDateFormat(format, testDate);
                    result.originalDate = testDate;

                    setDateFormatTest(result);
                    readyToAddSourceType(result.success);
                });
            } else {
                setDateFormatTest({ ...dateFormatTest, success: false, message: "" })
                readyToAddSourceType(false);
            }
        } else {
            readyToAddSourceType(false);
        }
	}, [data, selectedSourceType, refreshDateFormat]);

    const dateFormats: string[] = [
        "yyyy-MM-dd",
        "M/d/yyyy",
        "MMM[.] d, yyyy"
    ];

    function setFieldType(index: number, value: string) {
        let newColTypes = [...columnTypes];
        newColTypes[index] = value;

        setColumnTypes(newColTypes);
        setRefreshDateFormat(!refreshDateFormat);
    }

    function setDateFormat(format: string) {
        setInputDateFormat(format);
        setRefreshDateFormat(!refreshDateFormat);
    }

    // Add a select widget allowing user to select definition for this column
    function ImportFieldSelect(colIndex : number) {
        return (
            <FormControl fullWidth>
                <InputLabel id={"fieldTypeSelectLabel_" + colIndex}>Field Type</InputLabel>
                <Select
                    labelId={"fieldTypeSelectLabel_" + colIndex}
                    id={"fieldTypeSelect_" + colIndex}
                    value={columnTypes[colIndex]}
                    label="Field Type"
                    onChange={(event: SelectChangeEvent) => {
                        setFieldType(colIndex, event.target.value as string);
                    }}
                >
                    <MenuItem value=""><em>-- Unused --</em></MenuItem>
                    <MenuItem value="date">Date</MenuItem>
                    <MenuItem value="credit">Credit</MenuItem>
                    <MenuItem value="debit">Debit</MenuItem>
                    <MenuItem value="merchant">Merchant</MenuItem>
                    <MenuItem value="action">Action</MenuItem>
                </Select>
            </FormControl>
        );
    }

    // Find this column's definition in the selected source type
    function ShowImportFieldDefinition(colIndex : number) {
        let label : string = "";

        if (selectedSourceType) {
            if (selectedSourceType.dateField === colIndex) {
                label = "Date";
            } else if (selectedSourceType.debitField === colIndex) {
                label = "Debit";
            } else if (selectedSourceType.creditField === colIndex) {
                label = "Credit";
            } else if (selectedSourceType.merchantField === colIndex) {
                label = "Merchant";
            } else if (selectedSourceType.actionField === colIndex) {
                label = "Action";
            }
        }

        return (
            <Typography>{ label ? label : "" }</Typography>
        );
    }

    function AutoCompleteDateFormat() {
        return (
            <Autocomplete
                id="inputDateFormatField"
                freeSolo
                options={dateFormats}
                renderInput={(params) => <TextField {...params} required label="Date Format" helperText="Select or enter a date format pattern to parse the dates in statements" />}
                value={selectedDateFormat}
                onChange={(event: any, newValue: string | null) => { setSelectedDateFormat(newValue); }}
                inputValue={inputDateFormat}
                onInputChange={(event, newInputValue) => { setDateFormat(newInputValue); }}
            />
        );
    }

    function ShowImportDateFormat() {
        let dateFormat = "";
        if (selectedSourceType) {
            dateFormat = selectedSourceType.dateFormat;
        }

        return (
            <TextField fullWidth
                disabled
                id="inputSourceTypeField"
                label="Source Type"
                defaultValue={dateFormat}
            />
        );
    }

    function readyToAddSourceType(dateFormatTestSuccess: boolean) : boolean {
        let result : boolean = true;

        result = result && sourceTypeName != null && sourceTypeName.length > 0; // Source type name must be entered
        result = result && selectedSourceType == null;  // Source type name must be new
        if (!result) {
            setNewSourceTypeMessage("To create a new source type, enter a new unique name for it");
            setNewSourceTypeReady(result);
            return result;
        }

        result = result && dateFormatTestSuccess; // Date format test must pass
        if (!result) {
            setNewSourceTypeMessage("Select or enter a valid date format for these transactions");
            setNewSourceTypeReady(result);
            return result;
        }

        // Verify all statement fields are set
        let dateFieldCount = 0;
        let debitFieldCount = 0;
        let creditFieldCount = 0;
        let merchantFieldCount = 0;
        let actionFieldCount = 0;

        columnTypes.forEach((colType, colIndex) => {
            if (colType == "date") {
                dateFieldCount += 1;
            } else if (colType == "debit") {
                debitFieldCount += 1;
            } else if (colType == "credit") {
                creditFieldCount += 1;
            } else if (colType == "merchant") {
                merchantFieldCount += 1;
            } else if (colType == "action") {
                actionFieldCount += 1;
            }
        });

        result = result && dateFieldCount == 1 
            && merchantFieldCount == 1 
            && actionFieldCount < 2
            && (debitFieldCount == 1 || creditFieldCount == 1) 
            && debitFieldCount < 2 && creditFieldCount < 2;

        if (!result) {
            setNewSourceTypeMessage("Assign each field type to a column only once. Date, merchant, and one of credit or debit must be assigned");
            setNewSourceTypeReady(result);
            return result;
        }

        setNewSourceTypeMessage("");
        setNewSourceTypeReady(result);
        return result;
    }

    function doCreateNewSourceType(event: React.MouseEvent<unknown>) {
        let newSourceType : SourceTypeImportConfig = {
            name: sourceTypeName as string,
            firstRowHeader: isHeaderRow,
            dateFormat: inputDateFormat,
            dateField: -1,
            debitField: -1,
            creditField: -1,
            merchantField: -1,
            actionField: -1
        }

        columnTypes.forEach((colType, colIndex) => {
            if (colType == "date") {
                newSourceType.dateField = colIndex + 1;
            } else if (colType == "debit") {
                newSourceType.debitField = colIndex + 1;
            } else if (colType == "credit") {
                newSourceType.creditField = colIndex + 1;
            } else if (colType == "merchant") {
                newSourceType.merchantField = colIndex + 1;
            } else if (colType == "action") {
                newSourceType.actionField = colIndex + 1;
            }
        });

        createSourceTypeHandler(newSourceType);
    }

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(even)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
    }));

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.grey[300]
        }
    }));

    if (data.length == 0) {
        return ( <></> );
    }

    if (columnTypes.length < data[0].length) {
        for (let index: number = columnTypes.length; index < data[0].length; index++) {
            columnTypes.push("");
        }
    }

    return (
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
            <FormControlLabel control={<Checkbox 
                id="firstRowHeaderField"
                checked={!showHeaderRow}
                disabled={selectedSourceType != null}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setHeaderRow(event.target.checked); }}
            />} label="First row is a header" />

            <Box component="section" sx={{ border: '1px dashed black' }}>
                <TableContainer component={Paper}>
                    <Table size="small" aria-label="simple table">
                        <TableHead>
                            <TableRow key="-1">
                                { data[0].map((column, colIndex) => (
                                    <StyledTableCell key={"-1_" + colIndex}>
                                        { selectedSourceType == null ? ImportFieldSelect(colIndex) : ShowImportFieldDefinition(colIndex + 1) }
                                    </StyledTableCell>
                                )) }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            { data.map((row, rowIndex) => (showHeaderRow || rowIndex > 0) && (
                                <StyledTableRow key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    { row.map((column, colIndex) => (
                                        <TableCell key={rowIndex + "_" + colIndex}>
                                            {column}
                                        </TableCell>
                                    )) }
                                </StyledTableRow>
                            )) }
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

			<Paper sx={{ width: '100%', mb: 2 }}>
                <Grid container padding={2} spacing={2} alignItems={"center"}>
                    <Grid size={3}>
                        { selectedSourceType == null ? AutoCompleteDateFormat() : ShowImportDateFormat() }
                    </Grid>
                    <Grid size={4}>
                        <Box sx={{display: dateFormatTest.success ? 'inline' : 'none'}}>
                            <Stack spacing={2}>
                                <Typography>Today's date in the selected format:</Typography>
                                <Typography color="info">{dateFormatTest.today}</Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid size={5}>
                        <Box sx={{display: dateFormatTest.success ? 'inline' : 'none'}}>
                            <Stack spacing={2}>
                                <Typography component="div">Transaction date: <Typography display="inline" component="div" color="info">{dateFormatTest.originalDate}</Typography></Typography>
                                <Typography component="div">Reformatted to yyyy-MM-dd: <Typography display="inline" component="div" color="info">{dateFormatTest.testDate}</Typography></Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid size={4}>
                        <Typography color={dateFormatTest.success ? "success" : "error"}>{dateFormatTest.message}</Typography>
                    </Grid>
                    <Grid size={8}>
                    </Grid>
                    <Grid size={4}>
						<Button
							variant="contained"
							disabled={!newSourceTypeReady}
							onClick={doCreateNewSourceType}
						>Create New Source Type</Button>
                    </Grid>
                    <Grid size={8}>
                        <Typography color="error">{newSourceTypeMessage}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}



export default PreviewStatement;