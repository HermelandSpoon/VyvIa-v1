import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"


export default class Lwc06ModeleEconomique extends OmniscriptBaseMixin(LightningElement) {
    @api ligneFac;
    modeleEconomique;

    connectedCallback() {
        const jsonData = this.omniJsonData
        const recordType = jsonData?.GLOBAL?.RecordType

        // if (recordType == "Remboursement") {
        //     this.ligneFac = jsonData?.lignefacRBM;
        // } else if (recordType == "Facture") {
        //     this.ligneFac = jsonData?.lignefac;
        // }
        if (recordType == "Remboursement" || recordType=='Facture') {
            this.ligneFac = jsonData?.lignefac;
            console.log('json data',jsonData);
            console.log('ligne facturation:',this.ligneFac);
        }
        if (this.ligneFac && typeof this.ligneFac === 'object' && !Array.isArray(this.ligneFac)) {
            this.ligneFac = [this.ligneFac];
        }
        console.log('this.ligneFac: ', this.ligneFac);
        this.determineModeleEconomique()
        console.log('this.modeleEconomique: ', this.modeleEconomique)
    }

    determineModeleEconomique() {
        if (!this.ligneFac) return;

        let allPrestation = true;
        let allPrime = true;

        this.ligneFac.forEach(element => {
            if (element.prestation == true) {
                allPrime = false;
            } else if (element.prestation == false) {
                allPrestation = false;
            }
        });

        console.log('allPrestation', allPrestation)
        console.log('allPrime', allPrime)

        if (allPrestation && !allPrime) {
            this.modeleEconomique = 'Prestation';
        } else if (!allPrestation && allPrime) {
            this.modeleEconomique = 'Prime';
        } else if (!allPrestation && !allPrime) {
            this.modeleEconomique = 'Prime/Prestation';
        }
        this.omniApplyCallResp({ "modeleEconomique": this.modeleEconomique })
    }

}