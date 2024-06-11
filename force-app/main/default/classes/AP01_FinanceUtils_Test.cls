/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
public with sharing class AP01_FinanceUtils_Test {
    @testSetup
    static void setupTestData() {
        Id factureRecordTypeId = Schema.SObjectType.facture_devis__c.getRecordTypeInfosByName().get('Facture').getRecordTypeId();
        Id otherRecordTypeId = Schema.SObjectType.facture_devis__c.getRecordTypeInfosByName().get('Remboursement').getRecordTypeId();
        List<facture_devis__c> testData = new List<facture_devis__c>();
        system.debug(factureRecordTypeId);
        // Create records for 'Facture' record type
        testData.add(new facture_devis__c(
            RecordTypeId = factureRecordTypeId,
            Statut__c = 'Envoye Ebury',
            TECH_statusbar__c = '["", "", "", "", "", "", "", "", ""]'
        ));
        testData.add(new facture_devis__c(
            RecordTypeId = factureRecordTypeId,
            Statut__c = 'Envoye Ebury',
            TECH_statusbar__c = '["", "", "", "", "", "", "", "", ""]'
        ));

        // Create records for other record type
        testData.add(new facture_devis__c(
            RecordTypeId = otherRecordTypeId,
            Statut__c = 'Envoye Ebury',
            TECH_statusbar__c = '["", "", "", "", "", "", "", "", ""]'
        ));
        testData.add(new facture_devis__c(
            RecordTypeId = otherRecordTypeId,
            Statut__c = 'Envoye Ebury',
            TECH_statusbar__c = '["", "", "", "", "", "", "", "", ""]'
        ));

        insert testData;
    }

    @isTest
    static void testSaveStatusBar() {
        List<facture_devis__c> lstFin = [SELECT Id, RecordTypeId, Statut__c, TECH_statusbar__c FROM facture_devis__c];
         // Update records to trigger the before update logic
         for(facture_devis__c fin : lstFin) {
            if(fin.RecordTypeId == Schema.SObjectType.facture_devis__c.getRecordTypeInfosByName().get('Facture').getRecordTypeId()) {
                fin.Statut__c = 'Facture payee';
            } else {
                fin.Statut__c = 'Rembourse';
            }
        }
        lstFin[0].Statut__c = 'Echec Paiement';
        lstFin[2].Statut__c = 'Echec Paiement';
        Test.startTest();
        update(lstFin);
        Test.stopTest();

        // Re-query the records to verify changes
        // lstFin = [SELECT Id, RecordTypeId, Statut__c, TECH_statusbar__c FROM facture_devis__c];

        // for(facture_devis__c fin : lstFin) {
        //     String recName = Schema.SObjectType.facture_devis__c.getRecordTypeInfosById().get(fin.RecordTypeId).getName();
        //     String[] outputArray = fin.TECH_statusbar__c.substring(1, fin.TECH_statusbar__c.length() - 1).split(',');
        //     system.debug('test tech');
        //     system.debug(fin);
        //     system.debug('test array');
        //     system.debug(outputArray);
        //     // if(recName == 'Facture') {
        //     //     if(fin.Statut__c == 'Echec Paiement') {
        //     //         System.assert(outputArray.size()>0, 'Expected more than 0 Ids.');
        //     //     }
        //     //     if(fin.Statut__c == 'Facture payee') {
        //     //         System.assert(outputArray.size()>0, 'Expected more than 0 Ids.');
        //     //     }
        //     // } else {
        //     //     if(fin.Statut__c == 'Rembourse') {
        //     //         System.assert(outputArray.size()>0, 'Expected more than 0 Ids.');
        //     //     }
        //     //     if(fin.Statut__c == 'Echec Paiement') {
        //     //         System.assert(outputArray.size()>0, 'Expected more than 0 Ids.');
        //     //     }
        //     // }
        // }
    }
}