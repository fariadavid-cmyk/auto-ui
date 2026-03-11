import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { StateTuple } from '@/types/general';



function ConfirmationDialog(props : {
            openState: StateTuple<boolean>,
            title: string,
            callback: () => void,
            children: React.ReactNode
        }) {
    const openState = props.openState;
    const title = props.title;
    const callback = props.callback;
    const children = props.children;

	const handleDialogOpen = () => {
		openState.set(true);
	};

	const handleCancel = () => {
		openState.set(false);
	};

	const handleOK = () => {
		openState.set(false);
		callback();
	};



    return (
        <Dialog
            open={openState.get}
            onClose={handleCancel}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{ title }</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{ children }</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleOK} autoFocus>OK</Button>
            </DialogActions>
        </Dialog>
    );
}



export default ConfirmationDialog;
