import { StyledComponent } from '@emotion/styled/macro';
import { styled } from '@mui/material/styles';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import { LabelRow, RowType } from './BudgetTable';
import { CSSProperties } from '@mui/material/styles';


const NON_STICKY_COL = 7;
const COLOURED_COL = 5;
const NUMERIC_COLUMN_WIDTH = 100;
const SPACER_COLUMNS = [4, 6];

const COLUMN_POSITIONS = [0, 150, 300, 400, 500, 510, 610];
const COLUMN_WIDTHS = [150, 150, NUMERIC_COLUMN_WIDTH, NUMERIC_COLUMN_WIDTH, 10, NUMERIC_COLUMN_WIDTH, 10];
const COLUMN_ALIGN = ["left", "left", "right", "right", "left", "right", "left"];



export enum SpendingStatus {
    NIL,
	GREEN,
	YELLOW,
	RED
};

function makeKey(rowType: RowType, cellStatus: SpendingStatus) {
    return rowType + "_" + cellStatus;
}

const CELL_COLOURS: Map<string, string> = new Map([
    [makeKey(RowType.VALUE, SpendingStatus.GREEN), "#66A066"],
    [makeKey(RowType.VALUE, SpendingStatus.YELLOW), "#A0A033"],
    [makeKey(RowType.VALUE, SpendingStatus.RED), "#A06666"],

    [makeKey(RowType.TOTAL, SpendingStatus.GREEN), "forestgreen"],
    [makeKey(RowType.TOTAL, SpendingStatus.YELLOW), "yellow"],
    [makeKey(RowType.TOTAL, SpendingStatus.RED), "#FF2020"],

    [makeKey(RowType.GRAND_TOTAL, SpendingStatus.GREEN), "darkgreen"],
    [makeKey(RowType.GRAND_TOTAL, SpendingStatus.YELLOW), "goldenrod"],
    [makeKey(RowType.GRAND_TOTAL, SpendingStatus.RED), "darkred"]
]);

function getCellColour(rowType: RowType, cellStatus: SpendingStatus) : string {
    let cellColour = CELL_COLOURS.get(makeKey(rowType, cellStatus));
    if (!cellColour) {
        return "white";
    }

    return cellColour;
}



class BudgetTableStickyCellStyles {
    TopHeaderCell: StyledComponent<TableCellProps>;
    HeaderCell: StyledComponent<TableCellProps>;
    TableCell: StyledComponent<TableCellProps>;
    TotalCell: StyledComponent<TableCellProps>;
    GrandTotalCell: StyledComponent<TableCellProps>;
    SpacerCell: StyledComponent<TableCellProps>;
    SpacerColumnCell: StyledComponent<TableCellProps>;
    
    constructor(column: number) {
        this.TopHeaderCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.common.black,
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.HeaderCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.grey[800],
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.TableCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.common.white,
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.TotalCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.grey[300],
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.GrandTotalCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.grey[900],
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.SpacerCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.grey[600],
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));

        this.SpacerColumnCell = styled(TableCell)(({ theme }) => ({
            backgroundColor: theme.palette.grey[300],
            position: "sticky",
            left: COLUMN_POSITIONS[column],
            padding: 0,
            width: COLUMN_WIDTHS[column],
            maxWidth: COLUMN_WIDTHS[column],
            minWidth: COLUMN_WIDTHS[column],
            align: COLUMN_ALIGN[column],
            zIndex: "1"
        }));
    };
};



const BUDGET_TABLE_STICKY_CELL_STYLES = [
    new BudgetTableStickyCellStyles(0),
    new BudgetTableStickyCellStyles(1),
    new BudgetTableStickyCellStyles(2),
    new BudgetTableStickyCellStyles(3),
    new BudgetTableStickyCellStyles(4),
    new BudgetTableStickyCellStyles(5),
    new BudgetTableStickyCellStyles(6)
];



function cellKey(colIndex: number, rowIndex: number) {
    return "R" + rowIndex + "_C" + colIndex;
}



function BudgetCell(props: { colIndex: number, rowIndex: number, labelRow: LabelRow, cellStatus?: SpendingStatus, children: React.ReactNode }) {
    let keyValue = cellKey(props.rowIndex, props.colIndex);

    if (props.colIndex >= NON_STICKY_COL) {
        let style: CSSProperties = { width: NUMERIC_COLUMN_WIDTH, maxWidth: NUMERIC_COLUMN_WIDTH, minWidth: NUMERIC_COLUMN_WIDTH };

        if (props.cellStatus) {
            let bgColour = getCellColour(props.labelRow.rowType, props.cellStatus);
            style = { ...style, backgroundColor: bgColour };
        }

        return(
            <TableCell key={keyValue} align={'right'} style={style}>
                { props.children }
            </TableCell>
        );
    } else {
        const BudgetCell = BUDGET_TABLE_STICKY_CELL_STYLES[props.colIndex];
        let style: CSSProperties = {};

        if (props.colIndex >= COLOURED_COL && props.cellStatus) {
            let bgColour = getCellColour(props.labelRow.rowType, props.cellStatus);
            style = { backgroundColor: bgColour };
        }

        if (SPACER_COLUMNS.includes(props.colIndex)) {
            return (
                <BudgetCell.SpacerColumnCell key={keyValue} padding="none">
                    { props.children }
                </BudgetCell.SpacerColumnCell>
            );
        } else if (props.labelRow.rowType == RowType.SPACER) {
            return (
                <BudgetCell.SpacerCell key={keyValue}>
                    { props.children }
                </BudgetCell.SpacerCell>
            );
        }
        else if (props.labelRow.rowType == RowType.TOP_HEADER) {
            return (
                <BudgetCell.TopHeaderCell key={keyValue}>
                    { props.children }
                </BudgetCell.TopHeaderCell>
            );
        } else if (props.labelRow.rowType == RowType.HEADER) {
            return (
                <BudgetCell.HeaderCell key={keyValue}>
                    { props.children }
                </BudgetCell.HeaderCell>
            );
        } else if (props.labelRow.rowType == RowType.VALUE) {
            return (
                <BudgetCell.TableCell key={keyValue} style={style}>
                    { props.children }
                </BudgetCell.TableCell>
            );
        } else if (props.labelRow.rowType == RowType.TOTAL) {
            return (
                <BudgetCell.TotalCell key={keyValue} style={style}>
                    { props.children }
                </BudgetCell.TotalCell>
            );
        } else if (props.labelRow.rowType == RowType.GRAND_TOTAL) {
            return (
                <BudgetCell.GrandTotalCell key={keyValue} style={style}>
                    { props.children }
                </BudgetCell.GrandTotalCell>
            );
        }
    }
}



export { BudgetCell, cellKey, NON_STICKY_COL, getCellColour };
