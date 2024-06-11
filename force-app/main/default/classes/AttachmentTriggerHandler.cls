/**
 * @description       : 
 * @author            : HBO
 * @group             : 
 * @last modified on  : 2024-05-02
 * @last modified by  : HBO
 * Modifications Log
 * Ver   Date         Author   Modification
 * 1.0   2024-04-30   HBO   Initial Version
**/
public with sharing class AttachmentTriggerHandler {

    public void afterInsert(List<Attachment> lstAttachmentNew) {
        List<ContentVersion> lstContentVersion = new List<ContentVersion>();
        for (Attachment attachment : lstAttachmentNew) {
            // Vérifier si l'objet est de type finance
            if (attachment.ParentId.getSobjectType() == Facture_Devis__c.SobjectType) {
                lstContentVersion.add(
                    new ContentVersion(
                        Title = attachment.Name,
                        VersionData = attachment.Body,
                        PathOnClient = attachment.Name,
                        FirstPublishLocationId = attachment.ParentId
                    )
                );
            }
        }
        
        // Si la liste des ContentVersions n'est pas vide, insérer les ContentVersions
        if (!lstContentVersion.isEmpty()) {

            System.debug('###Start insert ContentVersion '+ lstContentVersion);

            insert lstContentVersion;

            Set<Id> tempsIdsVersion = new Set<Id>();
            for(ContentVersion ctv : lstContentVersion){
                tempsIdsVersion.add(ctv.id);
            }

            //get Contentdocument
            List<ContentVersion> conDocument = [SELECT Id, ContentDocumentId, FirstPublishLocationId, Title  FROM ContentVersion WHERE Id = :tempsIdsVersion ];
            System.debug('##conDocument '+conDocument); 
            tempsIdsVersion = new Set<Id>();
            for(ContentVersion ctv : conDocument){
                tempsIdsVersion.add(ctv.ContentDocumentId);
            }
            // Créer les ContentDocumentLinks et les enregistrer dans une liste
            List<ContentDocumentLink> contentDocumentLinks = [SELECT Id, ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ContentDocument.FileExtension,  LinkedEntityId, ShareType, Visibility FROM ContentDocumentLink WHERE ContentDocumentId IN:tempsIdsVersion ];        
            
            // Insérer les ContentDocumentLinks si la liste n'est pas vide
            if (!contentDocumentLinks.isEmpty()) {
                
                // Vérifier si le dossier avec le label 'FI' existe sur l'objet 'FileExplorerFolder__c'
                List<FileExplorerFolder__c> lstFolder = [SELECT Id FROM FileExplorerFolder__c WHERE Label__c = 'FI' AND LinkedEntityId__c = :lstAttachmentNew[0].ParentId];
                
                // Si le dossier n'existe pas, le créer
                if (lstFolder.size() == 0) {
                    FileExplorerFolder__c folder = new FileExplorerFolder__c(
                        Label__c = 'FI',
                        LinkedEntityId__c = lstAttachmentNew[0].ParentId 
                    );

                    lstFolder.add(folder);
                    System.debug('###Start insert FileExplorerFolder');
                    insert lstFolder;
                }
                 
                System.debug('##folder '+ lstFolder.size()); 
           
                // Liste pour stocker les enregistrements existants ou à créer
                List<FileExplorerFile__c> fileRecordsToUpdate = new List<FileExplorerFile__c>();

                // Récupérer les enregistrements existants s'ils sont présents
                List<FileExplorerFile__c> existingFileRecords = [SELECT Id, Folder__c FROM FileExplorerFile__c WHERE ContentDocumentId__c IN :tempsIdsVersion AND LinkedEntityId__c = :lstAttachmentNew[0].ParentId];

                // Vérifier si des enregistrements existent
                if(!existingFileRecords.isEmpty()) {
                    // Mettre à jour les enregistrements existants
                    for(FileExplorerFile__c fileRecord : existingFileRecords) { 
                        fileRecord.Folder__c = lstFolder[0].Id; 
                        fileRecordsToUpdate.add(fileRecord);
                    }
                }else {
                    for(ContentDocumentLink link : contentDocumentLinks) {
                        fileRecordsToUpdate.add(
                            new FileExplorerFile__c(
                                Label__c = link.ContentDocument.Title,
                                FileType__c = link.ContentDocument.FileType,
                                FileExtension__c = link.ContentDocument.FileExtension,
                                Folder__c = lstFolder[0].Id,
                                ContentDocumentId__c = link.ContentDocumentId,
                                LinkedEntityId__c = link.LinkedEntityId
                            )
                        );
                    }
                }

                // Mettre à jour ou insérer les enregistrements
                if(!fileRecordsToUpdate.isEmpty()) {
                    upsert fileRecordsToUpdate;
                }
            }
        }
    } 

}