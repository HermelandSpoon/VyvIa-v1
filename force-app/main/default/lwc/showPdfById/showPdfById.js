import { LightningElement, api } from 'lwc';

export default class ShowPdfById extends LightningElement {
    BASE_URL = '/sfc/servlet.shepherd/version/renditionDownload?';
    BASE_URL_PDF= '/sfc/servlet.shepherd/document/download/';
    @api heightInRem;
    renderAs ='SVGZ';
    url

    @api
    get isImage() {
        return this._isImage;
    }

    set isImage(value) {
        this._isImage = value;
        this.computeUrl();
    }

    @api 
    get ispdf(){
        return this._ispdf;
    }

    set ispdf(value){
        this._ispdf= value;
        this.computeUrl();

    }

    @api 
    get fileId(){
        return this._fileId;
    }
    set fileId(value) {
        this._fileId = value;
        this.computeUrl();
    }
    get pdfHeight() {
        return 'height:'+this.heightInRem + 'rem;';
    }
    computeUrl() {
        const { BASE_URL, BASE_URL_PDF, fileId, ispdf, renderAs,isImage } = this;
        console.log('## MKO PDF ', ispdf, isImage)
        let temp = (ispdf || isImage ?
            BASE_URL_PDF + fileId :
            BASE_URL + `rendition=${renderAs}&versionId=${fileId}`);
        console.log(temp);
        this.url= temp;
    }

}