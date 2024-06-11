import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import deleteLigneDeFacture from '@salesforce/apex/AP03_LigneFacturation.deleteLigneDeFacture';
import updateLigneDeFacture from '@salesforce/apex/AP03_LigneFacturation.updateLigneDeFacture';

export default class Lwc04_LigneDeFacturation extends OmniscriptBaseMixin(LightningElement) {
    @api records;
    @api recordId;
    @api parentData = false;

    updatedRows = [];
    deletedRows = [];
    delete = false;

    connectedCallback() {
        this.deletedRows = [];
        this.updatedRows = this.omniJsonData?.LigneFacture;
    }

    handleUpdate(evt) {
        if (this.delete) {
            this.delete = false;
            return;
        }

        var toUpdate = []
        evt.detail.result.forEach(item => {
            var Plafond_devises;
            var Montant_total_devises;

            if (item.Plafond_devises__c)
                Plafond_devises = parseFloat(item.Plafond_devises__c);

            if (item.Montant_total_devises__c)
                Montant_total_devises = parseFloat(item.Montant_total_devises__c);

            if (Plafond_devises && Montant_total_devises) {
                if (Plafond_devises > Montant_total_devises) {
                    item.Montant_total_PEC_devises__c = item.Pourcentage_PEC__c / 100 * Montant_total_devises;
                } else {
                    item.Montant_total_PEC_devises__c = item.Pourcentage_PEC__c / 100 * Plafond_devises;
                }
                item.Copaiement_devises__c = item.Montant_total_devises__c - item.Montant_total_PEC_devises__c;
            }

            delete item.originalIndex

            toUpdate.push({
                Id: item.Id,
                Montant_total_devises__c: item.Montant_total_devises__c,
                Plafond_devises__c: item.Plafond_devises__c,
                Copaiement_devises__c: item.Copaiement_devises__c,
                Contrevaleur_montant_total_PEC__c: item.Contrevaleur_montant_total_PEC__c,
                Pourcentage_PEC__c: item.Pourcentage_PEC__c,
                Finance__c: item.Finance__c,
                Pourcentage_PEC__c: item.Pourcentage_PEC__c
            });
        });

        this.records = evt.detail.result;
        this.parentData = true;

        const recordsStr = JSON.stringify(toUpdate);

        updateLigneDeFacture({ lignesToUpdate: recordsStr }).then(result => {
            console.log('update successful');
        }).catch(error => {
            console.error('error updating: ' + error);
        });

        this.omniApplyCallResp({ "LigneFacture": evt.detail.result });
        this.omniApplyCallResp({ "isChanged": true });
    }

    // TODO: When ligne de facture is deleted, the montant in facture_devis__c should be updated as well
    handleDelete(event) {
        this.delete = true;

        const toBeDeleted = event.detail.result;
        let ligneFac = this.omniJsonData?.LigneFacture;

        // If ligneFac is undefined or not an array, put it into an array
        if (!ligneFac || !Array.isArray(ligneFac)) {
            ligneFac = [ligneFac].filter(Boolean);
        }

        console.log('before ligneFac.filter: ', ligneFac)

        let newLigneFac = ligneFac.filter(record => record.Id !== toBeDeleted.Id)

        console.log('delete event.detail.result: ', event.detail.result)

        const ligneFacToBeDeleted = {
            Id: toBeDeleted.Id,
            Finance__c: toBeDeleted.Finance__c,
            Montant_total_devises__c: toBeDeleted.Montant_total_devises__c,
            Plafond_devises__c: toBeDeleted.Plafond_devises__c,
            Copaiement_devises__c: toBeDeleted.Copaiement_devises__c,
            Contrevaleur_montant_total_PEC__c: toBeDeleted.Contrevaleur_montant_total_PEC__c,
            Pourcentage_PEC__c: toBeDeleted.Pourcentage_PEC__c
        };

        console.log('ligne de facture to be deleted: ', ligneFacToBeDeleted)

        this.omniApplyCallResp({ "LigneFacture": newLigneFac });
        this.deletedRows.push(event.detail.result);

        this.omniApplyCallResp({ "deletedRows": this.deletedRows });
        this.omniApplyCallResp({ "isChanged": true });

        deleteLigneDeFacture({ ligneToDelete: JSON.stringify(ligneFacToBeDeleted) }).then(result => {
            console.log('deletion successful');
        }).catch(error => {
            console.error('error deleting: ', error);
            console.error('error.message: ', error.message)
        });
    }
}

/*
String jsonString = '{'+
    '"Id": "a21G5000000hXaDIAU",'+
    '"Finance__c": "a0KG500000AYZteMAH",'+
    '"Montant_total_devises__c": 0,'+
    '"Plafond_devises__c": 0,'+
    '"Copaiement_devises__c": 0,'+
    '"Contrevaleur_montant_total_PEC__c": 0'+
'}';
AP03_LigneFacturation.deleteLigneDeFacture(jsonString);

*/