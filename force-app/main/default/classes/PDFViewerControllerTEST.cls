@isTest
public with sharing class PDFViewerControllerTEST {
    static List<ContentVersion> lstContentVersion =new List<ContentVersion>();

    static{
        lstContentVersion.add(new ContentVersion(Title = 'test',PathOnClient='test.png',IsMajorVersion = true, origin ='H',VersionData = Blob.valueOf('Test Content')));
        insert lstContentVersion;
    }


    @isTest
    public static void testPDFViewerController() {
        Test.startTest();
            PDFViewerController.getRelatedFilesByRecordId(UserInfo.getUserId());
        Test.stopTest();
    }
}