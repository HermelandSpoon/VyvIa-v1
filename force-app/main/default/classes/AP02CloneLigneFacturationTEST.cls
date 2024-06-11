@isTest
public with sharing class AP02CloneLigneFacturationTEST {
    static List<facture_devis__c> lstdevis ;
    static List<LigneFacturation__c> lstLigneFac ;

    static{
        lstdevis= new List<facture_devis__c>{
            new facture_devis__c(Name =  'TEST'),
            new facture_devis__c(Name =  'TEST2')
        };
        insert lstdevis;

        lstLigneFac = new List<LigneFacturation__c>{
            new LigneFacturation__c(Name =  'TEST',Finance__c=lstdevis[0].Id),
            new LigneFacturation__c(Name =  'TEST2',Finance__c=lstdevis[0].Id)
        };

        insert lstLigneFac;

    }

    @isTest
    public static void testCloneLigneFacturation(){
        Test.startTest();
        AP02CloneLigneFacturation.InputWrapper inp = new AP02CloneLigneFacturation.InputWrapper();
        inp.idDevisToClone = lstdevis[0].Id;
        inp.newDevis = lstdevis[1].Id;
        List<AP02CloneLigneFacturation.InputWrapper> lstInp = new List<AP02CloneLigneFacturation.InputWrapper>{inp};
        AP02CloneLigneFacturation.cloneLigneFacturation(lstInp);
        Test.stopTest();
    }
}