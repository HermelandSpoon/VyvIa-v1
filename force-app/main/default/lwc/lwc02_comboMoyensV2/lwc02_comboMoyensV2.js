import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin";
import getGarantieMoyenFromCase from '@salesforce/apex/AP02_Moyen.getGarantieMoyenFromCase';
import getFraisMedicauxGarantieMoyen from '@salesforce/apex/AP02_Moyen.getFraisMedicauxGarantieMoyen';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class Lwc02_comboMoyensV2 extends OmniscriptBaseMixin(LightningElement) {
    @api caseId;
    @api garantieId;
    @api moyenId;
    @api listeDeMoyens;

    // Options for garantie and moyen
    garantieOptions = [];
    moyenOptions = [];

    @api
    garantieValue;
    @api
    moyenValue;

    // Mapping between garantie and moyens
    mapGarantieToMoyens;

    // all garantie options (both frais medicaux and non frais medicaux)
    allGarantie;

    // IDs for frais medicaux garantie and moyen
    fmGarantieId;
    fmMoyenId;

    // Flag to indicate if data has been fetched
    dataFetched;

    // Private variable for sousTypeDeFinance
    _sousTypeDeFinance;

    // Getter and setter for sousTypeDeFinance
    @api
    get sousTypeDeFinance() {
        return this._sousTypeDeFinance;
    }

    set sousTypeDeFinance(value) {
        const old = this._sousTypeDeFinance;
        this._sousTypeDeFinance = value;

        // If sousTypeDeFinance has changed from or to 'Frais Medicaux', reset options
        if (this._sousTypeDeFinance && (this._sousTypeDeFinance == 'Frais Medicaux' || old == 'Frais Medicaux')) {
            this.resetOptions();
        }
        // If data has been fetched, handle change in sousTypeDeFinance
        if (this.dataFetched) {
            this.sousTypeDeFinanceChanged();
        }
    }

    // Error checkers for garantie and moyen
    get GarantieError() {
        return this.garantieId == '' || !this.garantieId
    }

    get MoyenError() {
        if (this._sousTypeDeFinance == '' || this._sousTypeDeFinance == null) {
            return true
        }
        return (this.isSousTypeDeFinanceFraisMedicaux && (this.moyenId == '' || this.moyenId == null)) || (!this.isSousTypeDeFinanceFraisMedicaux && (this.listeDeMoyens == '' || this.listeDeMoyens == null));
    }

    connectedCallback() {
        this.getFraisMedicauxGarantieMoyen()
        this.getGarantieMoyenFromCase()
    }

    getGarantieMoyenFromCase(){
        getGarantieMoyenFromCase({caseId: this.caseId}).then((data)=>{
            const result = JSON.parse(data);
            this.allGarantie = result.options;
            this.mapGarantieToMoyens = result.mapGarantieToMoyenDuServiceOptions;

            // Set a property to indicate that the data has been fetched
            this.dataFetched = true;

            // Call sousTypeDeFinanceChanged if sousTypeDeFinance has been set
            if (this._sousTypeDeFinance !== undefined) {
                this.sousTypeDeFinanceChanged();
            }
        }).catch((error)=>{
            console.error('Error in retrieving garanties: ', error);
        })
    }

    // Check if sousTypeDeFinance is 'Frais Medicaux'
    get isSousTypeDeFinanceFraisMedicaux() {
        return this._sousTypeDeFinance === 'Frais Medicaux';
    }

    // Handle change in sousTypeDeFinance
    sousTypeDeFinanceChanged() {
        if (this.isSousTypeDeFinanceFraisMedicaux) {
            this.handleFraisMedicaux();
        } else if (this._sousTypeDeFinance) {
            this.handleNonFraisMedicaux();
        } else {
            // If sousTypeDeFinance is null, reset options
            this.resetOptions()
        }
    }

    // Reset all options and values
    resetOptions() {
        this.garantieOptions = [];
        this.moyenOptions = [];
        this.garantieId = null;
        this.moyenId = null;
        this.listeDeMoyens = null;
        this.moyenValue = null;

        // Clear all comboboxes
        this.template.querySelectorAll('lightning-combobox').forEach(each => {
            each.value = null;
        });

        // Dispatch events to update flow attributes
        this.dispatchEventFlowAttributeChangeEvent('garantieId', this.garantieId);
        this.dispatchEventFlowAttributeChangeEvent('moyenId', this.moyenId);
        this.dispatchEventFlowAttributeChangeEvent('listeDeMoyens', this.listeDeMoyens);
    }

    // Handle 'Frais Medicaux' sousTypeDeFinance
    handleFraisMedicaux() {
        if (!this.allGarantie) return;
        if (!this.fmGarantieId) return;
        let garantie = this.allGarantie.find(obj => obj.value === this.fmGarantieId);
        if (garantie) {
            this.garantieOptions = [garantie];
            this.garantieValue = garantie.value;
            this.garantieId = garantie.value;

            if (!this.fmMoyenId) return;
            let moyen = this.mapGarantieToMoyens[this.fmGarantieId].find(obj => obj.value === this.fmMoyenId);
            if (moyen) {
                this.moyenOptions = [moyen];
                this.moyenValue = moyen.value;

                this.garantieId = garantie.value;
                this.moyenId = moyen.value;
                this.listeDeMoyens = moyen.label;

                this.dispatchEventFlowAttributeChangeEvent('garantieId', this.garantieId);
                this.dispatchEventFlowAttributeChangeEvent('moyenId', this.moyenId);
                this.dispatchEventFlowAttributeChangeEvent('listeDeMoyens', this.listeDeMoyens);
            }
        } else {
            this.resetOptions();
        }
    }

    // Handle non-'Frais Medicaux' sousTypeDeFinance
    handleNonFraisMedicaux() {
        if (!this.allGarantie) return;
        this.garantieOptions = this.allGarantie.filter(garantie => garantie.value !== this.fmGarantieId);

        if (this.garantieValue && this.garantieValue != this.fmGarantieId) {
            this.garantieId = this.garantieValue

            const moyensOptions = this.mapGarantieToMoyens[this.garantieId];
            this.moyenOptions = moyensOptions;
            // this.moyenOptions = [{ value: this.listeDeMoyens, label: this.listeDeMoyens }]

            // Prefilling part
            this.moyenValue = this.listeDeMoyens

            this.dispatchEventFlowAttributeChangeEvent('garantieId', this.garantieId);
            this.dispatchEventFlowAttributeChangeEvent('listeDeMoyens', this.listeDeMoyens);
        }
    }

    // Dispatch event to update flow attribute
    dispatchEventFlowAttributeChangeEvent(attributeName, attributeValue) {
        const attributeChangeEvent = new FlowAttributeChangeEvent(attributeName, attributeValue);
        this.dispatchEvent(attributeChangeEvent);
    }

    getFraisMedicauxGarantieMoyen(){
        getFraisMedicauxGarantieMoyen({caseId: this.caseId}).then(((data)=>{
            this.fmGarantieId = data.garantieId;
            this.fmMoyenId = data.moyenId;
        })).catch((error)=>{
            console.error('Error in retrieving garanties: ', error);
        })
    }

    // Handle change in garantie
    handleGarantieChange(event) {
        const garantieId = event.detail.value;
        const moyensOptions = this.mapGarantieToMoyens[garantieId];

        this.garantieId = garantieId;
        this.moyenId = null;
        this.listeDeMoyens = null

        this.dispatchEventFlowAttributeChangeEvent('garantieId', this.garantieId);

        if (!this.isSousTypeDeFinanceFraisMedicaux) {
            this.moyenOptions = moyensOptions.filter(moyen => moyen.value !== this.fmMoyenId);

            // let resultingString = this.moyenOptions.map(option => option.label).join(', ');

            // this.moyenOptions = [{ value: resultingString, label: resultingString }];
            // this.moyenValue = resultingString

            // this.listeDeMoyens = resultingString

            this.dispatchEventFlowAttributeChangeEvent('listeDeMoyens', this.listeDeMoyens);

        }
    }

    handleMultiMoyenChange(event) {
        const listeDeMoyens = event.detail.value;
        this.listeDeMoyens = listeDeMoyens;
        this.dispatchEventFlowAttributeChangeEvent('garantieId', this.garantieId);
        this.dispatchEventFlowAttributeChangeEvent('listeDeMoyens', this.listeDeMoyens);
    }
}