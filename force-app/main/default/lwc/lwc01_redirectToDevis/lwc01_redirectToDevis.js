import { LightningElement,api } from 'lwc';
export default class Lwc01_redirectToDevis extends LightningElement {
    @api orgDomain
    @api
    set recordId(value) {
        this._recordId = value;
        
    }
    @api
    set serviceId(value){
        this._serviceId = value
    }

    get recordId() {
        return this._recordId;
    }

    get serviceId(){
        return this._serviceId;
    }
    connectedCallback() {
        this.orgDomain = window.location.hostname;
        console.log('Organization Domain: ' + this.orgDomain);

        this.redirect();
    }
    redirect(){
        window.location = 'https://' + this.orgDomain + '/lightning/r/facture_devis__c/' + this.recordId + '/view?ws=%2Flightning%2Fr%2FCase%2F' + this.serviceId + '%2Fview';

    }
}