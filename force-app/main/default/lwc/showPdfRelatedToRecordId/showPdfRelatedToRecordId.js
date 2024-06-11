import { LightningElement, api, track } from 'lwc';
import getRelatedFilesByRecordId from '@salesforce/apex/PDFViewerController.getRelatedFilesByRecordId';

export default class ShowPdfRelatedToRecordId extends LightningElement {

    @api recordId;
    @api heightInRem;
    @track ispdf;
    error;
    @track fileID;
    isImage=false;
    FILE_EXTENSION={
        'image': ['jpg', 'png', 'jpeg', 'gif', 'svg'],
        'pdf':['pdf']
    }
    pdfFiles = [];

    connectedCallback(){
        this.getContentDocumentValue();
    }
    ISNULL(str) {
        return str === null || str === undefined || str === '';
    }
    getContentDocumentValue(){
        getRelatedFilesByRecordId({ recordId: this.recordId })
            .then(data => {
                console.log('## MKO DATA ', JSON.stringify(data))
                if(data && JSON.stringify(data)!=='{}'){
                    this.pdfFiles = data;
                    this.error = undefined;    
                    const fileIDs = Object.keys(data);
                    this.fileID = fileIDs[0] ;
                }
            })
            .catch(error => {
                this.error = error;
                this.pdfFiles = undefined; 
                this.fileID = undefined; 
            });
    }

    get tabs() {
        return Object.entries(this.pdfFiles).map(([ID, {Title}]) => ({value: ID, label: Title}))
    }

    setFileID(e) {
        let fileId = e.target.value;
        const {FileExtension,ContentDocumentId } = this.pdfFiles[fileId]
        this.isImage = this.FILE_EXTENSION['image']?.includes(FileExtension) ?? false;
        if(this.isImage){
            this.fileID = ContentDocumentId;
            this.ispdf=false;
        }else{
            this.ispdf = this.FILE_EXTENSION['pdf'].includes(FileExtension);
            if(this.ispdf){
                this.fileID = ContentDocumentId;
            }else{
                this.fileID = fileId;
            }        
        }
        console.log('## MKO PDF ', this.ispdf, this.fileID, this.isImage)
    }
    
}