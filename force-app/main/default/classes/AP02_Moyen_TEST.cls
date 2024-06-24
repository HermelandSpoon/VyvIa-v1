/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-14-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
@isTest
public with sharing class AP02_Moyen_TEST {

    static List<facture_devis__c> lstFac = new List<facture_devis__c>();
    static List<garantie_du_service__c> lstGarantie = new List<garantie_du_service__c>();
    static List<garanties_formule__c> lstGarantieFormula = new List<garanties_formule__c>();
    static List<formule_vyv_ia__c> lstVyvFormula = new List<formule_vyv_ia__c>();
    static List<garantie_referentiel__c> lstgarantieRef = new List<garantie_referentiel__c>();
    static List<Case> lstCase = new List<Case>();
    
    static{        
        lstCase.add(new Case(status='Analyser'));
        insert lstCase;
        lstFac.add(new facture_devis__c(Name =  'TEST',service__c=lstCase[0].Id));
        insert lstFac;
        lstVyvFormula.add(new formule_vyv_ia__c(Name='temp'));
        insert lstVyvFormula;
        lstgarantieRef.add(new garantie_referentiel__c(Name='TEST'));
        insert lstgarantieRef;
        lstGarantieFormula.add(new garanties_formule__c(Name = 'temp',formule__c=lstVyvFormula[0].Id , garantie_referentiel__c =lstgarantieRef[0].Id));
        insert lstGarantieFormula;
        lstGarantie.add(new garantie_du_service__c(service__c=lstCase[0].Id, garanties__c =lstGarantieFormula[0].Id ));
        insert lstGarantie;
    }


    @isTest
    static void testGetGarantieMoyen() {
        test.startTest();
            String factureId = lstFac[0].id;
            String result = AP02_Moyen.getGarantieMoyen(factureId,false);
            System.assertNotEquals(null, result, 'Result should not be null');
        test.stopTest();
    }

    @isTest
    static void testGetFactureInfo() {
        test.startTest();
            String factureId = lstFac[0].id;

            facture_devis__c result = AP02_Moyen.getFactureInfo(factureId);
            System.assertNotEquals(null, result, 'Result should not be null');
        test.stopTest();
    }

    @isTest
    static void testGetGarantieMoyenFromCase(){
        test.startTest();
            String caseId = lstCase[0].Id;
            String result = AP02_Moyen.getGarantieMoyenFromCase(caseId);
            System.assertNotEquals(null, result, 'Result should not be null');
        test.stopTest();
    }

    @isTest
    static void testGetFraisMedicauxGarantieMoyen() {
        // Arrange
        garantie_du_service__c garantie = new garantie_du_service__c(Name = 'Frais médicaux hospitalier');
        insert garantie;
        // moyen_du_service__c moyen = new moyen_du_service__c(Name = 'Prise en charge frais médicaux', );
        // insert moyen;
        String caseId = lstCase[0].Id;
        // Act
        test.startTest();
        Map<String,Id> result = AP02_Moyen.getFraisMedicauxGarantieMoyen(caseId);
        test.stopTest();
    
        // Assert
        System.assertNotEquals(null, result, 'Result should not be null');
        //System.assertEquals(garantie.Id, result.get('garantieId'), 'Garantie ID should match');
        // System.assertEquals(moyen.Id, result.get('moyenId'), 'Moyen ID should match');
    }
}