import { LightningElement, api,track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"
export default class Lwc01NavigateStatusButton extends OmniscriptBaseMixin(LightningElement) {
    status_devis = [
        { API: 'Analyse', Label: 'Analyse' },
        { API: 'En attente demande de pieces', Label: 'En attente demande de pièces' },
        { API: 'En attente validation medicale', Label: 'En attente validation médicale' },
        { API: 'Qualification', Label: 'Qualification' },
        { API: 'Devis valide', Label: 'Devis validé' },
        { API: 'Devis rejete', Label: 'Devis rejeté' }
    ];
    
    status_devis_urgence = [
        { API: 'Analyse', Label: 'Analyse' },
        { API: 'Qualification', Label: 'Qualification' },
        { API: 'En attente validation medicale', Label: 'En attente validation médicale' },
        { API: 'Devis valide', Label: 'Devis validé' },
        { API: 'Devis rejete', Label: 'Devis rejeté' }
    ];
    
    status_facture = [
        { API: 'Analyse', Label: 'Analyse' },
        { API: 'En attente demande de pieces', Label: 'En attente demande de pièces' },
        { API: 'Qualification', Label: 'Qualification' },
        { API: 'Bon a payer', Label: 'Bon à payer' },
        { API: 'Validation DG', Label: 'Validation DG' },
        { API: 'Mise en paiement', Label: 'Mise en paiement' },
        { API: 'Facture payee', Label: 'Facture payée' },
        { API: 'Facture refacturee', Label: 'Facture refacturée' },
        { API: 'Facture rejetee', Label: 'Facture rejetée' }
    ];
    
    status_remboursement = [
        { API: 'Analyse', Label: 'Analyse' },
        { API: 'En attente demande de pieces', Label: 'En attente demande de pièces' },
        { API: 'Qualification', Label: 'Qualification' },
        { API: 'Bon a payer', Label: 'Bon à payer' },
        { API: 'Mise en paiement', Label: 'Mise en paiement' },
        { API: 'Rembourse', Label: 'Rembourse' },
        { API: 'Remboursement refacture', Label: 'Remboursement refacturé' },
        { API: 'Remboursement rejete', Label: 'Remboursement rejeté' }
    ];
   
    @api allStatus;
    @track jsonData
    status
    button = 'Enregistrer'
    endpoint = ['Devis rejete', 'Devis valide','Facture refacturee','Facture rejetee', 'Remboursement refacture','Remboursement rejete']
    @track hide = false
    @api prev_status
    @api current_status
    idx_prev
    idx_curr

    connectedCallback(){
        this.jsonData = this.omniJsonData
        this.status = this.jsonData.GLOBAL.Statut;
        
        console.log('status button lwc: ', this.status);
        if(this.endpoint.includes(this.status)){
            this.hide = true
        }
        if(this.jsonData.recName == 'Devis' && this.jsonData.FIN_Urgence == false){
            this.allStatus = this.status_devis
        }
        else if(this.jsonData.recName == 'Devis'&& this.jsonData.FIN_Urgence == true){
            this.allStatus = this.status_devis_urgence
        }
        else if(this.jsonData.recName == 'Facture'){
            this.allStatus = this.status_facture
        }
        else{
            this.allStatus = this.status_remboursement
        }
    }

    handleClick() {
        this.jsonData = this.omniJsonData
        console.log('data: ', JSON.stringify(this.jsonData));
    
        this.prev_status = this.jsonData.GLOBAL.Statut;
        this.current_status = this.jsonData.next_status
        
        console.log('previous status: ', this.prev_status);
        console.log('current status: ', this.current_status);
    
        this.idx_prev = this.allStatus.findIndex(item => item.API == this.prev_status);
        this.idx_curr = this.allStatus.findIndex(item => item.API == this.current_status);
    
        console.log('previous status index: ', this.idx_prev);
        console.log('current status index: ', this.idx_curr);

        for(let i = 0; i < (this.idx_curr - this.idx_prev); i++) {
            this.omniNextStep();
        }
        
    }
    handleClickPrev() {
       this.omniPrevStep();
    }
}