import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"

export default class Lwc02DisplayStatutBar extends OmniscriptBaseMixin(LightningElement) {
    omniJsonData
    status_devis = [
        { API: 'Analyse', Label: 'Analyse' },
        { API: 'Consultation medicale', Label: 'Consultation médicale' },
        { API: 'Prise en charge', Label: 'Prise en charge' }
    ];


    status_facture = [
        { Label: 'Conformité', API: 'Conformite' },
        { Label: 'Traitement', API: 'Traitement' },
        { Label: 'Contrôle', API: 'Controle' },
        { Label: 'Paiement / Facturation	', API: 'Paiement_Facturation' },
    ];

    status_remboursement = [
        { Label: 'Conformité', API: 'Conformite' },
        { Label: 'Traitement', API: 'Traitement' },
        { Label: 'Paiement / Facturation	', API: 'Paiement_Facturation' },
    ];
    combinedArray=[]
    @api jsonData;

    connectedCallback() {
        console.log(this.omniJsonData.hasOwnProperty('StepTracker'))
        let index = this.omniJsonData.hasOwnProperty('StepTracker') ? this.omniJsonData.StepTracker : 0
        let recName = this.omniJsonData.recName;
        this.computeStatut(index, recName)
    }

    computeStatut(index, recName) {
        const arrToItr = recName === 'Devis' ? this.status_devis
            : recName === 'Facture' ? this.status_facture
            : this.status_remboursement;

        this.combinedArray = arrToItr.map((value, idx) => ({
            status: value.Label,
            current: idx === index,
            completed: idx < index,
            not_yet: idx > index,
        }));
    }
}