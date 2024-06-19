@isTest
public class AP02_ContactSearchAPI_Test {
    
    @isTest
    private static void getPolicyRecordSuccessTest(){
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        List<AP02_ContactSearchAPI.InputParameter> lstInputParams = new List<AP02_ContactSearchAPI.InputParameter>();
        AP02_ContactSearchAPI.InputParameter testInput = new AP02_ContactSearchAPI.InputParameter();
        testInput.username = 'testUsername';
        testInput.password = 'testPassword';
        testInput.endpointToken = 'https://example.com/token';
        testInput.endpointRecord = 'https://exampleSuccess.com/record';
        testInput.searchCondition = 'test&';
        testInput.xAccessToken = 'xxxxxxxxxxxx';
        testInput.account = 'ACS'; 
        lstInputParams.add(testInput);

        List<List<ContactSearch_API__c>> result = AP02_ContactSearchAPI.getPolicyRecord(lstInputParams);
        Test.stopTest();

        System.assertEquals(1, result.size());
        List<ContactSearch_API__c> lstContactSearch = result[0];
        System.assertEquals(3, lstContactSearch.size());
    }

    @isTest
    private static void getPolicyRecordBadRequestTest(){
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        List<AP02_ContactSearchAPI.InputParameter> lstInputParams = new List<AP02_ContactSearchAPI.InputParameter>();
        AP02_ContactSearchAPI.InputParameter testInput = new AP02_ContactSearchAPI.InputParameter();
        testInput.username = 'testUsername';
        testInput.password = 'testPassword';
        testInput.endpointToken = 'https://example.com/token';
        testInput.endpointRecord = 'https://exampleBadRequest.com/record';
        testInput.searchCondition = 'condition=test';
        testInput.xAccessToken = 'xxxxxxxxxxxx';
        testInput.account = 'ACS';
        lstInputParams.add(testInput);

        List<List<ContactSearch_API__c>> result = AP02_ContactSearchAPI.getPolicyRecord(lstInputParams);
        Test.stopTest();

        System.assertEquals(1, result.size());
        List<ContactSearch_API__c> lstContactSearch = result[0];
        System.assertEquals(0, lstContactSearch.size());
    }

    @isTest
    private static void getPolicyRecordAccessTokenErrorTest(){
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        List<AP02_ContactSearchAPI.InputParameter> lstInputParams = new List<AP02_ContactSearchAPI.InputParameter>();
        AP02_ContactSearchAPI.InputParameter testInput = new AP02_ContactSearchAPI.InputParameter();
        testInput.username = 'testUsername';
        testInput.password = 'testPassword';
        testInput.endpointToken = 'https://example.com';
        testInput.endpointRecord = 'https://exampleBad.com';
        testInput.searchCondition = 'condition=test';
        testInput.xAccessToken = 'xxxxxxxxxxxx';
        testInput.account = 'ACS';
        lstInputParams.add(testInput);

        List<List<ContactSearch_API__c>> result = AP02_ContactSearchAPI.getPolicyRecord(lstInputParams);
        Test.stopTest();

        System.assertEquals(1, result.size());
        List<ContactSearch_API__c> lstContactSearch = result[0];
        System.assertEquals(0, lstContactSearch.size());
    }

    @isTest
    private static void getPolicyRecordMoonshotTest(){
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        List<AP02_ContactSearchAPI.InputParameter> lstInputParams = new List<AP02_ContactSearchAPI.InputParameter>();
        AP02_ContactSearchAPI.InputParameter testInput = new AP02_ContactSearchAPI.InputParameter();
        testInput.username = 'testUsername';
        testInput.password = 'testPassword';
        testInput.endpointToken = 'https://example.com/token';
        testInput.endpointRecord = 'https://exampleMoonshot.com/record';
        testInput.searchCondition = 'condition=moonshot';
        testInput.xAccessToken = 'xxxxxxxxxxxx';
        testInput.account = 'Moonshot';
        lstInputParams.add(testInput);

        List<List<ContactSearch_API__c>> result = AP02_ContactSearchAPI.getPolicyRecord(lstInputParams);
        Test.stopTest();
 
    }

    @isTest
    private static void getPolicyRecordNonACSTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponse());

        List<AP02_ContactSearchAPI.InputParameter> lstInputParams = new List<AP02_ContactSearchAPI.InputParameter>();
        AP02_ContactSearchAPI.InputParameter testInput = new AP02_ContactSearchAPI.InputParameter();
        testInput.username = 'testUsername';
        testInput.password = 'testPassword';
        testInput.endpointToken = 'https://example.com/token';
        testInput.endpointRecord = 'https://exampleNonACS.com/record';
        testInput.searchCondition = 'firstname=John&lastname=Doe&';
        testInput.xAccessToken = 'xxxxxxxxxxxx';
        testInput.account = 'NonACS';
        lstInputParams.add(testInput);

        List<List<ContactSearch_API__c>> result = AP02_ContactSearchAPI.getPolicyRecord(lstInputParams);
        Test.stopTest();

        System.assertEquals(1, result.size());
        List<ContactSearch_API__c> lstContactSearch = result[0];
        System.assertNotEquals(0, lstContactSearch.size());
    }

    private class MockHttpResponse implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HTTPResponse res = new HTTPResponse();
            System.debug('Endpoint: ' + req.getEndpoint());
            if (req.getEndpoint() == 'https://exampleSuccess.com/record?test') {
                res.setHeader('Content-Type', 'application/json');
                res.setStatusCode(200);
                res.setBody('{"count": 2, "results": [{"policy_number": "12345", "subscription_date": "2023-01-01", "start_date": "2023-02-01", "end_date": "2023-03-01", "duration": 30, "destination_zones": "Zone A", "status": "Active",'+
                            '"beneficiaries": [{"firstname": "John", "lastname": "Doe", "date_of_birth": "1990-01-15"}, {"firstname": "Jane", "lastname": "Smith", "date_of_birth": "1985-05-20"}]},'+
                            '{"policy_number": "67890", "subscription_date": "2023-04-01", "start_date": "2023-05-01", "end_date": "2023-06-01", "duration": 45, "destination_zones": "Zone B", "status": "Inactive",'+
                            '"beneficiaries": [{"firstname": "Alice", "lastname": "Johnson", "date_of_birth": "1992-02-10"}]}]}');
            } else if (req.getEndpoint() == 'https://example.com/token') {
                res.setHeader('Content-Type', 'application/json');
                res.setStatusCode(200);
                res.setBody('{"token": "kjsbsbcososjsjsjs"}');
            } else if (req.getEndpoint() == 'https://exampleMoonshot.com/record?condition=moonshot') {
                res.setHeader('Content-Type', 'application/json');
                res.setStatusCode(200);
                res.setBody('{"count": 2, "results": [{"policy_number": "54321", "subscription_date": "2023-01-01", "start_date": "2023-02-01", "end_date": "2023-03-01", "duration": 30, "destination_zones": "Zone X", "status": "Active",'+
                            '"beneficiaries": [{"firstname": "Alice", "lastname": "Doe", "date_of_birth": "1990-01-15"}]},'+
                            '{"policy_number": "09876", "subscription_date": "2023-04-01", "start_date": "2023-05-01", "end_date": "2023-06-01", "duration": 45, "destination_zones": "Zone Y", "status": "Inactive",'+
                            '"beneficiaries": [{"firstname": "Bob", "lastname": "Johnson", "date_of_birth": "1992-02-10"}]}]}');
            } else if (req.getEndpoint().contains('callout:MulesoftAPI/rest/v1/customers')) {
                res.setHeader('Content-Type', 'application/json');
                res.setStatusCode(200);
                res.setBody('{"data": [{"Numero_assure__c": "11111", "Date_debut_de_couverture__c": "2023-01-01", "Date_fin_de_couverture__c": "2023-12-31", "FirstName__c": "John", "LastName__c": "Doe", "Telephone_1__c": "123456789", "Date_de_naissance__c": "1990-01-15"}]}');
            } else {
                res.setStatusCode(400);
            }
            return res;
        }
    }
}