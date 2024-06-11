public with sharing class AP03_LigneFacturation {
    // Method to update LigneFacturation__c records
    @AuraEnabled
    public static void updateLigneDeFacture(String lignesToUpdate) {
        // Deserialize the string back into a list of LigneFacturation__c records
        List<LigneFacturation__c> recordsToUpdate = (List<LigneFacturation__c>) JSON.deserialize(lignesToUpdate, List<LigneFacturation__c>.class);
        
        Decimal montantTotal = 0;
        Decimal montantTotalPEC = 0;
        Decimal copaiement = 0;
        Decimal contrevaleurPEC = 0;

        for (LigneFacturation__c ligneFac : recordsToUpdate) {
            if(ligneFac.Montant_total_devises__c != null) {
                montantTotal += ligneFac.Montant_total_devises__c;
            }
            if(ligneFac.Plafond_devises__c != null && ligneFac.Pourcentage_PEC__c != null) {
                montantTotalPEC += ligneFac.Plafond_devises__c/100 * ligneFac.Pourcentage_PEC__c;
            }
            if(ligneFac.Copaiement_devises__c != null) {
                copaiement += ligneFac.Copaiement_devises__c;
            }
            if(ligneFac.Contrevaleur_montant_total_PEC__c != null) {
                contrevaleurPEC += ligneFac.Contrevaleur_montant_total_PEC__c;
            }
        }

        if(recordsToUpdate[0].Finance__c != null){
            facture_devis__c fin = new facture_devis__c(
                Id = recordsToUpdate[0].Finance__c,
                montant_total__c = montantTotal,
                Montant_pris_en_charge__c = montantTotalPEC,
                Montant_copay__c = copaiement,
                Contrevaleur_montant_total_PEC_c__c = contrevaleurPEC
            );
            update fin;
        }
        update recordsToUpdate;
    }

    // Method to delete LigneFacturation__c records
    @AuraEnabled
    public static void deleteLigneDeFacture(String ligneToDelete) {
        // Deserialize the string back into a list of LigneFacturation__c records
        LigneFacturation__c ligneFac = (LigneFacturation__c) JSON.deserialize(ligneToDelete, LigneFacturation__c.class);

        List<facture_devis__c> fin = [
            SELECT Id, montant_total__c, Montant_pris_en_charge__c, Montant_copay__c,Contrevaleur_montant_total_PEC_c__c
            FROM facture_devis__c
            WHERE Id=:ligneFac.Finance__c
        ];

        if (!fin.isEmpty()){
            if(ligneFac.Montant_total_devises__c != null) {
                fin[0].montant_total__c -= ligneFac.Montant_total_devises__c;
            }
            if(ligneFac.Plafond_devises__c != null && ligneFac.Pourcentage_PEC__c != null) {
                fin[0].Montant_pris_en_charge__c -= ligneFac.Plafond_devises__c/100 * ligneFac.Pourcentage_PEC__c;
            }
            if(ligneFac.Copaiement_devises__c != null) {
                fin[0].Montant_copay__c -= ligneFac.Copaiement_devises__c;
            }
            if(ligneFac.Contrevaleur_montant_total_PEC__c != null) {
                fin[0].Contrevaleur_montant_total_PEC_c__c -= ligneFac.Contrevaleur_montant_total_PEC__c;
            }
            update fin;
        }
       
        delete ligneFac;
    }
}