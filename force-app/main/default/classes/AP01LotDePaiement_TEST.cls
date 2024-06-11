@isTest
public with sharing class AP01LotDePaiement_TEST {
    static List<Lot_paiement__c> lstPaiement;
    static{
        lstPaiement= new List<Lot_paiement__c>{
            new Lot_paiement__c(Statut__c='Envoye Ebury')
        };
        insert lstPaiement;
    }

    @isTest
    public static void testClasses(){
        Test.startTest();
        AP01LotDePaiement.getPicklistValue('Lot_paiement__c','Statut__c');
        AP01LotDePaiement.updateRecord(lstPaiement[0].Id, 'Confirmation');
        AP01LotDePaiement.getReportUrl();
        Test.stopTest();
    }
}