@isTest
public class AP03_LigneFacturation_TEST {
    static List<LigneFacturation__c> lstLigneFac = new List<LigneFacturation__c>();
    static List<facture_devis__c> lstFac = new List<facture_devis__c>();

    static{
        lstFac.add(new facture_devis__c (
            Name='test facture',
            montant_total__c=0,
            Montant_pris_en_charge__c=0,
            Montant_copay__c=0,
            Contrevaleur_montant_total_PEC_c__c=0
        ));
        insert lstFac;

        lstLigneFac.add(new LigneFacturation__c(
            Name='test ligne de facturation',
            Montant_total_devises__c=10,
            Pourcentage_PEC__c = 10,
            Plafond_devises__c=10,
            Finance__c = lstFac[0].Id
            // Montant_total_PEC_devises__c = 0, // formula field
            // Contrevaleur_montant_total_PEC__c=0 // formula field
        ));
        insert lstLigneFac;
    }

    // Test method for updateLigneDeFacture
    @isTest static void testUpdateLigneDeFacture() {
        // LigneFacturation__c testLine = lstLigneFac[0];
        LigneFacturation__c testLine = [SELECT Id,Finance__c, Plafond_devises__c, Name, Montant_total_devises__c,Pourcentage_PEC__c,Montant_total_PEC_devises__c,Copaiement_devises__c, Contrevaleur_montant_total_PEC__c FROM LigneFacturation__c][0];
        
        // Perform update operation
        testLine.Plafond_devises__c = 1234;
        String jsonString = JSON.serialize(new List<LigneFacturation__c>{testLine});
        Test.startTest();
        AP03_LigneFacturation.updateLigneDeFacture(jsonString);
        Test.stopTest();
        
        // Verify the update
        LigneFacturation__c updatedLine = [SELECT Plafond_devises__c FROM LigneFacturation__c WHERE Id = :testLine.Id];
        System.assertEquals(1234, updatedLine.Plafond_devises__c);
    }

    // Test method for deleteLigneDeFacture
    @isTest static void testDeleteLigneDeFacture() {
        // LigneFacturation__c testLine = lstLigneFac[0];
        LigneFacturation__c testLine = [SELECT Id,Finance__c, Plafond_devises__c, Name, Montant_total_devises__c,Pourcentage_PEC__c,Montant_total_PEC_devises__c,Copaiement_devises__c, Contrevaleur_montant_total_PEC__c FROM LigneFacturation__c][0];
        
        // Perform delete operation
        Test.startTest();
        AP03_LigneFacturation.deleteLigneDeFacture(JSON.serialize(testLine));
        Test.stopTest();
        
        // Verify the delete
        List<LigneFacturation__c> queryResults = [SELECT Id FROM LigneFacturation__c WHERE Id = :testLine.Id];
        System.assertEquals(0, queryResults.size());
    }
}