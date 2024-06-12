/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AP_LotDePaiementUtils {
   
    @AuraEnabled
    public static Lot_paiement__c getLDP(String recordId) {
            // Use bind variable to prevent SOQL injection
            String query = 'SELECT Id, Plafond_autorise__c, Montant_total__c, Montant_total_en_euros_valide__c, Nombre_elements__c, Pret_Refacturation__c, Error_message__c, Statut__c FROM Lot_paiement__c WHERE Id = :recordId LIMIT 1';
            Lot_paiement__c ldp = Database.query(query);
            System.debug(ldp);
            return ldp;
    }
    @AuraEnabled
    public static String savePlafond(String recordId, Double plafondValue) {
        // Your logic to save the plafond value
        Lot_paiement__c ldp = new Lot_paiement__c(
            Id=recordId,
            Plafond_autorise__c = plafondValue
        );
        update ldp;
        // Return a success message or result
        return 'Plafond saved successfully';
    }
    @AuraEnabled
    public static string savePretRefacturation(String recordId, Boolean value){
        // Your logic to save the plafond value
        Lot_paiement__c ldp = new Lot_paiement__c(
            Id=recordId,
            Pret_Refacturation__c = value
        );
        update ldp;
        // Return a success message or result
        return 'Prêt Pour Refacturation saved successfully';
    }
}