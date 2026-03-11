'use client'

import { ChangeEvent } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input') ({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
});

export default function InputFileUpload({ label, changeEvent } : { label: string, changeEvent: (event: ChangeEvent<HTMLInputElement>) => void }) {
	return (
		<Button
			component="label"
			role={undefined}
			variant="contained"
			tabIndex={-1}
			startIcon={<CloudUploadIcon />}
		>
		{label}
		<VisuallyHiddenInput
			type="file"
			onChange={(event) => changeEvent(event)}
			multiple
		/>
		</Button>
	);
}
