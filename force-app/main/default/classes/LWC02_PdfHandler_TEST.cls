@isTest
private class LWC02_PdfHandler_TEST {
    @TestSetup
    static void makeData(){
        EmailMessage testEmail = new EmailMessage(
            Subject = 'Test Email',
            TextBody = 'Test Email'
        );

        insert testEmail;

        ContentVersion testVersion = new ContentVersion(
            VersionData = Blob.valueOf('Test Document'),
            PathOnClient = 'TestDocument.pdf'
        );
        insert testVersion;

        ContentDocumentLink testCdl = new ContentDocumentLink(
            LinkedEntityId = testEmail.Id,
            ContentDocumentId = [
                SELECT ContentDocumentId, Title
                FROM ContentVersion
                WHERE Id = :testVersion.Id
            ].ContentDocumentId
        );
        insert testCdl;
    }

    @isTest
    static void testGetRelatedFiles() {
        Test.startTest();
        EmailMessage actualEmail = [
            SELECT Id
            FROM EmailMessage
            LIMIT 1
        ];

        System.assertNotEquals(
            actualEmail,
            null,
            'Failed to retrieve Email Message'
        );

        List<ContentVersion> actualLstContentVersion =  LWC02_PdfHandler.getRelatedFiles(actualEmail.Id);

        System.assertEquals(
            actualLstContentVersion.size(),
            1,
            'Failed to retrieve the right number of related Files'
        );

        Test.stopTest();
    }

    @isTest
    static void testGetContentDocumentFromVersion() {
        Test.startTest();

        ContentVersion actualVersion = [
            SELECT Id
            FROM ContentVersion
            LIMIT 1
        ];

        System.assertNotEquals(
            actualVersion,
            null,
            'Failed to retrieve Content Version'
        );

        Id actualContentDocumentId = LWC02_PdfHandler.getContentDocumentFromVersion(actualVersion.Id);

        System.assertNotEquals(
            actualContentDocumentId,
            null,
            'Failed to retrieve the associated Content Document Id from the given Content Version'
        );

        Test.stopTest();
    }
}