/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 04-04-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class PDFViewerController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getRelatedFilesByRecordId(String recordId) {
        Map<String, Object> mapContentDoc= new Map<String, Object>();
        List<ContentDocumentLink> files = [SELECT ContentDocumentId, ContentDocument.Title,ContentDocument.FileExtension,ContentDocument.LatestPublishedVersionId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId ];
        if(files.isEmpty()){return mapContentDoc;}

        for (ContentDocumentLink doc : files) {
            if(!mapContentDoc.containsKey(doc.ContentDocument.LatestPublishedVersionId)){               
                mapContentDoc.put(doc.ContentDocument.LatestPublishedVersionId, new Map<String, String>{
                    'Id' =>  doc.Id ,
                    'Title' =>  doc.ContentDocument.Title ,
                    'FileExtension' =>  doc.ContentDocument.FileExtension,
                    'ContentDocumentId' =>  doc.ContentDocumentId 
                
                });
            }
        }

        return mapContentDoc;
    }
}