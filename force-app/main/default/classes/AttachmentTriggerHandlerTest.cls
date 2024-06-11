/**
 * @description       : 
 * @author            : HBO
 * @group             : 
 * @last modified on  : 2024-05-02
 * @last modified by  : HBO 
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   2024-05-02   HBO   Initial Version
**/
@isTest
public class AttachmentTriggerHandlerTest {
	 @isTest
    static void testAfterInsert() {
        // Récupérer les RecordTypeIds pour Contact, Account et Case
        Id personRecordTypeId = Schema.SObjectType.Contact.getRecordTypeInfosByName().get('Personne').getRecordTypeId();
        Id grandCompteRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Grand compte').getRecordTypeId();
        Id factureRecordTypeId = Schema.SObjectType.facture_devis__c.getRecordTypeInfosByName().get('Devis').getRecordTypeId();
        Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Assistance').getRecordTypeId();
        
        // Créer des données de test
        Contact contact = new Contact(
			FirstName = 'TEST',
            LastName = 'facturation',
            RecordTypeId = personRecordTypeId
        );
        insert contact;
        
        Account account = new Account(
            Name = 'GrandCompte',
            RecordTypeId = grandCompteRecordTypeId
        );
        insert account;
        
        Case cas = new Case(
            personne__c = contact.Id,
            RecordTypeId = caseRecordTypeId
        );
        insert cas;
        
        Facture_Devis__c facture = new Facture_Devis__c(
            personne__c = contact.Id,
            Grand_compte_bis__c = account.Id,
            service__c = cas.Id,
            Name = 'TEST',
            RecordTypeId = factureRecordTypeId
        );
         
        insert facture;
        
        Test.startTest();
        // Activer le déclencheur 
        Attachment attachment = new Attachment(
            ParentId = facture.Id,
            Name = 'TestAttachment.txt',
            Body = Blob.valueOf('Test attachment content')
        ); 
        insert attachment; 
        
        Test.stopTest();
        
    }
}