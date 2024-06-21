@isTest

public with sharing class AP02_CloneFinance_TEST {
    static List<facture_devis__c> lstdevis ;
    static List<LigneFacturation__c> lstLigneFac ;
    static List<ContentDocumentLink> lstContentDocumentLinks;

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

        lstContentDocumentLinks = new List<ContentDocumentLink>();
        ContentVersion testContentVersion = new ContentVersion(
            Title = 'Test Content',
            PathOnClient = 'test.txt',
            VersionData = Blob.valueOf('Test Content Data')
        );
        insert testContentVersion;
        // Fetch ContentDocumentId explicitly
        testContentVersion = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :testContentVersion.Id];
        lstContentDocumentLinks.add(new ContentDocumentLink(
            ContentDocumentId = testContentVersion.ContentDocumentId,
            LinkedEntityId = lstdevis[0].Id
        ));
        insert lstContentDocumentLinks;
    }

    @isTest
    public static void cloneFinanceAndRelatedItems(){
        Test.startTest();
        // AP02_CloneFinance FIN =new AP02_CloneFinance();
        // FIN.invokeMethod('',new Map<String, Object>{
        //     'ContextId'=> lstdevis[0].id
        // },new Map<String, Object>{},new Map<String, Object>{}
        // );
        AP02_CloneFinance.cloneFinanceAndRelatedItems(lstdevis[0].id);
        Test.stopTest();
    }
}