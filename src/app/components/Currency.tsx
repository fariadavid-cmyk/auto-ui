import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { asCurrency } from "@/utils/Finance";



function Currency(props: { amount: number }) {
    if (!Number.isNaN(props.amount)) {
        let currency = asCurrency(props.amount);
        let left = currency.symbolAtHead ? currency.symbol : currency.value;
        let right = currency.symbolAtHead ? currency.value : currency.symbol;

        return (
            <Table padding="none"><TableBody><TableRow>
                <TableCell align="left" sx={{ border: 0 }}>{left}</TableCell>
                <TableCell align="right" sx={{ border: 0 }}>{right}</TableCell>
            </TableRow></TableBody></Table>
        );
    } else {
        return ( <Typography component="span">amount</Typography> );
    }
}



export default Currency;
