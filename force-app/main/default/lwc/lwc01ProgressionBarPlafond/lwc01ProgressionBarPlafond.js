import { LightningElement, api, wire } from 'lwc';
import savePlafond from "@salesforce/apex/AP_LotDePaiementUtils.savePlafond";
import savePretRefacturation from '@salesforce/apex/AP_LotDePaiementUtils.savePretRefacturation';

import { getRecord, getFieldValue, notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
import STATUT_FIELD from "@salesforce/schema/Lot_paiement__c.Statut__c";
import getPicklistValue from '@salesforce/apex/AP01LotDePaiement.getPicklistValue';
import updateRecord from '@salesforce/apex/AP01LotDePaiement.updateRecord';
import getReportUrl from '@salesforce/apex/AP01LotDePaiement.getReportUrl';

export default class Lwc01ProgressionBarPlafond extends LightningElement {
    @api recordId;
    @api nombreEle = 0;
    @api ldpRecord;

    plafond = 550000;
    montant = 0;
    percentage;
    diff;
    width;
    montantValide = 0;
    statut;
    pretRefac
    errorMsg = '';
    showPret = false;
    showMontantValide = false;
    showError = false;
    defaultRecordTypeId
    nextLabel = ''
    nextApi = ''
    currApi = ''
    showButton = false;
    skip = ['Traitement', 'Paiement', 'Echec', 'Confirmation']
    lstStatut = {}
    EnvoyerAEbury

    get formattedPlafond() {
        // Convert decimal separator from period to comma
        const formattedNumber = this.plafond.toLocaleString('fr-FR', { minimumFractionDigits: 2 });

        // Replace period with comma for decimal separator
        return formattedNumber.replace('.', ',');
    }

    connectedCallback() {
        getPicklistValue({ objectName: 'Lot_paiement__c', fieldName: 'Statut__c' }).then(data => {
            this.lstStatut = data
            this.initialiseFields();
            this.computeField();
            this.sendReport(this.pretRefac)
        }).catch(error => {
            console.error('Error in retrieving picklist values: ', error);
        })


        // Listen for the custom event to get amount from datatable
        window.addEventListener('totalAmount', this.handleTotalAmount)

        // Listen for the custom event to get number of elements from datatable        
        window.addEventListener('numberElements', this.handleNumberElement)
    }

    @wire(getRecord, { recordId: '$recordId', fields: [STATUT_FIELD] })
    wireComputeField({ error, data }) {
        if (data) {
            console.log('wireComputeField executing')
            this.currApi = getFieldValue(data, STATUT_FIELD);
            this.EnvoyerAEbury = (this.currApi === 'Envoye Ebury' ? 'Votre lot de paiement a été envoyé et est en cours de traitement par Ebury' : '')
            this.statut = this.currApi

            this.computeButtonLabel(this.currApi);
            this.sendReport(this.pretRefac)
        } else if (error) {
            console.error('Error retrieving record: ', error)
        }
    }

    handleTotalAmount = (event) => {
        this.montant = event.detail.value;
        this.montantValide = event.detail.valide
        this.calculatePercentage();
        this.calculateDiff();
    }

    handleNumberElement = (event) => {
        this.nombreEle = event.detail.value
    }

    initialiseFields() {
        this.recordId = this.ldpRecord.Id;
        if (this.ldpRecord.Montant_total__c != undefined) {
            this.montant = this.ldpRecord.Montant_total__c
        }
        if (this.ldpRecord.Montant_total_en_euros_valide__c != undefined) {
            this.montantValide = this.ldpRecord.Montant_total_en_euros_valide__c
        }
        if (this.ldpRecord.Nombre_elements__c != undefined) {
            this.nombreEle = this.ldpRecord.Nombre_elements__c
        }
        if (this.ldpRecord.Error_message__c != undefined) {
            this.errorMsg = this.ldpRecord.Error_message__c;
        }
        this.plafond = this.ldpRecord.Plafond_autorise__c;
        this.percentage = (this.montant / this.plafond) * 100;
        this.diff = this.plafond - this.montant;
        if (this.percentage > 100) {
            this.width = 'width:100%';
        } else if (this.percentage < 0) {
            this.width = 'width:0%'
        } else {
            this.width = 'width:' + this.percentage + '%';

        }
        this.statut = this.ldpRecord.Statut__c

        console.log('statut progression bar', this.statut);
        //send statut to datatable lor conditional
        const event = new CustomEvent('status', {
            detail: { value: this.statut }, bubbles: true, composed: true
        });
        this.dispatchEvent(event);

        if (this.statut == 'Paiement') {
            this.showPret = true;
            this.showMontantValide = true;
        } else if (this.statut == 'Echec') {
            this.showMontantValide = true;
            this.showError = true;
        }

        this.pretRefac = this.ldpRecord.Pret_Refacturation__c

        this.currApi = this.ldpRecord.Statut__c
        this.showButton = this.pretRefac

        console.log("LDP pret refac: ", this.pretRefac);
    }

    handlePlafondChange(event) {
        this.plafond = event.target.value;
        this.calculatePercentage();
        this.calculateDiff();
    }

    calculatePercentage() {
        this.percentage = ((parseFloat(this.montant) / parseFloat(this.plafond)) * 100).toFixed(0);
        if (this.percentage > 100) {
            this.width = 'width:100%';
        } else if (this.percentage < 0) {
            this.width = 'width:0%'
        } else {
            this.width = 'width:' + this.percentage + '%';
        }
    }

    calculateDiff() {
        this.diff = parseFloat(this.plafond) - parseFloat(this.montant);
    }

    // Handle onblur event
    handlePlafondBlur() {
        // Call Apex method to save plafond
        savePlafond({ recordId: this.recordId, plafondValue: this.plafond })
            .then(result => {
                // Handle success
                console.log('Plafond saved successfully:', result);
            })
            .catch(error => {
                // Handle error
                console.error('Error saving plafond:', error);
            });
    }

    handleCheckboxChange(event) {
        let checked = event.target.checked
        // console.log('test', checked)
        console.log('nextLabel: ', this.nextLabel)
        savePretRefacturation({ recordId: this.recordId, value: checked })
            .then(result => {
                this.sendReport(checked)
                this.statut = this.currApi
            }).catch(error => {
                console.error('Prêt Pour Refacturation:', error)
            })
        // this.computeButtonLabel(this.currApi);
    }

    computeField() {
        this.EnvoyerAEbury = (this.currApi === 'Envoye Ebury' ? 'Votre lot de paiement a été envoyé et est en cours de traitement par Ebury' : '')
        this.computeButtonLabel(this.currApi);
    }

    computeButtonLabel(curr) {
        console.log('this.lstStatut', this.lstStatut)
        if (Array.isArray(this.lstStatut)) {
            const index = this.lstStatut.findIndex(stat => stat.value === curr);
            console.log(index)
            if (index !== -1 && index + 1 < this.lstStatut.length) {
                let temp = this.lstStatut[index + 1];
                this.nextApi = temp.value;
                this.showButton = !this.skip.includes(this.nextApi);
                if (this.showButton) {
                    this.nextLabel = (this.nextApi == 'Envoye Ebury') ? 'Envoyer vers Ebury' : temp.label;
                }
            } else {
                console.log('computebuttonlabel showbutton false')
                this.showButton = false;
            }
        }
    }

    async handleClick(event) {
        if (this.nextLabel !== 'Rapport pour refacturation') {
            if (this.nextLabel == 'Envoyer vers Ebury') {
                this.statut = 'Envoye Ebury';
                const event = new CustomEvent('statusEnvoyer', {
                    detail: { value: this.statut }, bubbles: true, composed: true
                });
                this.dispatchEvent(event);
            }
            await updateRecord({ rId: this.recordId, stat: this.nextApi });
            await notifyRecordUpdateAvailable([{ recordId: this.recordId }]);
        } else {
            let rptId = await getReportUrl();
            if (rptId) {
                console.log(`/lightning/r/Report/${rptId}/view?fv0=${this.recordId}`);
                window.open(`/lightning/r/Report/${rptId}/view?fv0=${this.recordId}`, '_blank');
            }
        }
    }

    sendReport(checked) {
        // let checked = event.target.checked
        if (this.currApi === 'Paiement') {
            if (checked) {
                this.nextLabel = 'Rapport pour refacturation';
                console.log('send report showbutton true')
                this.showButton = true;
            } else {
                this.nextLabel = '';
                this.showButton = false;
            }
        }
    }

}