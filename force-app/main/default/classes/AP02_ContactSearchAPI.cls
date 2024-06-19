/**
 * @description       : 
 * @author            : HBO
 * @group             : 
 * @last modified on  : 2024-06-19
 * @last modified by  : HBO
 * Modifications Log
 * Ver   Date         Author   Modification
 * 2.0   2023-04-25   HBO   Initial Version
**/
public class AP02_ContactSearchAPI {
    @InvocableMethod(label='Contact Search API')
    public static List<List<ContactSearch_API__c>> getPolicyRecord(List<InputParameter> inputParameters) {
        List<ContactSearch_API__c> policyRecords = new List<ContactSearch_API__c>();

        InputParameter inputParameter = inputParameters[0];
        String account = inputParameter.account;
        String username = inputParameter.username;
        String password = inputParameter.password;
        String endpointToken = inputParameter.endpointToken;
        String endpointRecord = inputParameter.endpointRecord;
        String searchCondition = inputParameter.searchCondition;
        String xAccessToken = inputParameter.xAccessToken;
        
        if (account == 'ACS') {
            try {  
                HttpRequest req = new HttpRequest();
                req.setEndpoint(endpointToken);
                req.setMethod('POST');
                req.setHeader('Content-Type', 'application/json');
                req.setBody('{"username":"' + username + '","password":"' + password + '"}');
                
                HTTP http = new HTTP();
                HTTPResponse res = http.send(req);
                
                if (res.getStatusCode() == 200) {
                    Map<String, Object> responseMap = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
                    String token = (String)responseMap.get('token');
                    System.debug('Token: ' + token);
                     
        
                    //remove & at the end of string
                    if (searchCondition.endsWith('&')) {
                        searchCondition = searchCondition.substring(0, searchCondition.length() - 1);
                    }
        
                    endpointRecord = endpointRecord+'?' + searchCondition;
        
                    System.debug('URL --> '+endpointRecord);
                
                    HttpRequest req2 = new HttpRequest();
                    req2.setEndpoint(endpointRecord);
                    req2.setMethod('GET');
                    req2.setHeader('Authorization', 'Bearer '+token);
                    req2.setHeader('X-Access-Token', xAccessToken); 
                    
                    HTTP http2 = new HTTP();
                    HTTPResponse res2 = http2.send(req2);
                    
                    if (res2.getStatusCode() == 200) { 
        
                        System.debug('res2.getStatusCode() '+res2.getBody());
        
                        Map<String, Object> responseMap2 = (Map<String, Object>)JSON.deserializeUntyped(res2.getBody());
                     
                        Integer count = (Integer)responseMap2.get('count');
                        List<Object> results = (List<Object>)responseMap2.get('results');
                        
                        for (Object result : results) {
                            Map<String, Object> resultMap = (Map<String, Object>)result;
                            
                            List<Object> beneficiaries = (List<Object>)resultMap.get('beneficiaries');
                            if (beneficiaries.size() > 0) {
                                for(Object beneficiary : beneficiaries){
                                        
                                        Map<String, Object> beneficiaryMap = (Map<String, Object>)beneficiary;
                                        ContactSearch_API__c policyRecord = new ContactSearch_API__c();
                                        policyRecord.PolicyNumber__c = String.valueOf(resultMap.get('policy_number'));
                                        policyRecord.SubscriptionDate__c = Date.valueOf((String)resultMap.get('subscription_date'));
                                        policyRecord.StartDate__c = Date.valueOf((String)resultMap.get('start_date'));
                                        policyRecord.EndDate__c = Date.valueOf((String)resultMap.get('end_date'));
                                        //policyRecord.Duration__c = Integer.valueOf( resultMap.get('duration'));
                                        policyRecord.DestinationZones__c = String.valueOf(resultMap.get('destination_zones'));
                                        policyRecord.Status__c = String.valueOf(resultMap.get('status'));   
                                        policyRecord.FirstName__c = String.valueOf(beneficiaryMap.get('firstname'));
                                        policyRecord.LastName__c = String.valueOf(beneficiaryMap.get('lastname'));
                                        policyRecord.Produit__c = String.valueOf(resultMap.get('product'));
                                        policyRecord.PhoneNumber__c = String.valueOf(resultMap.get('phone_number'));
                                        policyRecord.dateOfBirth__c = Date.valueOf((String)beneficiaryMap.get('date_of_birth')); 
                                    	policyRecord.Subscribe__c = String.valueOf(beneficiaryMap.get('firstname'))+' '+String.valueOf(beneficiaryMap.get('lastname'));
                                        System.debug('###--> '+String.valueOf(beneficiaryMap.get('product')));
                                        policyRecords.add(policyRecord);
                                    } 
                                    
                            }
        
                        }
                         
                        return new List<List<ContactSearch_API__c>>{policyRecords};
        
                    } else {
                        System.debug('Error getting record. Status code: ' + res2.getStatusCode() + '. Response body: ' + res2.getBody());
                        return new List<List<ContactSearch_API__c>>{policyRecords};
                    }
                
                    
                } else {
                    System.debug('Error getting token. Status code: ' + res.getStatusCode() + '. Response body: ' + res.getBody());
                    return new List<List<ContactSearch_API__c>>{policyRecords};
        
                }
			}catch (Exception ex) {
                //throw ex; 
                //System.debug('Exception: ' + ex.getMessage());
                return new List<List<ContactSearch_API__c>>();
            }
        } else {
            
            String clientId = inputParameter.username;
            String clientSecret = inputParameter.password;
    
            // Remplacer les termes dans la chaîne searchCondition
            searchCondition = searchCondition.replace('code', 'policy_id');
            searchCondition = searchCondition.replace('firstname', 'first_name');
            searchCondition = searchCondition.replace('lastname', 'last_name');
            searchCondition = searchCondition.replace('birthdate', 'birth_date');
            System.debug('account searchCondition '+account+'&'+searchCondition);
            // Créer une instance de HttpRequest 
            HttpRequest req = new HttpRequest();
            req.setEndpoint('callout:MulesoftAPI/rest/v1/customers?account='+account+'&'+searchCondition);
            req.setMethod('GET');
            req.setHeader('client_id', '{!$Credential.MulesoftIntegration.client_id}');
            req.setHeader('client_secret', '{!$Credential.MulesoftIntegration.client_secret}');
             
            System.debug('URL '+req.getEndpoint());
            
            Http http = new Http();
            HttpResponse response = http.send(req);
            
            System.debug('result '+response.getBody());
            
            if (response.getStatusCode() == 200) {
                Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                List<Object> customerDataList = (List<Object>) result.get('data');
                 
                for (Object resultTemp : customerDataList) {
                    Map<String, Object> resultMap = (Map<String, Object>) resultTemp;
                    ContactSearch_API__c policyRecord = new ContactSearch_API__c();
                    
                    // Si la valeur est null, ajoutez null directement au champ
                    policyRecord.PolicyNumber__c = resultMap.get('Numero_assure__c') != null ? String.valueOf(resultMap.get('Numero_assure__c')) : null;
                    policyRecord.SubscriptionDate__c = resultMap.get('Date_debut_de_couverture__c') != null ? Date.valueOf((String) resultMap.get('Date_debut_de_couverture__c')) : null;
                    policyRecord.StartDate__c = policyRecord.SubscriptionDate__c;
                    policyRecord.EndDate__c = resultMap.get('Date_fin_de_couverture__c') != null ? Date.valueOf((String) resultMap.get('Date_fin_de_couverture__c')) : null;
                    policyRecord.Status__c = policyRecord.EndDate__c != null && policyRecord.EndDate__c < Date.today() ?   'Unpaid' : 'Paid';
                    policyRecord.FirstName__c = resultMap.get('FirstName__c') != null ? String.valueOf(resultMap.get('FirstName__c')) : null;
                    policyRecord.LastName__c = resultMap.get('LastName__c') != null ? String.valueOf(resultMap.get('LastName__c')) : null;
                    policyRecord.PhoneNumber__c = resultMap.get('Telephone_1__c') != null ? String.valueOf(resultMap.get('Telephone_1__c')) : null;
                    policyRecord.dateOfBirth__c = resultMap.get('Date_de_naissance__c') != null ? Date.valueOf((String) resultMap.get('Date_de_naissance__c')) : null;
                    policyRecord.Produit__c = resultMap.get('Clef_technique__c') != null ? String.valueOf((String) resultMap.get('Clef_technique__c')) : null;
                    policyRecord.Subscribe__c = resultMap.get('Subscribe__c') != null ? String.valueOf((String) resultMap.get('Subscribe__c')) : null;
                    policyRecords.add(policyRecord);
                }

                return new List<List<ContactSearch_API__c>>{ policyRecords };
              } else {
                  System.debug('Error getting record. Status code: ' + response.getStatusCode() + '. Response body: ' + response.getBody());
                  return new List<List<ContactSearch_API__c>>();
              }
            
        }
         
    }

    public class InputParameter {
        @InvocableVariable(required=true label='User Name API') public String username;
        @InvocableVariable(required=true label='Password API') public String password;
        @InvocableVariable(required=true label='Endpoint for Token') public String endpointToken;
        @InvocableVariable(required=true label='Endpoint for search Record') public String endpointRecord;
        @InvocableVariable(required=true label='Condition') public String searchCondition;
        @InvocableVariable(label='X Access Token') public String xAccessToken;
        @InvocableVariable(required=true label='Account') public String account; 
    }
}