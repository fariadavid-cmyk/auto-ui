function convertFileListToArray(fileList: FileList | null) : File[] {
	let files : File[] = [];

	if (fileList != null)
	{
		for (let fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
			files.push(fileList[fileIndex]);
		}
	}
	
	return files;
}

function downloadBlob(blob: Blob, filename: string): void {
	const dataUrl = window.URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = dataUrl;
	link.download = filename; // The file name the user will see
	link.style.display = 'none'; // Hide the element

	document.body.appendChild(link);
	link.click();

	// Clean up
	document.body.removeChild(link);
	window.URL.revokeObjectURL(dataUrl);
};



export { convertFileListToArray, downloadBlob };
