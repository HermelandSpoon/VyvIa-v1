/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
public with sharing class AP_DatatableUtils_Test {
    
    @testSetup
    static void setupTestData() {
        // Create test data for facture_devis__c with different RecordTypes and Statuses
        List<facture_devis__c> factures = new List<facture_devis__c>();
        
        RecordType rtFacture = [SELECT Id FROM RecordType WHERE Name = 'Facture' LIMIT 1];
        RecordType rtRemboursement = [SELECT Id FROM RecordType WHERE Name = 'Remboursement' LIMIT 1];
        
        factures.add(new facture_devis__c(Name = 'Facture1', Statut__c = 'Mise en paiement', RecordTypeId = rtFacture.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]', ModeleEconomique__c = 'Prestation', Contrevaleur_montant_total_PEC_c__c = 1000, Contrevaleur_en_euros_validee_Ebury__c = 900));
        factures.add(new facture_devis__c(Name = 'Facture2', Statut__c = 'Echec Paiement', RecordTypeId = rtFacture.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]', ModeleEconomique__c = 'Prime', Contrevaleur_montant_total_PEC_c__c = 2000, Contrevaleur_en_euros_validee_Ebury__c = 1800));
        factures.add(new facture_devis__c(Name = 'Remboursement1', Statut__c = 'Mise en paiement', RecordTypeId = rtRemboursement.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]',  ModeleEconomique__c = 'Prestation', Contrevaleur_montant_total_PEC_c__c = 3000, Contrevaleur_en_euros_validee_Ebury__c = 2700));
        factures.add(new facture_devis__c(Name = 'Remboursement2', Statut__c = 'Echec Paiement', RecordTypeId = rtRemboursement.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]',  ModeleEconomique__c = 'Prime', Contrevaleur_montant_total_PEC_c__c = 4000, Contrevaleur_en_euros_validee_Ebury__c = 3600));
        
        
        // Create a test Lot_paiement__c record
        Lot_paiement__c lot = new Lot_paiement__c();
        insert lot;
        Lot_paiement__c lotUp =[SELECT Id from Lot_paiement__c LIMIT 1];
        factures.add(new facture_devis__c(Name = 'Facture3',Lot_paiement__c = lotUp.Id, Statut__c = 'Mise en paiement', RecordTypeId = rtFacture.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]', ModeleEconomique__c = 'Prestation', Contrevaleur_montant_total_PEC_c__c = 1000, Contrevaleur_en_euros_validee_Ebury__c = 900));
        factures.add(new facture_devis__c(Name = 'Facture4', Lot_paiement__c = lotUp.Id,Statut__c = 'Echec Paiement', RecordTypeId = rtFacture.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]', ModeleEconomique__c = 'Prime', Contrevaleur_montant_total_PEC_c__c = 2000, Contrevaleur_en_euros_validee_Ebury__c = 1800));
        factures.add(new facture_devis__c(Name = 'Remboursement3', Lot_paiement__c = lotUp.Id,Statut__c = 'Mise en paiement', RecordTypeId = rtRemboursement.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]',  ModeleEconomique__c = 'Prestation', Contrevaleur_montant_total_PEC_c__c = 3000, Contrevaleur_en_euros_validee_Ebury__c = 2700));
        factures.add(new facture_devis__c(Name = 'Remboursement4',Lot_paiement__c = lotUp.Id, Statut__c = 'Echec Paiement', RecordTypeId = rtRemboursement.Id, TECH_statusbar__c = '["", "", "", "", "", "", "", ""]',  ModeleEconomique__c = 'Prime', Contrevaleur_montant_total_PEC_c__c = 4000, Contrevaleur_en_euros_validee_Ebury__c = 3600));
        insert factures;
        
    }
    
    @isTest
    static void testGetFinance() {
        Map<String, List<String>> mapFilter = new Map<String, List<String>>();
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        List<facture_devis__c> results = AP_DatatableUtils.getFinance(2, 0, '', mapFilter, '', false, null);
        List<facture_devis__c> results1 = AP_DatatableUtils.getFinance(2, 0, '', mapFilter, '', true, lot.Id);
        Test.stopTest();
        
        System.assertNotEquals(results, null, 'Expected non-null results.');
        System.assertEquals(2, results.size(), 'Expected 2 results.');
        System.assertNotEquals(results1, null, 'Expected non-null results.');
        System.assertEquals(2, results1.size(), 'Expected 2 results.');

        
    }
    
    @isTest
    static void testGetNumberFinances() {
        Map<String, List<String>> mapFilter = new Map<String, List<String>>();
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        Integer count = AP_DatatableUtils.getNumberFinances('', mapFilter, '', false, null);
        Integer count1 = AP_DatatableUtils.getNumberFinances('', mapFilter, '', true, lot.Id);
        Test.stopTest();
        
        System.assertNotEquals(count, null, 'Expected non-null count.');
        System.assert(count > 0, 'Expected count greater than 0.');
        System.assertNotEquals(count1, null, 'Expected non-null count.');
        System.assert(count > 0, 'Expected count greater than 0.');
    }
    
    @isTest
    static void testGetAllId() {
        Map<String, List<String>> mapFilter = new Map<String, List<String>>();
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        List<Id> resultIds = AP_DatatableUtils.getAllId('', mapFilter, '', false, null);
        List<Id> resultIds1 = AP_DatatableUtils.getAllId('', mapFilter, '', true, lot.Id);
        Test.stopTest();
        
        System.assertNotEquals(resultIds, null, 'Expected non-null resultIds.');
        System.assert(resultIds.size() > 0, 'Expected more than 0 Ids.');
        System.assertNotEquals(resultIds1, null, 'Expected non-null resultIds.');
        System.assert(resultIds1.size()>0, 'Expected more than 0 Ids.');
    }
    
    @isTest
    static void testUpdateFin() {
        // Fetch some test records
        List<facture_devis__c> factures = [SELECT Id FROM facture_devis__c LIMIT 2];
        Lot_Paiement__c ldp = [SELECT Id FROM Lot_Paiement__c LIMIT 1];
        List<String> factureIds = new List<String>();
        for(facture_devis__c facture : factures) {
            factureIds.add(facture.Id);
        }
        
        Test.startTest();
        AP_DatatableUtils.updateFin(factureIds, ldp.Id, false); // Using a sample recordId

        List<facture_devis__c> updatedFactures = [SELECT Id, Lot_paiement__c FROM facture_devis__c WHERE Id IN :factureIds];
        for(facture_devis__c facture : updatedFactures) {
            System.assertEquals(ldp.Id, facture.Lot_paiement__c, 'Expected Lot_paiement__c to be updated 1.');
        }
        AP_DatatableUtils.updateFin(factureIds, ldp.Id, true); // Using a sample recordId
        Test.stopTest();
        
        List<facture_devis__c> updatedFactures1 = [SELECT Id, Lot_paiement__c FROM facture_devis__c WHERE Id IN :factureIds];
        for(facture_devis__c facture : updatedFactures1) {
            System.assertEquals(null, facture.Lot_paiement__c, 'Expected Lot_paiement__c to be updated 2.');
        }
    }
   
    @isTest
    static void testBuildQuery() {
        Map<String, List<String>> mapFilter = new Map<String, List<String>>();
        mapFilter.put('Statut__c', new List<String>{'Mise en paiement', 'Echec Paiement'});
        mapFilter.put('RecordType.Name', new List<String>{'Facture', 'Remboursement'});

        String searchValue = 'F';
        String baseQuery = 'SELECT Id FROM facture_devis__c WHERE Lot_paiement__c = null';
        String dateFilter = '';

        Test.startTest();
        String builtQuery = AP_DatatableUtils.buildQuery(mapFilter, searchValue, baseQuery, dateFilter);
        Test.stopTest();

        String expectedQueryPart1 = 'SELECT Id FROM facture_devis__c WHERE Lot_paiement__c = null AND Name LIKE \'%F%\'  AND Statut__c IN (\'Mise en paiement\', \'Echec Paiement\') AND RecordType.Name IN (\'Facture\', \'Remboursement\')';
        
        System.assertEquals(expectedQueryPart1.trim(), builtQuery.trim(), 'The built query did not match the expected query.');
    }
    
    @isTest
    static void testSaveTotalAmount() {
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        Double montant1 = 1000.00;
        Double montant2 = 900.00;
        AP_DatatableUtils.saveTotalAmount(lot.Id,montant1,montant2);
        Test.stopTest();
        
        Lot_paiement__c updatedLot = [SELECT Montant_total__c, Montant_total_en_euros_valide__c FROM Lot_paiement__c WHERE Id = :lot.Id];
        System.assertEquals(1000.00, updatedLot.Montant_total__c, 'Expected Montant_total__c to be 1000.0');
        System.assertEquals(900.0, updatedLot.Montant_total_en_euros_valide__c, 'Expected Montant_total_en_euros_valide__c to be 900.0');
    }

    @isTest
    static void testSaveNumberElement() {
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        AP_DatatableUtils.saveNumberElement(lot.Id, 5);
        Test.stopTest();
        
        Lot_paiement__c updatedLot = [SELECT Nombre_elements__c FROM Lot_paiement__c WHERE Id = :lot.Id];
        System.assertEquals(5, updatedLot.Nombre_elements__c, 'Expected Nombre_elements__c to be 5');
    }
    
    @isTest
    static void testSaveFinanceStatus() {
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        Test.startTest();
        AP_DatatableUtils.saveFinanceStatus(lot.Id);
        Test.stopTest();
        
        List<facture_devis__c> updatedFactures = [SELECT Id, Statut__c, TECH_statusbar__c FROM facture_devis__c WHERE Lot_paiement__c =: lot.Id];
        for(facture_devis__c facture : updatedFactures) {
            System.assertEquals('Envoye Ebury', facture.Statut__c, 'Expected Statut__c to be Envoye Ebury');
            // Assert the TECH_statusbar__c has been updated correctly based on the logic in saveFinanceStatus
            System.assert(facture.TECH_statusbar__c.contains('"completed"'), 'Expected TECH_statusbar__c to contain "completed"');
        }
    }

    @isTest
    static void testGetGlobalDataset() {
        Map<String, List<String>> mapFilter = new Map<String, List<String>>();
        Lot_paiement__c lot = [SELECT Id FROM Lot_paiement__c LIMIT 1];
        String searchValue = 'Facture';
        String dateFilter = '';
        Boolean visualisation = false;
        String recordId = lot.Id;
        
        Test.startTest();
        AP_DatatableUtils.GlobalDatasetWrapper result = AP_DatatableUtils.getGlobalDataset(searchValue, mapFilter, dateFilter, visualisation, recordId);
        Test.stopTest();
        
        System.assertNotEquals(result, null, 'Expected non-null GlobalDatasetWrapper result.');
        System.assert(result.totalAmount > 0, 'Expected totalAmount to be greater than 0.');
        System.assert(result.totalValide > 0, 'Expected totalValide to be greater than 0.');
        System.assert(result.Devise != null, 'Expected non-null Devise.');
        System.assert(result.Prestataire != null, 'Expected non-null Prestataire.');
        System.assert(result.TypeFinance != null, 'Expected non-null TypeFinance.');
        System.assert(result.ModeleEconomique != null, 'Expected non-null ModeleEconomique.');
        System.assert(result.Statut != null, 'Expected non-null Statut.');
        System.assert(result.grandCompte != null, 'Expected non-null grandCompte.');
    }
}