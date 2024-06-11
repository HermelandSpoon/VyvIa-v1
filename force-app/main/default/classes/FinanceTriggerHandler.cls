/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-05-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class FinanceTriggerHandler {
    public FinanceTriggerHandler() {

    }
    public void handleBeforeUpdate(List<facture_devis__c> lstNewFinance){
        List<String> statutTriggered = new List<String>{'Echec Paiement','Facture payee','Rembourse'};
        List<facture_devis__c> lstFinStatut = new List<facture_devis__c>();

        for (facture_devis__c fin : lstNewFinance) {
            if (statutTriggered.contains(fin.Statut__c)) {
                lstFinStatut.add(fin);
            }
        }
        system.debug(lstFinStatut);
        if (!lstFinStatut.isEmpty()) {
            // Your logic here if lstFinStatut is not empty
            AP01_FinanceUtils.saveStatusBar(lstFinStatut);
        }
    }
}