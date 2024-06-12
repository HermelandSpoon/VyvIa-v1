/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


/**
* @file Name           qsydFileExplorerController.cls
* @description         File Explorer controller class
* @author              Paul Lucas, Jiun Ryu, Elly Zhu, Derrick Vuong
**/
global without sharing class qsydFileExplorerController {

    private static String FILE_EXPLORER_PERMISSION = 'File_Explorer';

    // Items for a specified linked entity
    static Map<String, List<qsyd_Item>> itemMap = new Map<String, List<qsyd_Item>>();
    static SObjectAccessDecision accessDecision;

    /**
     * @description Check if the contextual caller has the "File_Explorer" permission set
     *
     * @return True if the contextual caller has the "File_Explorer" permission set, otherwise return false
     */
    @AuraEnabled
    public static Boolean checkForPermission() {
        Boolean hasLightningFileExplorerPermission = FeatureManagement.checkPermission(FILE_EXPLORER_PERMISSION);

        return hasLightningFileExplorerPermission;
    }

    /**
     * @description Return the latest content version for a given content document
     *
     * @param contentDocumentId
     *
     * @return the latest content version record
     */
    @AuraEnabled(cacheable=true)
    public static String getLatestContentVersion(String contentDocumentId) {
        List<ContentVersion> contentVersionList = new List<ContentVersion>();
        try {
            contentVersionList = [
                    SELECT Id,
                            VersionNumber,
                            ReasonForChange,
                            LastModifiedDate
                    FROM ContentVersion
                    WHERE ContentDocumentId = :contentDocumentId
                    AND IsLatest = TRUE
                    WITH SECURITY_ENFORCED
                    ORDER BY VersionNumber DESC
            ];

            accessDecision = Security.stripInaccessible(AccessType.READABLE, contentVersionList);
            contentVersionList = (List<ContentVersion>) accessDecision.getRecords();

            if (contentVersionList.size() > 0) {
                return JSON.serialize(contentVersionList[0]);
            } else {
                return null;
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e.getMessage());
            System.debug(LoggingLevel.ERROR, e.getStackTraceString());
            return null;
        }
    }

    /**
     * @description Associates content documents with a file explorer folder
     *
     * @param contentDocumentIds A list of content document ids
     * @param folderId A file explorer folder id
     */
    @AuraEnabled
    public static void setFolder(List<Id> contentDocumentIds, String folderId) {
        try {
            List<FileExplorerFile__c> files = [
                    SELECT Id, Folder__c
                    FROM FileExplorerFile__c
                    WHERE ContentDocumentId__c IN :contentDocumentIds
            ];

            accessDecision = Security.stripInaccessible(AccessType.READABLE, files);
            files = (List<FileExplorerFile__c>) accessDecision.getRecords();

            for (FileExplorerFile__c file : files) {
                file.Folder__c = folderId;
            }

            accessDecision = Security.stripInaccessible(AccessType.UPDATABLE, files);
            UPDATE accessDecision.getRecords();
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e.getMessage());
            System.debug(LoggingLevel.ERROR, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Update a file explorer file's tags
     *
     * @param fileId A file explorer file id
     * @param tags A comma delimited list of descriptor tags
     *
     * @return The updated list of tags
     */
    @AuraEnabled
    public static String updateTags(String fileId, String tags) {
        try {
            List<FileExplorerFile__c> files = [
                    SELECT Id, Tags__c
                    FROM FileExplorerFile__c
                    WHERE Id = :fileId
                    // WITH SECURITY_ENFORCED
            ];

            accessDecision = Security.stripInaccessible(AccessType.READABLE, files);
            files = (List<FileExplorerFile__c>) accessDecision.getRecords();

            if (files.size() > 0) {
                files[0].Tags__c = tags;

                accessDecision = Security.stripInaccessible(AccessType.UPDATABLE, files);
                UPDATE accessDecision.getRecords();

                return JSON.serialize(files[0]);
            } else {
                return null;
            }
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e.getMessage());
            System.debug(LoggingLevel.ERROR, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Determine if synchronisation is required
     *
     * @param recordId The id of the contextual record associated to the files
     *
     * @return True if synchronisation is required, otherwise return false
     */
    @AuraEnabled
    public static Boolean checkSyncStatus(String recordId) {
        try {
            Set<Id> recordIds = new Set<Id>();
            recordIds.add(recordId);
            
            // Récupérez les IDs des messages électroniques liés à l'enregistrement
            for (EmailMessage em : [SELECT Id FROM EmailMessage WHERE ParentId = :recordId]) {
                recordIds.add(em.Id);
            }
            
            // Créez une map des ContentDocumentLink basée sur ContentDocumentId
            Map<Id, ContentDocumentLink> documentLinkMap = new Map<Id, ContentDocumentLink>();
            for (ContentDocumentLink link : [SELECT Id, ContentDocumentId FROM ContentDocumentLink WHERE IsDeleted = FALSE AND LinkedEntityId IN :recordIds]) {
                documentLinkMap.put(link.ContentDocumentId, link);
            }
            
            // Créez une map des FileExplorerFile__c basée sur ContentDocumentId__c
            Map<String, FileExplorerFile__c> fileMap = new Map<String, FileExplorerFile__c>();
            for (FileExplorerFile__c file : [SELECT Id, ContentDocumentId__c FROM FileExplorerFile__c WHERE LinkedEntityId__c IN :recordIds]) {
                fileMap.put(file.ContentDocumentId__c, file);
            }
            
            // Parcourez les ContentDocumentLink pour vérifier si les correspondances existent dans les FileExplorerFile__c
            String recordIDNotFound = '';
            boolean isAllExist = true;
            
            for (ContentDocumentLink cnt : documentLinkMap.values()) {
                if (!fileMap.containsKey(cnt.ContentDocumentId)) {
                    isAllExist = false;
                    recordIDNotFound += ',' + cnt.ContentDocumentId;
                }
            }
            
            System.debug('Is recordIDNotFound ' + recordIDNotFound + ' isAllExist ' + isAllExist);
            
            return isAllExist;
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e.getMessage());
            System.debug(LoggingLevel.ERROR, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description Synchronises a records existing content documents with file explorer files
     *
     * @param recordId A content document link id
     *
     * @return A summary of synchronised file explorer files
     */
    @AuraEnabled
    public static String syncFiles(String recordId) {
        List<FileExplorerFile__c> insertFileList = new List<FileExplorerFile__c> ();
        List<FileExplorerFile__c> deleteFileList = new List<FileExplorerFile__c> ();
        List<FileExplorerFile__c> currentFileList = new List<FileExplorerFile__c> ();
        Map<String, FileExplorerFile__c> currentFileMap = new Map<String, FileExplorerFile__c>();
        List<ContentDocumentLink> contentDocumentLinks = new List<ContentDocumentLink>();
        Map<String, ContentDocumentLink> currentContentDocumentMap = new Map<String, ContentDocumentLink>();

        try {

            List<EmailMessage> lstEmailMsg = [SELECT Id FROM EmailMessage WHERE RelatedToId =:recordId];
            
            Set<Id> recordIds = new Set<Id>();
            recordIds.add(recordId);
            for (EmailMessage em : [SELECT Id from EmailMessage WHERE ParentId = :recordId]) {
                recordIds.add(em.Id);
            }

            for (EmailMessage em : lstEmailMsg) {
                recordIds.add(em.Id);
            }

            contentDocumentLinks = new List<ContentDocumentLink>([
                    SELECT ContentDocument.Title,
                            ContentDocument.ContentSize,
                            ContentDocument.FileType,
                            ContentDocument.FileExtension,
                            ContentDocument.IsDeleted,
                            ContentDocument.OwnerId,
                            ContentDocumentId,
                            IsDeleted,
                            LinkedEntityId,
                            ShareType,
                            SystemModstamp,
                            Visibility
                    FROM ContentDocumentLink
                    WHERE ContentDocument.IsDeleted = FALSE
                    AND IsDeleted = FALSE
                    AND LinkedEntityId IN :recordIds
            ]);
            System.debug('#### JPI contentDocumentLinks: ' + contentDocumentLinks);

            currentFileList = [
                    SELECT ContentDocumentId__c
                    FROM FileExplorerFile__c
                    WHERE LinkedEntityId__c IN :recordIds
            ];


            Map<Id, String> mapCaseFacture = new Map<Id, String>();

            List<SObject> lstCase = [
                SELECT Id, Visibilit_PortailGC__c 
                FROM Case 
                WHERE Id IN :recordIds
            ];
            
            List<SObject> lstFacture = [
                SELECT Id, Visible_pour_le_GC__c 
                FROM facture_devis__c 
                WHERE Id IN :recordIds
            ];
            
            for (SObject obj : lstCase) {
                mapCaseFacture.put(obj.Id, (String) obj.get('Visibilit_PortailGC__c'));
            }
            
            for (SObject obj : lstFacture) {
                mapCaseFacture.put(obj.Id, (String) obj.get('Visible_pour_le_GC__c'));
            }

            System.debug('HBO mapCaseFacture --> '+mapCaseFacture);

            accessDecision = Security.stripInaccessible(AccessType.READABLE, currentFileList);
            currentFileList = (List<FileExplorerFile__c>) accessDecision.getRecords();

            for (Integer cfi = 0; cfi < currentFileList.size(); cfi++) {
                currentFileMap.put(currentFileList[cfi].ContentDocumentId__c, currentFileList[cfi]);
            }

            if (!contentDocumentLinks.isEmpty()) {
                System.debug('#### JPI 1');
                accessDecision = Security.stripInaccessible(AccessType.READABLE, contentDocumentLinks);
                contentDocumentLinks = (List<ContentDocumentLink>) accessDecision.getRecords();
                System.debug('#### JPI 1.2: ' + contentDocumentLinks);

                List<ContentDocumentLink> lstCdlksToUpdate = new List<ContentDocumentLink>();

                for (ContentDocumentLink cdl : contentDocumentLinks) {
                    currentContentDocumentMap.put(cdl.ContentDocumentId, cdl);

                    System.debug('#### JPI 1.3: ' + currentFileMap.containsKey(cdl.ContentDocumentId));
                    if (!currentFileMap.containsKey(cdl.ContentDocumentId)) {
                        System.debug('#### JPI 2');
                        FileExplorerFile__c fe = new FileExplorerFile__c();
                        fe.ContentDocumentId__c = cdl.ContentDocumentId;
                        fe.LinkedEntityId__c = recordId;
                        fe.Label__c = cdl.ContentDocument.Title;
                        fe.FileType__c = cdl.ContentDocument.FileType;
                        fe.FileExtension__c = cdl.ContentDocument.FileExtension;
                        fe.FileOwner__c = cdl.ContentDocument.OwnerId;
                        fe.ContentSize__c = cdl.ContentDocument.ContentSize;

                        if(mapCaseFacture.get(recordId) != null){
                            if(cdl.Visibility == 'AllUsers'){
                                List<String> lstNewTag = new List<String>{'Portail Partenaire'};  
                                fe.Tags__c = string.join(lstNewTag,';');
                            } 
                        }else {
                            if(cdl.Visibility == 'AllUsers'){
                                lstCdlksToUpdate.add(new ContentDocumentLink (Id =cdl.Id , Visibility= 'InternalUsers'));
                            } 
                        }

                        insertFileList.add(fe);
                    }
                }

                if(lstCdlksToUpdate.size() > 0){
                    update lstCdlksToUpdate;
                } 

            }
            System.debug('#### JPI recordIds: ' + recordIds);
            System.debug('#### JPI insertFileList 1: ' + insertFileList);

            if (!currentFileMap.isEmpty()) {
                for (String currentFileContentDocumentId : currentFileMap.keySet()) {
                    if (!currentContentDocumentMap.containsKey(currentFileContentDocumentId)) {
                        deleteFileList.add(currentFileMap.get(currentFileContentDocumentId));
                    }
                }
            }
            System.debug('#### JPI insertFileList 2: ' + insertFileList);

            if (Schema.SObjectType.FileExplorerFile__c.isDeletable()) {
                accessDecision = Security.stripInaccessible(AccessType.CREATABLE, insertFileList);
                System.debug('#### JPI accessDecision: ' + accessDecision);
                INSERT accessDecision.getRecords();
                DELETE deleteFileList;
            }

            return 'insertFileList: ' + JSON.serialize(insertFileList) + 'deleteFileList: ' + JSON.serialize(deleteFileList);

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, e.getMessage());
            System.debug(LoggingLevel.ERROR, e.getStackTraceString());
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description True if called from a community context
     *
     * @return True if called from a community context, otherwise return false
     */
    @AuraEnabled
    public static Boolean isCommunity() {
        Id siteId = Site.getSiteId();
        if (siteId != null) {
            return true;
        }
        return false;
    }

    /**
     * @description Get the community prefix, if available
     *
     * @return A community prefix, if available
     */
    @AuraEnabled
    public static String getCommunityPrefix() {
        return !String.isBlank(Site.getPathPrefix()) ? Site.getPathPrefix().removeEndIgnoreCase('/s') : '';
    }

    /**
     * @description Save either a file explorer file or folder
     *
     * @param serializedItem Either a file explorer file or folder instance
     *
     * @return The file explorer item
     */
    @AuraEnabled
    public static String postItem(String serializedItem) {
        qsyd_Item dataItem;
        qsyd_IItem item;

        dataItem = (qsyd_Item) JSON.deserialize(serializedItem, qsyd_Item.class);

        // Concrete objects
        item = (new qsyd_ItemFactory()).newInstance(dataItem.getSubClass());

        item.load(dataItem)
                .convertToCanonical()
                .save();

        return JSON.serialize(item);
    }

    /**
     * @description Delete either a file explorer file or folder
     *
     * @param serializedItem Either a file explorer file or folder instance
     */
    @AuraEnabled
    public static void deleteItem(String serializedItem) {
        qsyd_Item dataItem;
        qsyd_IItem item;

        dataItem = (qsyd_Item) JSON.deserialize(serializedItem, qsyd_Item.class);

        // Concrete objects
        item = (new qsyd_ItemFactory()).newInstance(dataItem.getSubClass());

        item.load(dataItem)
                .convertToCanonical()
                .remove();
    }

    /**
     * @description Retrieve the file explorer files and folder records for a given record
     *
     * @param recordId The record id to retrieve any associated file explorer items
     *
     * @return File explorer files and folders
     */
    @AuraEnabled
    public static String retrieveItemMap(String recordId, String sortParam) {
        System.debug('YMU sortParam : ' + sortParam);
        System.debug('YMU recordId : ' + recordId);
 
        qsyd_FileList files = new qsyd_FileList();
        qsyd_FolderList folders = new qsyd_FolderList();

        itemMap.put(qsyd_File.FILES_KEY, files.retrieve(recordId,sortParam)
                .convertToLogical()
                .getLogicalList());

        itemMap.put(qsyd_Folder.FOLDERS_KEY, folders.retrieve(recordId)
                .convertToLogical()
                .getLogicalList());

        return JSON.serialize(itemMap);
    }

    /**
    * @description  filter all file shared with partner
    * @author HBO | 2022-08-02 
    * @param String recordId 
    * @param String sortParam 
    * @return String 
    **/
    @AuraEnabled
    public static String retrieveItemMapSharedFilter(String recordId, String sortParam){

        qsyd_FileList files = new qsyd_FileList();
        qsyd_FolderList folders = new qsyd_FolderList();
        List<ContentDocumentLink> lstContDocMap = new List<ContentDocumentLink>([select ContentDocumentId, ID, LinkedEntityId, ShareType, Visibility from ContentDocumentLink where LinkedEntityId = :recordId]);
        
        System.debug('HBO --> '+lstContDocMap);

        qsyd_FileList fileqsys = files.retrieve(recordId,sortParam);
        qsyd_FolderList folderqsys = folders.retrieve(recordId);

        Map<ID, FileExplorerFile__c> mapNewFileFilter = new Map<ID, FileExplorerFile__c>();
        Map<ID, FileExplorerFile__c> mapFilExp = fileqsys.fileExplorerFilesMap;

        //filter shared file
        for(Id key: mapFilExp.keySet()){
            FileExplorerFile__c fl = mapFilExp.get(key);
            for(ContentDocumentLink ct : lstContDocMap){
                if(ct.ContentDocumentId == fl.ContentDocumentId__c && ct.Visibility == 'AllUsers'){
                    mapNewFileFilter.put(fl.ID, fl);
                }
            }
 
        }

        fileqsys.fileExplorerFilesMap = mapNewFileFilter;

        //filter folder content shared file
        Map<Id, FileExplorerFolder__c> mapNewFolderFilter = new Map<Id, FileExplorerFolder__c>();
        Map<ID, FileExplorerFolder__c> mapFoldExp = folderqsys.fileExplorerFoldersMap;

        for(ID idFD : mapFoldExp.keySet()){
            for(ID idFILE : fileqsys.fileExplorerFilesMap.keySet()){
                if(idFD != null && idFD == fileqsys.fileExplorerFilesMap.get(idFILE).Folder__c){
                        mapNewFolderFilter.put(idFD, mapFoldExp.get(idFD));
                }
            } 
        }
  
        folderqsys.fileExplorerFoldersMap = mapNewFolderFilter;

        itemMap.put(qsyd_File.FILES_KEY, fileqsys
                .convertToLogical()
                .getLogicalList());

        itemMap.put(qsyd_Folder.FOLDERS_KEY, folderqsys
                .convertToLogical()
                .getLogicalList());
 
        return JSON.serialize(itemMap);

    }    

    /**
     * @description Get a page of folder templates
     *
     * @param filter
     * @param sortBy
     * @param pageSize
     * @param pageOffset
     *
     * @return Folder templates
     */
    @AuraEnabled
    public static String getTemplates(String filter, String sortBy, Integer pageSize, Integer pageOffset) {
        return JSON.serialize(new qsyd_FolderTemplate()
                .retrieveList(filter, sortBy, pageSize, pageOffset));
    }

    /**
     * @description Clone a folder template
     *
     * @param templateId
     * @param entityId
     * @param folderId
     */
    @AuraEnabled
    public static void cloneTemplate(String templateId, String entityId, String folderId) {
        new qsyd_FolderTemplate(templateId, entityId, folderId)
                .isValid()
                .rootFoldersDoNotExist()
                .generate();
    }

    @AuraEnabled
    public static void updateFileName(String fileExpId, String newFileName){
        System.debug('>>fileExpId : ' + fileExpId);
        System.debug('>>newFileName : ' + newFileName);
        // List<ContentDocument> lstContentDoc = [SELECT ContentDocument.Id, Id, Title FROM FileExplorerFile__c WHERE ContentDocument.Id = :fileExpId limit 1];
        FileExplorerFile__c fef = [SELECT ContentDocumentId__c, Id, LinkedEntityId__c, Tags__c FROM FileExplorerFile__c WHERE Id = :fileExpId LIMIT 1];
        ContentDocument contentDoc = [SELECT Id, Title, ParentId FROM ContentDocument WHERE Id = :fef.ContentDocumentId__c LIMIT 1];

        contentDoc.Title = newFileName;	
        update contentDoc;
        
        // if(lstContentDoc.size() > 0){
        //     try{
        //         lstContentDoc[0].Title = newFileName;
        //         update lstContentDoc;
        //     }catch(Exception e){
        //         System.debug('Error Updating');
        //     }
        // }
    }
 
    /**
    * @description update visibility File to partner portail
    * @author HBO | 2022-07-22 
    * @param String fileId 
    * @param boolean isFileVisible 
    * @return string 
    **/
    @AuraEnabled
    public static void shareFileToPartner(String fileId, boolean isFileVisible, String[] ProfilePartner){
        try {
            
        System.debug('>>fileExpId : ' + fileId);
        System.debug('>>fileVisibilityPortail : ' + isFileVisible);
        System.debug('>>ProfilePartner : ' + ProfilePartner);
 
        FileExplorerFile__c fileUp = [select Id, ContentDocumentId__c, LinkedEntityId__c, Tags__c  from FileExplorerFile__c where ID = :fileId LIMIT 1];

        if(fileUp != null){

            List<ContentDocumentLink> lstDocLnk = [SELECT Id, ShareType, Visibility, ContentDocument.LatestPublishedVersionId, ContentDocument.LatestPublishedVersion.ProfilePartner__c
              FROM ContentDocumentLink WHERE contentDocumentId = :fileUp.ContentDocumentId__c AND LinkedEntityId = :fileUp.LinkedEntityId__c];
 			
            if(lstDocLnk.size() <= 0){
                ContentDocumentLink cDocLink = new ContentDocumentLink();
                cDocLink.ContentDocumentId = fileUp.ContentDocumentId__c;//Add ContentDocumentId
                cDocLink.LinkedEntityId = fileUp.LinkedEntityId__c;//Add attachment parentId
                cDocLink.ShareType = 'I';//V - Viewer permission. C - Collaborator permission. I - Inferred permission.
                cDocLink.Visibility = 'InternalUsers';//AllUsers, InternalUsers, SharedUsers
                Insert cDocLink;

                lstDocLnk = [SELECT Id, ShareType, Visibility, ContentDocument.LatestPublishedVersionId, ContentDocument.LatestPublishedVersion.ProfilePartner__c
                FROM ContentDocumentLink WHERE contentDocumentId = :fileUp.ContentDocumentId__c AND LinkedEntityId = :fileUp.LinkedEntityId__c];
            }  
            
            if(lstDocLnk.size() > 0) {

                ContentDocumentLink contDocLnk  = lstDocLnk[0];
                
                if(isFileVisible){
                    contDocLnk.Visibility = 'AllUsers';
                }else {
                    contDocLnk.Visibility = 'InternalUsers';
                }
                
                if (fileUp.Tags__c == null) {
                    fileUp.Tags__c = '';
                }
                
                List<String> lstTags = fileUp.Tags__c.split(';');
                List<String> lstNewTag = new List<String>();
                
                if (isFileVisible) {
                    if (!lstTags.contains('Portail Partenaire')) {
                        lstTags.add('Portail Partenaire');
                    }
                    lstNewTag.addAll(lstTags);
                } else {
                    for (String tag : lstTags) {
                        if (!tag.contains('Portail')) {
                            lstNewTag.add(tag);
                        }
                    }
                }
                
                // Convertir la liste en chaîne
                // lstNewTag.remove(null);
                
                // Déboguer pour vérifier les nouvelles étiquettes
                
                
                // Joindre la liste en une seule chaîne avec un point-virgule
                fileUp.Tags__c = String.join(lstNewTag, String.isBlank(fileUp.Tags__c) ? '' : ';');
                System.debug('##HBO ' +  fileUp.Tags__c);
                
                // Mettre à jour FileExploreFile avec les nouvelles étiquettes
                update fileUp;
                
                
                //Update DocumentContentLink With new value
                system.debug(contDocLnk);
                update contDocLnk;
                
                contentVersion contVersion = new contentVersion();
                contVersion.Id = contDocLnk.ContentDocument.LatestPublishedVersionId;
                contVersion.ProfilePartner__c = string.join(ProfilePartner,';');
                
                System.debug('>>contVersion.Id : ' + contVersion.Id+' '+ProfilePartner);
                
                update contVersion;
                
            }
                
            } 

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
    * @description : delete multiples file in same time
    * @author HBO | 2022-11-29 
    * @param String[] fileIDs 
    * @return boolean 
    **/
    @AuraEnabled
    public static boolean deleteFiles(String[] fileIDs){

        boolean returnValue = false;

        try {
            Set<String> docIds = new Set<String>();
            List<String> shareTypes = new List<String>{'V', 'C'};

            //delete file FileexplorerFile
            List<FileExplorerFile__c> listFileToDelete = [select Id, ContentDocumentId__c, LinkedEntityId__c, Tags__c  from FileExplorerFile__c where ID = :fileIDs ];

            for(FileExplorerFile__c fl : listFileToDelete){
                docIds.add(fl.ContentDocumentId__c);
            } 

            //Delete ContentDocumentLink
            List<ContentDocumentLink> lstContentDocLnk = [SELECT ContentDocument.Id, ContentDocument.Title, 
                                                    LinkedEntityId,
                                                    ContentDocument.CreatedDate,  
                                                    ContentDocument.FileType,
                                                    ShareType
                                                    FROM ContentDocumentLink 
                                                    WHERE ContentDocument.Id In:docIds ];
            // Delete Content Version 
            List<ContentVersion> lstContentVersion = [SELECT Id FROM ContentVersion WHERE ContentDocumentId IN :docIds ];
            

            // Delete Content Document
            List<ContentDocument> lstcontentdocument = [SELECT Id FROM ContentDocument WHERE Id IN:docIds ];

            List<ContentDocumentLink> lstContDocLnkTemp = new List<ContentDocumentLink>();

            for(ContentDocumentLink cdl : lstContentDocLnk){
                if(cdl.ShareType == 'V' ||  cdl.ShareType == 'C'){
                    lstContDocLnkTemp.add(cdl);
                }
            }

            System.debug('##HBO listFileToDelete '+listFileToDelete);
            Delete listFileToDelete;
            System.debug('##HBO lstContentDocLnk '+lstContDocLnkTemp.size());
            Delete lstContDocLnkTemp;
            System.debug('##HBO lstcontentdocument '+lstcontentdocument);
            Delete lstcontentdocument;  
            System.debug('##HBO lstContentVersion '+lstContentVersion.size());
            //Delete lstContentVersion;  
           
            

            //Note - If we delete content document then contentdocumentversion and contentdocumentlink will be deleted automatically.

            returnValue = true;

        } catch (Exception e) {
            System.debug(e);
            throw new AuraHandledException(e.getMessage()); 
        }

        return returnValue;
    }
 
    @AuraEnabled
    public static String moveItemFiles(String[] fileIDs, String folder) {
        List<FileExplorerFile__c> lstFiles = [SELECT ID FROM FileExplorerFile__c WHERE ID IN:fileIDs];

        if(lstFiles.size()>0){
            try {
                List<FileExplorerFile__c> lstFileTemp = new List<FileExplorerFile__c>();
                for(FileExplorerFile__c fl : lstFiles){
                    fl.Folder__c = folder;
                }
                update lstFiles;

                return 'Success';
            }
            catch (Exception ex) {
                throw new AuraHandledException(ex.getMessage());
            }  
        }else {
            return 'Error';
        }
    }
 

    /**
    * @description 
    * @author HBO | 2022-09-22 
    * @return List<String> for all partner profil in picklist  ProfilePartner__c object ContentVersion
    **/
    @AuraEnabled(cacheable=true)
    public static List<String> getListPartnerProfil(){
        List<String> pickListValuesList= new List<String>();
		Schema.DescribeFieldResult fieldResult = ContentVersion.ProfilePartner__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
		for( Schema.PicklistEntry pickListVal : ple){
			pickListValuesList.add(pickListVal.getLabel());
		}   
		return pickListValuesList;
    }

    /**
    * @description 
    * @author HBO | 2022-07-22 
    * @param String fileId 
    * @return boolean true if file is sharing with AllUsers
    **/
    @AuraEnabled
    public static Map<String,object> isFileVisible(String fileId){

        Map<String,object> map_return = new Map<String , Object>();

        FileExplorerFile__c fileUp = [select Id, ContentDocumentId__c, LinkedEntityId__c, Tags__c  from FileExplorerFile__c where ID = :fileId LIMIT 1];
        if(fileUp != null) {
            List<ContentDocumentLink> contDocLnk = [SELECT Id, ShareType, Visibility, ContentDocument.LatestPublishedVersion.ProfilePartner__c
            FROM ContentDocumentLink WHERE contentDocumentId = :fileUp.ContentDocumentId__c AND LinkedEntityId = :fileUp.LinkedEntityId__c limit 1];
            if(contDocLnk.size()> 0){
                String ProfilePartner = contDocLnk[0].ContentDocument.LatestPublishedVersion.ProfilePartner__c;
                system.debug('ProfilePartner '+ProfilePartner);
                map_return.put('ProfilePartner', ProfilePartner);

                if(contDocLnk[0].Visibility.contains('AllUsers')){
                    map_return.put('Visibility', true);
                }else {
                    map_return.put('Visibility', false);
                } 
                return map_return; 
            }else return map_return; 
        }

        return map_return;
    }
    

}