import { LightningElement, api, track, wire } from 'lwc';
import getRelatedFiles from '@salesforce/apex/LWC02_PdfHandler.getRelatedFiles';
import getContentDocumentFromVersion from '@salesforce/apex/LWC02_PdfHandler.getContentDocumentFromVersion';
import PDF_HANDLER from "@salesforce/resourceUrl/pdf_handler";
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import TITLE_FIELD from "@salesforce/schema/ContentVersion.Title";
import VERSION_DATA_FIELD from "@salesforce/schema/ContentVersion.VersionData";


const TabKind = {
  AttachedFiles: 0,
  NewFiles: 1,
}

const InformationLevel = {
  Error: 0,
  Log: 1,
}

const POLL_INTERVAL = 5000;

export default class Lwc03_pdfHandler extends LightningElement {
  @api recordId;
  _selectedFileId;

  tabSelected = TabKind.AttachedFiles;

  pdfAppUrl = PDF_HANDLER + "/index.html";
  
  @track files = [];
  cachedFilesContent = {};
  loadingFile = false;

  generatingFile = false;
  @track _generatedFiles = [];

  informationMessage = "";
  informationLevel = 0;

  maximized = false;

  pollInterval = undefined;

  get showAttachedFiles() {
    return this.tabSelected === TabKind.AttachedFiles;
  }

  get showNewFiles() {
    return this.tabSelected === TabKind.NewFiles;
  }

  get generatedFileTabLabel() {
    return `Documents découpés (${this._generatedFiles.length})`
  }

  get selectedFileId() {
    return this._selectedFileId;
  }

  @api
  set selectedFileId(value) {
    this._selectedFileId = value;

    if (!this.selectedFileId) {
      const iframeContainer = this.template.querySelector(".b-container");

      if (iframeContainer) {
        iframeContainer.style.height = "0";
      }
    }
  }

  get selectedFileTitle() {
    return this.cachedFilesContent[this.selectedFileId]?.title;
  }

  get informationError() {
    return this.informationLevel === InformationLevel.Error;
  }

  @api
  get generatedFiles() {
    return this._generatedFiles.map(file => file.id).join(',');
  }

  @api
  get generatedFilesList() {
    const selectedEntireFiles = this.files
      .filter(file => file.selectedEntire)
      .map(file => file.ContentDocumentId);
    return selectedEntireFiles.concat(this._generatedFiles.map(file => file.contentDocumentId));
  }

  get hasGeneratedFiles() {
    return this._generatedFiles.length > 0;
  }

  get generatedFilesTabLabel() {
    return `Documents découpés (${this._generatedFiles.length})`;
  }

  @wire(getRecord, {recordId: "$selectedFileId", fields: [TITLE_FIELD, VERSION_DATA_FIELD]})
  getContentDocumentId({data, error}) {
    if (data) {
      console.log("##NB Data: ", data);
      this.cachedFilesContent[this.selectedFileId] = {
        id: this.selectedFileId,
        title: data.fields.Title.value,
        content: data.fields.VersionData.value,
      };
      this.postPdfUrlMessage();
    } else if (error) {
      console.error(error);
    }
  }

  connectedCallback() {
    getRelatedFiles({ recordId: this.recordId })
      .then((data) => {
        this.files = data.map((file) => {
          let displayTitle = file.Title;
          if (displayTitle.length > 15) {
            displayTitle = displayTitle.slice(0, 15) + "...";
          }

          return {
            ...file,
            displayTitle: displayTitle,
            renderUrl: this.generateRenditionUrl(file.Id),
            selectedEntire: false,
            isPdf: file.FileType === "PDF"
          };
        });
      })
      .catch((err) => console.error(err));

    window.addEventListener("message", (event) => {
      console.log("##NB Event Data", event);
      if (event.origin === window.origin) {
        const eventData = JSON.parse(event.data);

        switch (eventData.kind) {
          case "resize": {
            const container = this.template.querySelector(".b-container");
            this.minimizedHeight = `${eventData.height}px`;
            console.log("##NB new height: ", this.minimizedHeight);
            container.style.height = this.minimizedHeight;
            break;
          }
          case "fileloaded":
            this.loadingFile = false;
            break;
          case "maximized": {
            this.maximized = true;
            const container = this.template.querySelector(".b-container");
            container.style.width = "100%";

            this.refs.dummy.style.width = "100dvw";
            this.refs.dummy.style.height = "100dvh";
            break;
          }
          case "minimized": {
            this.maximized = false;
            const container = this.template.querySelector(".b-container");
            // console.log("##NB old height: ", this.minimizedHeight);
            container.style.width = "100%";

            this.refs.dummy.style.width = "100%";
            this.refs.dummy.style.height = "auto";
            break;
          }
          case "filesaved": {
            this.uploadNewDocument(eventData.info);
            break;
          }
          default:
            break;
        }
      }
    });
  }

  uploadNewDocument(info) {
    if (!info.name || !info.data) {
      console.error("##NB Invalid data", info);
      return;
    }
    
    this.generatingFile = true;
    
    const size = new Blob([info.data]).size;
    if (size > 4 * 1024 * 1024) {
      this.showInformation(
        "Votre document est trop volumineux pour être découpé dans Saleforce. Veuillez utiliser un outil externe pour procéder à la découpe", 
        InformationLevel.Log
      );
      setTimeout(() => {
            this.generatingFile = false;
      }, 3000);
      return;
    }

    this.showInformation("Votre document est en cours de création", InformationLevel.Log);

    const contentVersionFields = {
      Title: info.name,
      PathOnClient: info.name,
      VersionData: info.data
    };
    
    const record = {apiName: "ContentVersion", fields: contentVersionFields};
    
    // console.log("##NB started file upload");
    createRecord(record)
      .then((contentVersion) => {
        // console.log("##NB ContentVersion created :", contentVersion);
        
        const file = {
          id: contentVersion.id,
          title: contentVersion.fields.Title.value,
          renditionReady: true,
          renderUrl: this.generateRenditionUrl(contentVersion.id),
        };
        
        getContentDocumentFromVersion({contentVersionId: contentVersion.id})
          .then((data) => {
            console.log("##NB ContentDocument id: ", data);
            file.contentDocumentId = data;
          })
          .catch(err => console.error(err));
        
        this._generatedFiles.push(file);
        this.generatingFile = false;
      })
      .catch((error) => {
        console.error("##NB failed to create ContentVersion: ", error);
        Object.keys(error.body).forEach((field) => console.log(`${field}: ${error.body[field]}`))


        this.showInformation("Une erreur est survenue lors de la création de votre document", InformationLevel.Log);
        setTimeout(() => {
              this.generatingFile = false;
        }, 3000);
      })
  }

  showInformation(message, level) {
    this.generatingFile = true;
    this.informationMessage = message;
    this.informationLevel = level;
  }
  
  generateRenditionUrl(id) {
    return `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB120BY90&versionId=${id}`
  }

  postPdfUrlMessage() {
    const iframe = this.template.querySelector(".b-iframe");
    if (!iframe) {
      console.error("LWC Error: Failed to get child iframe");
      return;
    }
    // console.log("##NB Sending data to child iframe:", this.cachedFilesContent[this.selectedFileId]);
    const file = this.cachedFilesContent[this.selectedFileId];
    iframe.contentWindow.postMessage({
      format: "Base64",
      content: file.content
    });
  }

  setFileSelectedEntire(id, value) {
    const file = this.files.find((f) => {
      return f.Id === id;
    })

    if (file) {
      file.selectedEntire = value;
      this.selectedFileId = null;
    }
  }

  handleSelectEntireFile(event) {
    this.setFileSelectedEntire(event.target.dataset.id, true);
  }

  handleDeselectEntireFile(event) {
    this.setFileSelectedEntire(event.target.dataset.id, false);
  }

  async handleFileClick(event) {
    this.selectedFileId = event.currentTarget.dataset.id;
    this.loadingFile = true;

    this.template.querySelectorAll(".b-file").forEach((el) => {
      const id = el.dataset.id;
      el.style.color = id === this.selectedFileId ? "rgb(65, 148, 249)" : ""; 
    })

    const iframeContainer = this.template.querySelector(".b-container");

    if (iframeContainer) {
      iframeContainer.style.height = "0";
    }
  }

  handleTabClick(event) {
    const tabKind = parseInt(event.target.dataset.kind, 10);

    if (tabKind !== this.tabSelected) {
      this.tabSelected = tabKind
      this.selectedFileId = null;

      this.template.querySelectorAll(".b-tab").forEach((el) => {
        el.classList.remove("b-active-tab");
      })
      event.target.classList.add("b-active-tab");
    }
  }

  // NOTE(NB): Absolutely disgusting way to poll if the renditionDownload is ready or not
  handleGeneratedPreviewError() {
    this._generatedFiles[this._generatedFiles.length - 1].renditionReady = false;

    setTimeout(() => {
      this._generatedFiles[this._generatedFiles.length - 1].renditionReady = true;
    }, POLL_INTERVAL)
  }
}