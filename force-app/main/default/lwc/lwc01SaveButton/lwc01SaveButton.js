import { LightningElement, api,track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"
export default class Lwc01SaveButton extends OmniscriptBaseMixin(LightningElement) {
    @track jsonData
    status
    button = 'Enregistrer'
    endpoint = ['Devis rejete', 'Devis valide','Facture refacturee','Facture rejetee', 'Remboursement refacture','Remboursement rejete']
    //next_step = ['Facture payee', 'Mise en paiement', 'Rembourse', 'En attente validation medicale']
    @track hide = false
    @track prev=false;
    //@track showNext = false;
    connectedCallback(){
        this.jsonData = this.omniJsonData
        this.status = this.jsonData.GLOBAL.Statut;

        console.log('status button lwc: ', this.status);
        if(this.endpoint.includes(this.status)){
            this.hide = true
        }
        // else if(this.next_step.includes(this.status)){
        //     if(this.status=='Mise en paiement'){
        //         if(this.jsonData.recName != 'Facture'){
        //             this.showNext = true
        //             this.button = 'Enregistrer'
        //         }
        //     }else if(this.status=='En attente validation medicale'){
        //         if(this.jsonData.FIN_Urgence == true){
        //             this.showNext = true
        //             this.button = 'Enregistrer'
        //         }
        //     }else{
        //         this.showNext = true
        //         this.button = 'Enregistrer'
        //     }
        // }
    }
    // handleClickNext() {
      
    //     let nextStat;
        
    //     switch (this.status) {
    //         case 'Facture payee':
    //             this.omniApplyCallResp({ "next_status": 'Facture refacturee' });
    //             nextStat = 'Facture refacturee';
    //             break;
    //         case 'Mise en paiement':
    //             this.omniApplyCallResp({ "next_status": 'Rembourse' });
    //             nextStat = 'Rembourse';
    //             break;
    //         case 'Rembourse':
    //             this.omniApplyCallResp({ "next_status": 'Remboursement refacture' });
    //             nextStat = 'Remboursement refacture';
    //             break;
    //         case 'En attente validation medicale':
    //             this.omniApplyCallResp({ "next_status": 'Devis valide' });
    //             nextStat = 'Devis valide';
    //             break;
    //     }
    //     if(nextStat){

    //         this.jsonData = {...this.jsonData,...{
    //             next_status: nextStat
    //         }}
    //         console.log('data in lwc button: ',JSON.stringify(this.jsonData));
    //         const event = new CustomEvent('jsondata',{detail:{jsonData:this.jsonData}, bubbles:true, composed:true});
    //         this.dispatchEvent(event);
    //     }
    // }

    handleClick() {
        this.prev = false
        this.jsonData = this.omniJsonData
        this.omniApplyCallResp({ "prev": this.prev });
        this.jsonData = {...this.jsonData,...{
            prev: this.prev
        }}
        const event = new CustomEvent('jsondata',{detail:{jsonData:this.jsonData}, bubbles:true, composed:true});
        //const event = new CustomEvent('jsondata',{detail:{jsonData:this.omniJsonData}, bubbles:true, composed:true});
        this.dispatchEvent(event);
    }
    handleClickPrev() {
        this.prev = true
        this.jsonData = this.omniJsonData
        this.omniApplyCallResp({ "prev": this.prev });
        this.jsonData = {...this.jsonData,...{
            prev: this.prev
        }}
        const event = new CustomEvent('jsondata',{detail:{jsonData:this.jsonData}, bubbles:true, composed:true});
        //const event = new CustomEvent('jsondata',{detail:{jsonData:this.omniJsonData}, bubbles:true, composed:true});
        this.dispatchEvent(event);
    }
    
}