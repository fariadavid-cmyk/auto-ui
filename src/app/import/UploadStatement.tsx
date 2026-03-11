'use client'

import React from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import { useDropzone } from 'react-dropzone';

import { PersistedEntity } from "@/types/general";
import { SourceTypeImportConfig, SourceTypeImportConfigMap, StatementPreview, Transaction } from "@/types/transactions";
import { applyCategorization } from "@/io/category";
import { fetchSourceTypes, previewStatement, saveSourceType, uploadStatement } from "@/io/transaction";

import { BusyTask, BusyTaskStates, newBusyTaskStates } from "../components/BusyTask";
import PreviewStatement from "./PreviewStatement";
import { MessageState, StatusMessage } from "../components/StatusMessage";



type UploadFormFields = {
	selectedSourceType: string | null,
	inputSourceType: string,
	statementFiles: File[]
};

function UploadStatement(props : { }) {
	const [isUploaded, setUploaded] = React.useState<boolean>(false);
	const [showPreview, setShowPreview] = React.useState<boolean>(false);
	const [previewData, setPreviewData] = React.useState<StatementPreview>([]);
	const [formData, setFormData] = React.useState<UploadFormFields>({
		selectedSourceType: null,
		inputSourceType: "",
		statementFiles: []
	});

	// Transition and result for uploading files
	const result = new MessageState();
	const busyStates: BusyTaskStates = newBusyTaskStates("Source type saved");

	const [triggerSourceTypeRefresh, setTriggerSourceTypeRefresh] = React.useState(false);
	const [sourceTypes, setSourceTypes] = React.useState<SourceTypeImportConfigMap>(new Map<string, SourceTypeImportConfig>());

	// Transition for categorizing new statements
	const [isCategorizing, startCategorizing] = React.useTransition();
	
	const sourceTypeNames: string[] = [];
	sourceTypes.keys().forEach((name) => {
		sourceTypeNames.push(name);
	});

	React.useEffect(() => {
		console.log("Loading source types...");
		busyStates.working.start(async () => {
			const sourceTypeConfigs : SourceTypeImportConfig[] = await fetchSourceTypes();
			const sourceTypeMap : SourceTypeImportConfigMap = new Map<string, SourceTypeImportConfig>();

			sourceTypeConfigs.forEach((sourceType) => {
				sourceTypeMap.set(sourceType.name, sourceType);
			});

			setSourceTypes(sourceTypeMap);
			console.log("Loaded " + sourceTypeMap.size + " source types");
		});
	}, [triggerSourceTypeRefresh]);

	function createNewSourceType(sourceType: SourceTypeImportConfig) {
		busyStates.working.start(async () => {
			let entity: PersistedEntity = await saveSourceType(sourceType);

			if (entity.persistId !== null) {
				setTriggerSourceTypeRefresh(!triggerSourceTypeRefresh);
				setFormData({...formData, selectedSourceType: sourceType.name, inputSourceType: sourceType.name});
				setShowPreview(false);
				busyStates.message.set("Source type saved");
				busyStates.taskComplete.set(true);
			} else {
				result.setMessage("Could not save source type", "error");
			}
		});
	}

	function submitStatement(formFieldData: React.FormEvent<HTMLFormElement>) {
		formFieldData.preventDefault();
		if (formData.statementFiles.length > 0) {
			busyStates.working.start(async () => {
				let fileCount = 0;

				for (let fileIndex = 0; fileIndex < formData.statementFiles.length; fileIndex++) {
					console.log("Uploading file " + (fileIndex + 1) + " of " + formData.statementFiles.length);
					let entity: PersistedEntity = await uploadStatement(formData.selectedSourceType as string, formData.statementFiles[fileIndex]);

					if (entity.persistId) {
						fileCount++;
					} else {
						result.setMessage("Could not upload file '" + formData.statementFiles[fileIndex].name + "'", "error");
					}
				}

				if (fileCount == formData.statementFiles.length) {
					result.setMessage("Uploaded " + fileCount + " of " + formData.statementFiles.length + " files successfully", "success");
					setUploaded(true);
					setShowPreview(false);
				} else {
					setUploaded(false);
				}
				setFormData({ ...formData, statementFiles: [] });
			});
		}
	}

	function doPreview(event: React.MouseEvent<unknown>) {
		console.log("Preview statement");
		if (formData.statementFiles.length > 0) {
			let previewFile: File = formData.statementFiles[0];

			busyStates.working.start(async () => {
				let preview: StatementPreview = await previewStatement(previewFile);

				setPreviewData(preview);
				setShowPreview(true);
			});
		}
	}

	function hidePreview(event: React.MouseEvent<unknown>) {
		setShowPreview(false);
	}

	function doCategorize(event: React.MouseEvent<unknown>) {
		console.log("Perform categorization");
		busyStates.working.start(async () => {
			let txns : Transaction[] = await applyCategorization();
			window.location.href = "/uncategorized";
		});
	}

	const DropzoneArea = () => {
		const { getRootProps, getInputProps } = useDropzone({
			onDrop: (acceptedFiles) => {
				setFormData({ ...formData, statementFiles: acceptedFiles });
			}
		});

		return (
			<div {...getRootProps()} style={{ border: '2px dashed gray', padding: 20 }}>
				<input {...getInputProps()} />
				<p>Drag files to upload here, or click to select</p>
				<List dense={true}>
					{formData.statementFiles.map((file) =>
						<ListItem key={file.name}>
							<ListItemText primary={file.name}/>
						</ListItem>
					)}
				</List>
			</div>
		);
	};

	return (
		<>
			<Box role="presentation" component="form" onSubmit={submitStatement} padding={2}>
				<Stack spacing={2} sx={{ width: '50%' }}>
					<Autocomplete
						id="inputSourcetype"
						freeSolo
						options={sourceTypeNames}
						renderInput={(params) => <TextField {...params} required label="Source Type" error={formData.inputSourceType.length == 0} helperText="Select or enter the source of this statement" />}
						value={formData.selectedSourceType}
						onChange={(event: any, newValue: string | null) => { setFormData({ ...formData, selectedSourceType: newValue, inputSourceType : newValue ? newValue : "" }); }}
						inputValue={formData.inputSourceType}
						onInputChange={(event, newInputValue) => { setFormData({ ...formData, inputSourceType: newInputValue, selectedSourceType : null }); }}
					/>

					<DropzoneArea />

				</Stack>

				<Grid container padding={2}>
					<Grid size={4}>
						<Button
							sx={{display: showPreview ? 'none' : 'inline'}}
							variant="contained"
							endIcon={<ArrowDownwardIcon />}
							disabled={formData.statementFiles.length == 0}
							onClick={doPreview}
						>Preview Statement File</Button>
						<Button
 							sx={{display: showPreview ? 'inline' : 'none'}}
 							variant="contained"
							endIcon={<ArrowUpwardIcon />}
							disabled={formData.statementFiles.length == 0}
							onClick={hidePreview}
						>Hide Preview</Button>
					</Grid>
					<Grid size={4}>
						<Button
							type="submit"
							variant="contained"
							disabled={ formData.selectedSourceType == null || formData.statementFiles == null || formData.statementFiles.length == 0 }
						>Upload Statement File</Button>
					</Grid>
					<Grid size={4}>
						<Button variant="contained" endIcon={<ArrowForwardIcon />} disabled={!isUploaded} onClick={doCategorize}>Categorize Transactions</Button>
					</Grid>
				</Grid>

				<StatusMessage state={result} />
			</Box>

			<Box sx={{display: showPreview ? 'inline' : 'none'}}>
				<PreviewStatement data={previewData} sourceTypes={sourceTypes} sourceTypeName={formData.inputSourceType} createSourceTypeHandler={createNewSourceType} />
			</Box>

			<BusyTask states={busyStates} />
		</>
	);
}



export default UploadStatement;