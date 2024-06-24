import { LightningElement, track ,api} from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

//import { NavigationMixin } from "lightning/navigation";

//import getOpportunities from '@salesforce/apex/AP_GetOpportunities.getOpportunities';
import getFinance from '@salesforce/apex/AP_DatatableUtils.getFinance';

import getNumberFinances from '@salesforce/apex/AP_DatatableUtils.getNumberFinances';
import getGlobalDataset from '@salesforce/apex/AP_DatatableUtils.getGlobalDataset';
import getAllId from '@salesforce/apex/AP_DatatableUtils.getAllId';
import updateFin from '@salesforce/apex/AP_DatatableUtils.updateFin';
import saveTotalAmount from '@salesforce/apex/AP_DatatableUtils.saveTotalAmount';
import saveNumberElement from '@salesforce/apex/AP_DatatableUtils.saveNumberElement';
import saveFinanceStatus from '@salesforce/apex/AP_DatatableUtils.saveFinanceStatus';


export default class LwcDynamicDatatable extends LightningElement {

    @track lstFinances = [];
    @api recordId;
    @api statutLDP;
    headerColumn = [
        "Nom de la facture",
        "Numéro de service",
        "Date de réception",
        "Montant",
        "Devise",
        "Contrevaleur en euros estimée",
        "Prestataire",
        "Destinataire du paiement",
        "Date d'échéance de paiement",
        "Date de mise en paiement",
        "Grand compte",
        "Formule",
        "Prime ou Prestation",
        "Etat de Finance"
    ];

    //tabs
    showVisualisation = false;
    showSelection = true;
    changeTab = false;

    //pagination
    offset;
    numberOfRows;
    paginationRecordsPerPage = 25;
    paginationNumberOfPages;
    moreThanOnePage = false;
    isLastPage = true;
    isFirstPage = true;
    pageNumber;

    //spinner
    showSpinner = false;

    //search
    searchInput = '';

    //checkbox
    selectAll = false;
    //for checkbox state preservation
    selectionMap = {};
    
    //filter
    @track dropDownLists;
    mapFilter;

    filterFields = [{developerName : 'devise_lookup__r.Code_ISO4217__c', wrapperName: 'Devise', displayName : 'Devise'},
                    {developerName: 'Emetteur_facture__r.Name', wrapperName: 'Prestataire', displayName: 'Prestataire'},
                    {developerName: 'RecordType.Name', wrapperName: 'TypeFinance', displayName: 'Type de finance'},
                    {developerName: 'ModeleEconomique__c', wrapperName: 'ModeleEconomique', displayName: 'Prime ou Prestation'},
                    {developerName: 'toLabel(etat__c)', wrapperName: 'etat', displayName: 'Etat de Finance'},
                    {developerName: 'GrandCompte__c', wrapperName: 'grandCompte', displayName: 'Grand Compte'}];
    


    //summary
    totalAmount;
    totalValide;
    showCol = false;
    remove=false;
    hideBinSel = false;
    searching = false;
    @api grandCompteLst=[];
    @api options;
    @api inputValue = '';
    dateList = [{ value: "Passée", label: "Passée" },
    { value: "Aujourd'hui", label: "Aujourd'hui" },
    { value: "7 prochains jours", label: "7 prochains jours" },
    { value: "15 prochains jours", label: "15 prochains jours" },
    { value: "30 prochains jours", label: "30 prochains jours" }];
    
    //date drop down
    showDateList = false;
    // @track dateList = [{itemName : "Passée", selected : false, index : 0}, {itemName : "Aujourd'hui", selected : false, index : 1}, {itemName : "7 prochains jours", selected : false, index : 2}, {itemName : "15 prochains jours", selected : false, index : 3}, {itemName : "30 prochains jours", selected : false, index : 4}];
    currentDate = '';

    constructor() {
        super();
        this.initialiseFilters();
    }

    connectedCallback() {
       
        this.fetchGlobalDataset();    
        this.fetchFinances();
       
        window.addEventListener('status', this.handleStatut)
        window.addEventListener('statusEnvoyer', this.handleStatutEnvoyer)
        // console.log('searching connectedcallback:',this.searching);
    }
    
    handleDate(event) {
        this.currentDate = event.detail.value;
    }
    handleChangeAC(e){
        const key = e.target.value;
        // console.log('key:',key);
        this.inputValue = key;

        // CHECK IF THE USER IS SEARCHING
        if (key != '') this.searching = true;
        else{
            this.searching = false;
            this.options = this.grandCompteLst;
            return;
        }
        // console.log('searching:',this.searching);

        // FILTER VALUES
        //console.log('MKO grandCompteLst', this.grandCompteLst, this.testtemp)
        this.options = this.grandCompteLst.filter(element => element.label.toLowerCase().includes(key.toLowerCase()))
        // console.log('MKO grandCompteLst', this.grandCompteLst, this.options)

    }

    // handleBlurAC(){
    //     //GIVE TIME TO THE USER TO SELECT THE OPTION
    //     this.searching = false;
    // }

    handleClickOption(e){
        const gcSelected = e.currentTarget.dataset.id;
        console.log('gc selected:',gcSelected)
        this.mapFilter['GrandCompte__c']=[gcSelected];
        console.log('map filter:',JSON.stringify(this.mapFilter));
        // POPULATE AND RESTORE INPUT VARIABLES
        this.inputValue = this.grandCompteLst.find(element => element.id == gcSelected).label;
        this.searching = false;
    }

    handleStatut = (event) => {
        console.log('handleStatut start')
        console.log('handleStatut event: ', event)
        this.statutLDP = event.detail.value;
        console.log('this.statutLDP in handleStatut: ', this.statutLDP)
        if(this.statutLDP!= 'Qualification' && this.statutLDP!= 'Pret' && this.statutLDP!= 'Envoye Ebury'){
            this.showCol = true;
        }
        if(this.statutLDP!= 'Qualification' && this.statutLDP!='Pret'){
            this.hideBinSel = true;
            this.showVisualisation = true;
            this.showSelection = false;
            console.log('handleStatut before handleReset: ', event)
            this.handleReset();
            this.searchInput = '';
            this.changeTab = true;
            console.log('handleStatut before fetchGlobalDataset: ', event)
            this.fetchGlobalDataset();
            this.fetchFinances();
            console.log('handleStatut after fetchFinances: ', event)

        }
        console.log('handleStatut end')
     }
     handleStatutEnvoyer = (event) => {
        this.statutLDP = event.detail.value;
       
        console.log('statut ldp envoyer:',this.statutLDP);
        if(this.statutLDP== 'Envoye Ebury'){
            this.hideBinSel = true;
            this.showVisualisation = true;
            this.showSelection = false;
            this.handleReset();
            this.searchInput = '';
            this.changeTab = true;

            this.fetchGlobalDataset();
            this.fetchFinances();
            saveFinanceStatus({ recordId: this.recordId})
            .then(() => {
                
            })
            .catch((error) => {
               
            });
        }
       
     }
    handleDropdownListClose(event) {
        if (event.currentTarget.dataset.index == 'date_decheance') {
            this.showDateList = !this.showDateList;
        } else this.dropDownLists[event.currentTarget.dataset.index].showList = !this.dropDownLists[event.currentTarget.dataset.index].showList;
    }

    handleDropdownListOpen(event) {
        if (event.currentTarget.dataset.index == 'date_decheance') {
            this.showDateList = !this.showDateList;
        } else this.dropDownLists[event.currentTarget.dataset.index].showList = !this.dropDownLists[event.currentTarget.dataset.index].showList;
    }

    buildSelectionMap() {
        for (let i = 1 ; i <= parseInt(this.paginationNumberOfPages); i++) {
            this.selectionMap[i] = [];
        }
    }

    initialiseFilters() {
        
        this.filterFields.forEach(field => {
            if (this.mapFilter != undefined) {
                this.mapFilter[field.developerName.toString()] = [];
            } else {
                this.mapFilter = Object.assign({}, {[field.developerName] : []});
            }
        });
        //console.log('initialise filter',JSON.stringify(this.mapFilter))
    }

    //testtemp

    fetchGlobalDataset() {
        this.showSpinner=true;
       
        getGlobalDataset({searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(result => {
            // console.log('MKO result', result, this.dropDownLists, this.changeTab)
            if(this.dropDownLists==undefined || this.changeTab ){
                this.changeTab=false;
                this.dropDownLists = [];
              
                // this.totalAmount = JSON.parse(result.totalAmount);
                // this.totalValide = JSON.parse(result.totalValide);
                this.filterFields.forEach((field, index1) => {
                  if(field.wrapperName!='grandCompte'){
    
                      let temp = {index : index1, name : field.developerName, showList : false, displayName : field.displayName};
                      let items = [];
                    
                      if (result[field.wrapperName] != undefined) { 
                          JSON.parse(result[field.wrapperName]).forEach((item, index2) => {
                              items.push({index : index2, itemName : item, selected : false});
                          })
                          temp.items = items;
                      }
                      
                      this.dropDownLists.push(temp);
                  }
                 
                });
                let grandCompte = JSON.parse(result.grandCompte);
                this.grandCompteLst = [];
                // Loop through the list of strings
                for (let i = 0; i < grandCompte.length; i++) {
                    // Create an object with `label` and `id` properties
                    let gcObject = {
                        label: grandCompte[i],
                        id: grandCompte[i]
                    };
    
                    // Push the object into the new array
                    this.grandCompteLst.push(gcObject);
                }
                this.options = this.grandCompteLst;
                //this.testtemp= this.grandCompteLst;
                // console.log('MKO print var', JSON.stringify(this.grandCompteLst), JSON.stringify(this.options))

            }
            
            this.totalAmount = JSON.parse(result.totalAmount);
            this.totalValide = JSON.parse(result.totalValide);
            
            // console.log('visualisation:',this.showVisualisation);
            if(this.showVisualisation){
                const event = new CustomEvent('totalAmount', {
                    detail: { value: this.totalAmount, valide: this.totalValide },bubbles:true, composed:true
                });
                this.dispatchEvent(event);

                // Call the function to save the total amount to the database
                this.handleTotalAmountSave();
            }
            // this.showSpinner = false;
        }).catch(error => {
            // console.log('Error => ' + JSON.stringify(error));
            this.showSpinner = false;

        });
    }

    handleTotalAmountSave() {
        // Call Apex method to save totalAmount
        saveTotalAmount({ recordId: this.recordId, totalAmount: this.totalAmount, totalValide:this.totalValide })
            .then(() => {
                // Handle success if needed
                //console.log('Total amount saved successfully');
            })
            .catch((error) => {
                // Handle error if needed
                //console.error('Error saving total amount:', error);
            });
    }
    handleNumberElementSave(){
        saveNumberElement({ recordId: this.recordId, numberElement: this.numberOfRows })
            .then(() => {
              
            })
            .catch((error) => {
                
            });
    }

    fetchFinances() {
        // console.log('fetch finance');
        getNumberFinances({searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(result1 => {
            
        // console.log('fetch finance => getNumberFinances');
            this.showSpinner = true;
            this.numberOfRows = result1;
            if(this.showVisualisation){
                //console.log('number of elements:',this.numberOfRows);
                const event = new CustomEvent('numberElements', {
                    detail: { value: this.numberOfRows },bubbles:true, composed:true
                });
                this.dispatchEvent(event);

                // Call the function to save the total amount to the database
                this.handleNumberElementSave();

            }
            if (this.numberOfRows == 0) {
                this.paginationNumberOfPages = 1;
            } else {
                this.paginationNumberOfPages = Math.ceil(this.numberOfRows / this.paginationRecordsPerPage);
            }
            this.pageNumber = 1;
            this.offset = 0;
            if (this.paginationNumberOfPages > 1) {
                this.moreThanOnePage = true;
                this.isLastPage = false;
                this.isFirstPage = true;
            } else {
                this.isFirstPage = true;
                this.isLastPage = true;
            }
            
            getFinance({countLimit : this.paginationRecordsPerPage, offset : this.offset, searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(result2 => {
                
                this.lstFinances = JSON.parse(JSON.stringify(result2));
                this.buildListFinance();
                
                this.showSpinner = false;

            });
            this.buildSelectionMap();
        });
    }

    buildListFinance() {
        //console.log('Current SM => ' + this.selectionMap[this.pageNumber]);
        this.lstFinances.forEach((fin, index) => {
            // fin.selected = false;
            //console.log('ID => ' + fin.Id);
            //console.log('Current ID Index => ' + this.selectionMap[this.pageNumber].indexOf(fin.Id));
            if (this.selectionMap[this.pageNumber.toString()].indexOf(fin.Id) >= 0) {
                fin.selected = true;
            } else {
                fin.selected = false;
            }
            fin.index = index;
            
            if (fin.service__r == undefined) {
                fin.service__r = { 'CaseNumber' :  ''};
            }
            if (fin.Date_reception_facture__c == undefined) {
                fin.Date_reception_facture__c = '';
            }
            if (fin.Montant_pris_en_charge__c == undefined) {
                fin.Montant_pris_en_charge__c = '';
            }
            if (fin.devise_lookup__r == undefined) {
                fin.devise_lookup__r = { 'Code_ISO4217__c' :  ''};
            }
            if (fin.Contrevaleur_montant_total_PEC_c__c == undefined) {
                fin.Contrevaleur_montant_total_PEC_c__c = '';
            }
            if (fin.Emetteur_facture__r == undefined) {
                fin.Emetteur_facture__r = { 'Name' :  ''};
            }
            if (fin.DestinatairePaiement__r == undefined) {
                fin.DestinatairePaiement__r = { 'Name' :  ''};
            }
            if (fin.Date_echeance__c == undefined) {
                fin.Date_echeance__c = '';
            }
            if (fin.Date_de_mise_en_paiement__c == undefined) {
                fin.Date_de_mise_en_paiement__c = '';
            }
            if (fin.GrandCompte__c == undefined) {
                fin.GrandCompte__c = '';
            }
            if (fin.Formule__r == undefined) {
                fin.Formule__r = { 'Name' :  ''};
            }
            if (fin.ModeleEconomique__c == undefined) {
                fin.ModeleEconomique__c = '';
            }
            if (fin.Contrevaleur_en_euros_validee_Ebury__c == undefined) {
                fin.Contrevaleur_en_euros_validee_Ebury__c = '';
            }
            fin.ServiceUrl = `/${fin.service__c}`
            fin.FactureUrl = `/${fin.Id}`
            fin.FormuleUrl = `/${fin.Formule__c}`
            fin.DestinatairePaiementUrl = `/${fin.DestinatairePaiement__c}`
            fin.EmetteurFactureUrl = `/${fin.Emetteur_facture__c}`
            fin.deviseLookupUrl = `/${fin.devise_lookup__c}`
        });
    }

    handleSearch(event) {
        //Use event.key instead of event.keycode as it is deprecated and recommended for modern dev
        if (event.key == 'Enter') {
            //search
            this.searchInput = this.template.querySelector('[data-id="searchInput"]').value;
            // this.currentDate = '';
            // this.dateList.forEach(item => {
            //     if (item.selected) {
            //         this.currentDate = item.itemName;
            //     }
            // });
            this.fetchFinances();
            this.fetchGlobalDataset();
        }
    }

    handleNext() {
        this.showSpinner = true;
        getFinance({countLimit : this.paginationRecordsPerPage, offset : this.offset + this.paginationRecordsPerPage, searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(response => {
            if (JSON.parse(JSON.stringify(response)).length != 0) {
                this.lstFinances = JSON.parse(JSON.stringify(response));
                this.pageNumber = parseInt(this.pageNumber) + 1;
                // this.lstFinances.forEach((fin, index) => {
                //     if (this.selectionMap[this.pageNumber].indexOf(fin.Id) >= 0) {
                //         fin.selected = true;
                //     } else {
                //         fin.selected = false;
                //     }
                //     fin.index = index;
                // });
                this.buildListFinance();
                this.offset = parseInt(this.offset) + this.paginationRecordsPerPage;
                this.refreshNextPreviousButton();
                this.showSpinner = false;
            }
        }).catch(error => {
            this.showSpinner = false;
        });
    }

    handlePrevious() {
        if (this.offset != 0) {
            this.showSpinner = true;
            getFinance({countLimit : this.paginationRecordsPerPage, offset : this.offset - this.paginationRecordsPerPage, searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(response => {
                if (JSON.parse(JSON.stringify(response)).length != 0) {
                    this.lstFinances = JSON.parse(JSON.stringify(response));
                    this.pageNumber = parseInt(this.pageNumber) - 1;
                    // this.lstFinances.forEach((fin, index) => {
                    //     if (this.selectionMap[this.pageNumber].indexOf(fin.Id) >= 0) {
                    //         fin.selected = true;
                    //     } else {
                    //         fin.selected = false;
                    //     }
                    //     fin.index = index;
                    // });
                    this.buildListFinance();
                    this.offset = parseInt(this.offset) - this.paginationRecordsPerPage;
                    this.refreshNextPreviousButton();
                    this.showSpinner = false;
                }
            }).catch(error => {
                this.showSpinner = false;
            });
        }
    }

    refreshNextPreviousButton() {
        //disabling next and previous buttons based on current page
        this.isLastPage = false;
        this.isFirstPage = false;
        //if last page
        if (this.pageNumber == this.paginationNumberOfPages) {
            this.isLastPage = true;
        }
        //if first page
        if (this.pageNumber == 1) {
            this.isFirstPage = true;
        }
    }

    toggleDropDownList(event){
        this.dropDownLists[event.currentTarget.dataset.index].showList = !this.dropDownLists[event.currentTarget.dataset.index].showList;
    }

    handleSelect(event) {
        const mapFilterName = event.currentTarget.dataset.name;
        const index = event.currentTarget.dataset.index;
        this.dropDownLists[index].items[event.currentTarget.dataset.item].selected = !this.dropDownLists[index].items[event.currentTarget.dataset.item].selected;
        if (this.dropDownLists[index].items[event.currentTarget.dataset.item].selected) {
            this.mapFilter[mapFilterName].push(this.dropDownLists[index].items[event.currentTarget.dataset.item].itemName);
        } else {
            this.mapFilter[mapFilterName].splice(this.mapFilter[mapFilterName].indexOf(this.dropDownLists[index].items[event.currentTarget.dataset.item].itemName), 1);
        }
    }

    handleFilter() {
      
        this.searchInput = this.template.querySelector('[data-id="searchInput"]').value;
        // this.currentDate = '';
        //     this.dateList.forEach(item => {
        //         if (item.selected) {
        //             this.currentDate = item.itemName;
        //         }    
        //     });
        this.fetchFinances();
        this.fetchGlobalDataset();
    }

    handleReset() {
       this.currentDate='';
        this.searchInput = '';
        Object.keys(this.mapFilter).forEach(key => {
            this.mapFilter[key] = [];
        });
       // currentDate = '';
       this.inputValue='';
       this.grandCompteLst=[];
       console.log('data reset:',JSON.stringify(this.grandCompteLst))
       if(this.dropDownLists){
           Object.keys(this.dropDownLists).forEach(list => {
             
               if (this.dropDownLists[list].items != undefined) {
                   this.dropDownLists[list].items.forEach(item => {
                       item.selected = false;
                   });
               }
           });
       }

        // this.dateList.forEach(item => {
        //     item.selected = false;
        // });
        console.log('handle reset final');
        this.handleFilter();
    }

    handleCheckbox(event) {
        if (event.currentTarget.dataset.index == -1) {
            this.selectAll = !this.selectAll;
            this.lstFinances.forEach(fin => {
                fin.selected = this.selectAll;
            });

            this.buildSelectionMap();
            //console.log('Build SM => ' + JSON.stringify(this.selectionMap));

            if (this.selectAll) {
                getAllId({searchValue : this.searchInput, mapFilter : this.mapFilter, dateFilter : this.currentDate, visualisation : this.showVisualisation, recordId :this.recordId}).then(result => {
                    let allId = result;
                    
                    for (let i = 1 ; i <= parseInt(this.paginationNumberOfPages); i++) {
                        for (let j = 0; j < parseInt(this.paginationRecordsPerPage); j++) {
                            let currentId = allId.shift();
                            if (currentId == null) {
                                break;
                            }
                            this.selectionMap[i].push(currentId);
                        }
                    }
                    
                //console.log('Build SM => ' + JSON.stringify(this.selectionMap));
                });
            }
        } else {
            this.lstFinances[event.currentTarget.dataset.index].selected = !this.lstFinances[event.currentTarget.dataset.index].selected;
            if (this.lstFinances[event.currentTarget.dataset.index].selected) {
                this.selectionMap[this.pageNumber].push(event.currentTarget.dataset.id);
            } else {
                let newArray = [];
                this.selectionMap[this.pageNumber].forEach(value => {
                    if (value != event.currentTarget.dataset.id) {
                        newArray.push(value);
                    }
                });
                this.selectionMap[this.pageNumber] = newArray;
                if (this.selectAll) {
                    this.selectAll = false;
                }
            }   
            //console.log('Build single select SM => ' + JSON.stringify(this.selectionMap));
        }
        
    }
    handleDelete(event) {
        let selectedId = event.currentTarget.dataset.id
        this.remove=true;
        let idToRegister = [selectedId];
        
        console.log('deleted Id:', selectedId)
        console.log('deleted lst:', idToRegister)
        updateFin({lstId : idToRegister, recordId : this.recordId, remove:this.remove}).then(result => {
            
            // this.showVisualisation = true;
            this.showSelection = false;
            this.handleReset();
            this.searchInput = '';
            this.fetchGlobalDataset();
            this.fetchFinances();
            this.showNotification('Succès', 'L\'enregistrement a été retiré avec succès.', 'success');
            this.showSpinner = false;
            this.remove=false;
        }).catch(error => {
            this.showNotification('Erreur', 'une erreur s\'est produite', 'error');
            this.remove = false;
        });
    }

    handleRegister() {

        // const event = new CustomEvent('totalAmount', {
        //     detail: { value: this.totalAmount },bubbles:true, composed:true
        // });
        // this.dispatchEvent(event);
        
        this.showSpinner = true;
        let idToRegister = [];
        Object.keys(this.selectionMap).forEach(key => {
            idToRegister = idToRegister.concat(this.selectionMap[key]);
        });

        updateFin({lstId : idToRegister, recordId : this.recordId, remove:this.remove}).then(result => {
            
            this.showVisualisation = true;
            this.showSelection = false;
            this.changeTab=true;
            this.handleReset();
            this.searchInput = '';
            this.fetchGlobalDataset();
            this.fetchFinances();
            this.showNotification('Succès', 'Les enregistrements ont été modifiés avec succès.', 'success');
            this.showSpinner = false;
        }).catch(error => {
            this.showNotification('Erreur', 'une erreur s\'est produite', 'error');
        });

        
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
          title: title,
          message: message,
          variant: variant,
        });
        this.dispatchEvent(evt);
    }

    handleChangeTab(event) {
        console.log('handle change tab');
        this.changeTab=true
        this.selectAll=false
        this.showSpinner = true;
        if (event.target.dataset.name == 'visualisation' && !this.showVisualisation) {
            this.showVisualisation = true;
            this.showSelection = false;
        } else if (event.target.dataset.name == 'selection' && !this.showSelection) {
            this.showSelection = true;
            this.showVisualisation = false;
        }
        
        this.searchInput = '';
        this.handleReset();
        this.fetchGlobalDataset();
        this.fetchFinances();
        // this.showSpinner = false;
    }
    // toggleDateDropDownList() {
    //     this.showDateList = !this.showDateList;
    // }
    // handleDateList(event) {
    //     const selectedItem = event.currentTarget.dataset.index;
        // this.dateList.forEach(item => {
        //     if (item.index == selectedItem && !item.selected) {
        //         item.selected = true;
        //     } else if (item.selected) item.selected = false;
        // });
    // }
}