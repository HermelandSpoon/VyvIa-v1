import { LightningElement, api,track } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"
export default class Lwc01DisplayStatusBar extends OmniscriptBaseMixin(LightningElement) {
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
        { API: 'Envoye Ebury', Label: 'Envoyé Ebury' },
        { API: 'Echec Paiement', Label: 'Echec Paiement' },
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
        { API: 'Envoye Ebury', Label: 'Envoyé Ebury' },
        { API: 'Echec Paiement', Label: 'Echec Paiement' },
        { API: 'Rembourse', Label: 'Remboursé' },
        { API: 'Remboursement refacture', Label: 'Remboursement refacturé' },
        { API: 'Remboursement rejete', Label: 'Remboursement rejeté' }
    ];
    @api endpoint = ['Devis rejete', 'Devis valide','Facture refacturee','Facture rejetee', 'Remboursement refacture','Remboursement rejete']

    statusbar = ["current","not yet","not yet","not yet","not yet","not yet","not yet","not yet", "not yet","not yet","not yet"]
    //statusbar;
    @api status;
    @track current = [true,false,false,false,false,false,false,false,false,false,false];
    @track completed =  [false,false,false,false,false,false,false,false,false,false,false];
    @track skip =  [false,false,false,false,false,false,false,false,false,false,false];
    @track not_yet =  [false,true,true,true,true,true,true,true,true,true,true];

    @api prev_status
    @api current_status
    idx_prev
    idx_curr
    is_prev

    @api jsonData;

    connectedCallback(){
        this.jsonData = this.omniJsonData
        console.log('data connected callback: ', JSON.stringify(this.jsonData));
        this.statusbar = JSON.parse(this.jsonData.statusbar);
        console.log('data field parse: ',this.statusbar);

        this.initialiseStatusbar()

        if(this.jsonData.recName == 'Devis' && this.jsonData.FIN_Urgence == false){
            this.status = this.status_devis
        }
        else if(this.jsonData.recName == 'Devis'&& this.jsonData.FIN_Urgence == true){
            this.status = this.status_devis_urgence
        }
        else if(this.jsonData.recName == 'Facture'){
            this.status = this.status_facture
        }
        else{
            this.status = this.status_remboursement
        }

        window.addEventListener('jsondata',this.handleData)
        //window.addEventListener('jsondataNext',this.handleDataNext)
    }

    initialiseStatusbar(){
        this.statusbar.forEach((value, index) => {
            switch(value) {
                case 'current':
                    this.current[index] = true;
                    this.completed[index] = false;
                    this.skip[index] = false;
                    this.not_yet[index] = false;
                    break;
                case 'completed':
                    this.current[index] = false;
                    this.completed[index] = true;
                    this.skip[index] = false;
                    this.not_yet[index] = false;
                    break;
                case 'skip':
                    this.current[index] = false;
                    this.completed[index] = false;
                    this.skip[index] = true;
                    this.not_yet[index] = false;
                    break;
                default:
                    this.current[index] = false;
                    this.completed[index] = false;
                    this.skip[index] = false;
                    this.not_yet[index] = true;
                    break;
            }
        });
    }

    handleData=(event)=>{
        this.jsonData = event.detail.jsonData
        console.log('data: ', JSON.stringify(this.jsonData));

        this.is_prev = this.jsonData.prev;

        this.prev_status = this.jsonData.GLOBAL.Statut;
        //this.prev_status = this.jsonData.GLOBAL.Statut
        this.current_status = this.jsonData.next_status
        
        console.log('previous status: ', this.prev_status);
        console.log('current status: ', this.current_status);

        this.idx_prev = this.status.findIndex(item => item.API == this.prev_status);
        this.idx_curr = this.status.findIndex(item => item.API == this.current_status);

        console.log('previous status index: ', this.idx_prev);
        console.log('current status index: ', this.idx_curr);
        console.log('is_prev:',this.jsonData.prev,this.is_prev);

        if(this.is_prev){
            console.log('test previous is true')
            this.prevStatBar();
        }else{
            console.log('test previous is false')
            this.initialiseData();
        }
        
    }
    prevStatBar(){
        this.current[this.idx_prev] = false;
        this.completed[this.idx_prev] = false;
        this.not_yet[this.idx_prev] = true;
        this.statusbar[this.idx_prev] = 'not yet'

        this.completed[this.idx_prev-1]=false;
        this.skip[this.idx_prev-1]=false;
        this.statusbar[this.idx_prev-1] = 'current'
        console.log('status to go to: ',this.status[this.idx_prev-1].API);
        let updatedData = { 'statusbar': JSON.stringify(this.statusbar),'next_status':this.status[this.idx_prev-1].API};
        // Assign sendData with the updated data
        let sendData = updatedData;
        console.log('data sent: ',sendData);
        this.omniApplyCallResp(sendData);
      
        this.omniNextStep();
    }

    initialiseData(){
        this.current[this.idx_prev] = false;
        this.completed[this.idx_prev] = true
        this.statusbar[this.idx_prev] = 'completed'

        if(this.prev_status!=this.current_status){
            this.not_yet[this.idx_curr] = false
            if(this.endpoint.includes(this.current_status)){
            //if(this.current_status=='Facture rejetee'){
                this.completed[this.idx_curr] = true
                this.statusbar[this.idx_curr] = 'completed'
            }
            else{
                this.current[this.idx_curr] = true
                this.statusbar[this.idx_curr] = 'current'
            }
            if((this.idx_curr-this.idx_prev)>1){
                for (let i = (this.idx_prev + 1); i < this.idx_curr; i++) {
                   this.skip[i] = true
                   this.not_yet[i] = false
                   this.statusbar[i] = 'skip'
                }
            }
        }


        let updatedData = { 'statusbar': JSON.stringify(this.statusbar)};
        // Assign sendData with the updated data
        let sendData = updatedData;
        console.log('data sent: ',sendData);
        this.omniApplyCallResp(sendData);
        // if(count>1){
        this.omniNextStep();
        // }
    }
    
    get combinedArray() {
        return this.status.map((status, index) => ({
            status:status.Label,
            current:this.current[index],
            completed:this.completed[index],
            skip:this.skip[index],
            not_yet:this.not_yet[index]
        }));
    }

}