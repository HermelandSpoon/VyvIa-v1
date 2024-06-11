import { LightningElement,api } from 'lwc';
import getLDP from "@salesforce/apex/AP_LotDePaiementUtils.getLDP";
export default class Lwc05LotDePaiementLayout extends LightningElement {
    @api recordId;
    @api getLdpRecord
    recordRetrieved = false;
    connectedCallback() {
        this.fetchLDP();
    }
    fetchLDP(){
        getLDP({recordId:this.recordId}).then(result => {
            this.getLdpRecord = result;
            this.recordRetrieved = true;
        }).catch(error => {
            console.log('Error => ' + JSON.stringify(error));
        });
    }
}