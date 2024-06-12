import { LightningElement,api, track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"
export default class Lwc01StatusAllowed extends OmniscriptBaseMixin(LightningElement) {
    @api status;
    @api jsonData;
    @track options;
    @track hide;
    disable=false;
    value
    connectedCallback(){
        this.jsonData = this.omniJsonData
        this.status = this.jsonData.GLOBAL.Statut;
        this.multiDevise = this.jsonData.GLOBAL.accMultiDevises;
        this.presSousSurveillance = this.jsonData.GLOBAL.accPresSousSurveillance;
        this.seuilControle = this.jsonData.GLOBAL.accSeuilControle;
        this.montantPEC = this.jsonData.GLOBAL.montantpris;

        console.log('jsonData:', JSON.stringify(this.jsonData));
        console.log('Status: ', this.status, 'multi: ',this.multiDevise, 'pres: ',this.presSousSurveillance, 'seuil: ',this.seuilControle, 'montant: ',this.montantPEC);
        console.log('True',((this.montantPEC>this.seuilControle)&& this.seuilControle!=null));

        if (['Facture rejetee','Devis rejete'].includes(this.status)){
            this.disable= true; 
            this.value = this.status;           
        }else{
            if(this.jsonData.recName == 'Devis' && this.jsonData.FIN_Urgence == false){
                this.statutDevis()
            }
            else if(this.jsonData.recName == 'Devis'&& this.jsonData.FIN_Urgence == true){
                this.statutDevisUrgence()
            }
            else if(this.jsonData.recName == 'Facture'){
                this.statutFacture()
            }
            else{
                this.statutRemboursement()
            }
            // Set the default value to the first option in the options array
            this.value = this.status;
            this.omniApplyCallResp({ "next_status": this.value })
        
        }

    }

    statutDevis(){
        console.log('devis start')
        this.hide = false;
        switch(this.status){
            case 'Analyse':
                this.options = [
                    { value: 'Analyse', label: 'Analyse' },
                    { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                    { value: 'En attente validation medicale', label: 'En attente validation médicale' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Devis rejete', label: 'Devis rejeté' }
                ];
                break;

            case 'En attente demande de pieces':
                this.options = [
                    { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                    { value: 'En attente validation medicale', label: 'En attente validation médicale' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Devis rejete', label: 'Devis rejeté' }
                ];
                break;
            
            case 'En attente validation medicale':
                this.options = [
                    { value: 'En attente validation medicale', label: 'En attente validation médicale' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Devis rejete', label: 'Devis rejeté' }
                ];
                break;
            
            case 'Qualification':
                this.options = [
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Devis valide', label: 'Devis validé' },
                    { value: 'Devis rejete', label: 'Devis rejeté' }
                ];
                break;
                
            default: this.hide = true;
        }
        console.log('devis end')
    }

    statutDevisUrgence(){
        console.log('devis urgence start')
        this.hide = false;
        switch(this.status){
            case 'Analyse':
                this.options = [
                    { value: 'Analyse', label: 'Analyse' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Devis rejete', label: 'Devis rejeté' }
                ];
                break;

            case 'Qualification':
                this.options = [
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'En attente validation medicale', label: 'En attente validation médicale' },
                    { value: 'Devis valide', label: 'Devis validé' }
                ];
                break;
            case 'En attente validation medicale':
                this.options = [
                    { value: 'En attente validation medicale', label: 'En attente validation médicale' },
                    { value: 'Devis valide', label: 'Devis validé' }
                ];
                break;  
            default: this.hide = true;
                        
        }
        console.log('devis urgence end')
    }

    statutFacture(){
        console.log('facture start')
        this.hide = false;
        switch(this.status){
            case 'Analyse':
                this.options = [
                    { value: 'Analyse', label: 'Analyse' },
                    { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Facture rejetee', label: 'Facture rejetée' }
                ];
                break;

            case 'En attente demande de pieces':
                if(this.presSousSurveillance==true || this.multiDevise==true|| ((this.montantPEC>this.seuilControle)&& this.seuilControle!=null)){
                    this.options = [
                        { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                        { value: 'Qualification', label: 'Qualification' },
                        { value: 'Validation DG', label: 'Validation DG' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }else{
                    this.options = [
                        { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                        { value: 'Qualification', label: 'Qualification' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }
            
            case 'Qualification':
                
                if(this.presSousSurveillance==true || this.multiDevise==true|| ((this.montantPEC>this.seuilControle)&& this.seuilControle!=null)){ 
                    this.options = [
                        { value: 'Qualification', label: 'Qualification' },
                        { value: 'Bon a payer', label: 'Bon à payer' },
                        { value: 'Validation DG', label: 'Validation DG' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }else{
                    this.options = [
                        { value: 'Qualification', label: 'Qualification' },
                        { value: 'Bon a payer', label: 'Bon à payer' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }
            
            case 'Bon a payer':
                if(this.presSousSurveillance==true || this.multiDevise==true|| ((this.montantPEC>this.seuilControle)&& this.seuilControle!=null)){
                    this.options = [
                        { value: 'Bon a payer', label: 'Bon à payer' },
                        { value: 'Validation DG', label: 'Validation DG' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }else{
                    this.options = [
                        { value: 'Bon a payer', label: 'Bon à payer' },
                        { value: 'Mise en paiement', label: 'Mise en paiement' },
                        { value: 'Facture rejetee', label: 'Facture rejetée' }
                    ];
                    break;
                }

            case 'Validation DG':
                this.options = [
                    { value: 'Validation DG', label: 'Validation DG' },
                    { value: 'Mise en paiement', label: 'Mise en paiement' },
                    { value: 'Facture rejetee', label: 'Facture rejetée' }
                ];
                break;

            case 'Mise en paiement':
                this.options = [
                    { value: 'Mise en paiement', label: 'Mise en paiement' }
                ];
                break;
            case 'Echec Paiement':
                this.options = [
                    { value: 'Echec Paiement', label: 'Echec Paiement' }
                ];
                break;
            case 'Facture payee':
                this.options = [
                    { value: 'Facture payee', label: 'Facture payée' },
                    { value: 'Facture refacturee', label: 'Facture refacturée' }
                ];
                break;
            default: this.hide = true;
        };
        console.log('facture end')
    }

    statutRemboursement(){
        console.log('rem start')
        this.hide = false;
        switch(this.status){
            case 'Analyse':
                this.options = [
                    { value: 'Analyse', label: 'Analyse' },
                    { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Remboursement rejete', label: 'Remboursement rejeté' }
                ];
                break;

            case 'En attente demande de pieces':
                this.options = [
                    { value: 'En attente demande de pieces', label: 'En attente demande de pièces' },
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Mise en paiement', label: 'Mise en paiement' },
                    { value: 'Remboursement rejete', label: 'Remboursement rejeté' }
                ];
                break;
            
            case 'Qualification':
                this.options = [
                    { value: 'Qualification', label: 'Qualification' },
                    { value: 'Bon a payer', label: 'Bon à payer' },
                    { value: 'Remboursement rejete', label: 'Remboursement rejeté' }
                ];
                break;
            
            case 'Bon a payer':
                this.options = [
                    { value: 'Bon a payer', label: 'Bon à payer' },
                    { value: 'Mise en paiement', label: 'Mise en paiement' },
                    { value: 'Remboursement rejete', label: 'Remboursement rejeté' }
                ];
                break;
            case 'Mise en paiement':
                this.options = [
                    { value: 'Mise en paiement', label: 'Mise en paiement' },
                ];
                break;
            case 'Echec Paiement':
                this.options = [
                    { value: 'Echec Paiement', label: 'Echec Paiement' }
                ];
                break;
            case 'Rembourse':
                this.options = [
                    { value: 'Rembourse', label: 'Remboursé' },
                    { value: 'Remboursement refacture', label: 'Remboursement refacturé' }
                ];
                break;
            default: this.hide = true;
        };
        console.log('rem end')
    }

    handleChange(event) {
        const stat = event.detail.value
        // let next_stat = (this.jsonData.recName == 'Facture' && ['Bon a payer', 'Mise en paiement'].includes(stat) && this.status != 'Validation DG') ? "Validation DG" : stat
        this.omniApplyCallResp({ "next_status": stat })
    }


  
}