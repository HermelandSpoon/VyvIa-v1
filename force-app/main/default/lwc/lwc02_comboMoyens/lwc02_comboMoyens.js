import { LightningElement, wire, api } from 'lwc'
import { OmniscriptBaseMixin } from "omnistudio/omniscriptBaseMixin"

import getGarantieMoyen from '@salesforce/apex/AP02_Moyen.getGarantieMoyen'
import getFactureInfo from '@salesforce/apex/AP02_Moyen.getFactureInfo'

export default class Lwc02_comboMoyens extends OmniscriptBaseMixin(LightningElement) {
  @api contextId

  garantie // garantie to prefill
  statut

  garantieOptions
  mapGarantieToMoyens

  moyensResult

  // connectedCallback() {
  //   if (this.OmniJsonData!=null && this.OmniJsonData.GLOBAL!=null){
  //     this.garantie = this.omniJsonData.GLOBAL.garantie
  //     this.statut = this.omniJsonData.GLOBAL.Statut
  //   }
  // }
  connectedCallback() {
    this.garantie = this.OmniJsonData?.GLOBAL?.garantie ?? null;
    this.statut = this.OmniJsonData?.GLOBAL?.Statut ?? null;
  }


  @wire(getGarantieMoyen, { factureId: '$contextId' })
  wiredGaranties({ error, data }) {
    if (data) {
      const result = JSON.parse(data)
      // console.log('result: ', result)
      this.garantieOptions = result.options
      this.mapGarantieToMoyens = result.garantieToMoyenDuService

      if (this.omniJsonData.selectedGarantieId) {
        const moyens = this.mapGarantieToMoyens[this.omniJsonData.selectedGarantieId]
        if (moyens) {
          this.moyensResult = moyens.map(obj => obj.Name).join(', ')
        } else {
          this.moyensResult = ''
        }
        this.omniApplyCallResp({ "selectedMoyenDuService": this.moyensResult })
        this.omniApplyCallResp({ "selectedMoyenDuServiceArr": moyens })
      }
    } else if (error) {
      console.error('Error in retrieving garanties: ', error)
    }
  }

  handleChange(event) {
    const garantieId = event.detail.value
    const moyens = this.mapGarantieToMoyens[garantieId]
    if (moyens) {
      this.moyensResult = moyens.map(obj => obj.Name).join(', ')
    } else {
      this.moyensResult = ''
    }

    this.omniApplyCallResp({ "selectedGarantieId": garantieId })
    this.omniApplyCallResp({ "selectedMoyenDuService": this.moyensResult })
    this.omniApplyCallResp({ "selectedMoyenDuServiceArr": moyens })
  }

  get disableComboEdit() {
    if (!this.statut) return false
    return this.statut == "Devis rejete"
  }
}