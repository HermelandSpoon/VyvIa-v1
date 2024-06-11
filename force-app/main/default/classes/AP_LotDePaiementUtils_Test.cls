/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
public with sharing class AP_LotDePaiementUtils_Test {
    
    @testSetup
    static void setupTestData() {
        // Create test data for Lot_paiement__c
        Lot_paiement__c ldp = new Lot_paiement__c(
            Plafond_autorise__c = 10000.0,
            Montant_total__c = 5000.0,
            Montant_total_en_euros_valide__c = 4500.0,
            Nombre_elements__c = 10,
            Pret_Refacturation__c = false,
            Error_message__c = ''
        );
        insert ldp;
    }
    
    @isTest
    static void testGetLDP() {
        // Fetch the test record
        Lot_paiement__c ldp = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        
        Test.startTest();
        Lot_paiement__c result = AP_LotDePaiementUtils.getLDP(ldp.Id);
        Test.stopTest();
        
        // Verify the result
        System.assertNotEquals(result, null, 'Expected a valid Lot_paiement__c record.');
        System.assertEquals(ldp.Id, result.Id, 'Expected to fetch the correct Lot_paiement__c record.');
    }
    
    @isTest
    static void testSavePlafond() {
        // Fetch the test record
        Lot_paiement__c ldp = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Double montant = 15000.00;
        Test.startTest();
        String result = AP_LotDePaiementUtils.savePlafond(ldp.Id, montant);
        Test.stopTest();
        
        // Verify the result
        System.assertEquals('Plafond saved successfully', result, 'Expected success message.');
        
        // Verify the update
        Lot_paiement__c updatedLdp = [SELECT Plafond_autorise__c FROM Lot_paiement__c WHERE Id = :ldp.Id];
        System.assertEquals(15000.0, updatedLdp.Plafond_autorise__c, 'Expected Plafond_autorise__c to be updated.');
    }
    
    @isTest
    static void testSavePretRefacturation() {
        // Fetch the test record
        Lot_paiement__c ldp = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        
        Test.startTest();
        String result = AP_LotDePaiementUtils.savePretRefacturation(ldp.Id, true);
        Test.stopTest();
        
        // Verify the result
        System.assertEquals('Prêt Pour Refacturation saved successfully', result, 'Expected success message.');
        
        // Verify the update
        Lot_paiement__c updatedLdp = [SELECT Pret_Refacturation__c FROM Lot_paiement__c WHERE Id = :ldp.Id];
        System.assertEquals(true, updatedLdp.Pret_Refacturation__c, 'Expected Pret_Refacturation__c to be updated.');
    }
}