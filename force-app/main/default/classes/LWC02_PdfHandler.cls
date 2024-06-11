public with sharing class LWC02_PdfHandler {
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getRelatedFiles(Id recordId) {
        List<ContentVersion> lstContentVersions = new List<ContentVersion>();
        Set<Id> setContentDocumentIds = new Set<Id>();

        for (ContentDocumentLink link: [
            SELECT Id, ContentDocumentId
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :recordId
        ]) {
            setContentDocumentIds.add(link.ContentDocumentId);
        }

        if (setContentDocumentIds.size() > 0) {
            lstContentVersions = [
                SELECT Id, Title, VersionDataUrl, ContentDocumentId
                FROM ContentVersion
                WHERE ContentDocumentId IN :setContentDocumentIds
            ];
        }

        return lstContentVersions;
    }

    @AuraEnabled(cacheable=true)
    public static Id getContentDocumentFromVersion(Id contentVersionId){
        try {
            ContentVersion cv = [
                SELECT Id, ContentDocumentId 
                FROM ContentVersion 
                WHERE Id = :contentVersionId 
                LIMIT 1
            ];

            if (cv != null) {
                return cv.ContentDocumentId;
            } else {
                return null; 
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}