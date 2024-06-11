public with sharing class AP02CloneLigneFacturation {
    @InvocableMethod(label='Clone Ligne Facturation' description='Iterate over students, classes and payments and create junction records')
    public static void cloneLigneFacturation(List<InputWrapper> inp){
        String oldDevis = inp.get(0).idDevisToClone;
        String newDevis = inp.get(0).newDevis;
        List<LigneFacturation__c> lstLigne = computeFacturation(newDevis,oldDevis);
        if(!lstLigne.isEmpty()){
            insert lstLigne;
        }
    }

    public static List<LigneFacturation__c> computeFacturation(String newDevis,String oldDevis){
        List<LigneFacturation__c> lstLigne= new List<LigneFacturation__c>();
        for(LigneFacturation__c fac:  [SELECT Contrevaleur_montant_total_PEC__c, Copaiement_devises__c, CreatedById, Date_heure_taux_change__c, Detail_moyen__c, Detail_moyen_frais_medicaux__c, Devise__c, Finance__c, Franchise_devises__c, Garantie_du_service__c, Id, Montant_total_PEC_devises__c, Montant_total_devises__c, Name, OwnerId, Plafond_devises__c, Pourcentage_PEC__c, Quantite__c, RecordTypeId, SystemModstamp, TECH_Garantie__c, TECH_Moyen__c, Taux_change__c FROM LigneFacturation__c WHERE Finance__c =: oldDevis]){
            LigneFacturation__c currFac = fac.clone(false, true, false, false);
            currFac.Finance__c= newDevis;
            lstLigne.add(currFac);
        }

        return lstLigne;
    }

    public class InputWrapper{
        
        @InvocableVariable
        public String idDevisToClone;

        @InvocableVariable
        public String  newDevis;
    }
    
    
}