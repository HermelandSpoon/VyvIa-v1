/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-14-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AP02_Moyen {

    static final String SELECTED ='Sélectionné'; 
    static final String UNSELECTED = 'Non Sélectionné';
    // Inner class to represent selectable options in a combo box
    class ComboOption{
        public String label;
        public String value;
        ComboOption(String label, String value){
            this.label = label;
            this.value = value;
        }
    }

    // class GroupedComboOption{
    //     public String groupName;
    //     public List<ComboOption> items;

    //     GroupedComboOption(String groupName){
    //         this.groupName=groupName;
    //         items = new List<ComboOption>();
    //     }
    // }

    // Inner class to encapsulate the response structure
    class Response{
        List<ComboOption> options;
        // Map<Id, List<moyen_du_service__c>> garantieToMoyenDuService;
        Map<Id, List<moyen_garantie__c>> garantieToMoyenDuService;

        // for future
        Map<Id, List<ComboOption>> mapGarantieToMoyenDuServiceOptions;
        //Map<Id, List<GroupedComboOption>> mapGarantieToMoyenDuServiceGroupedOptions;
    }
    

    @AuraEnabled(cacheable=true)
    public static facture_devis__c getFactureInfo(String factureId){
        List<facture_devis__c> lstFacture = [SELECT Statut__c,Garantie__r.Name  FROM facture_devis__c WHERE Id = :factureId];
        if (lstFacture.size()>0){
            return lstFacture[0];
        }
        return null;
    }

    // Retrieves a list of garantie du service options and their corresponding
    // moyen du service based on a given facture ID
    // @AuraEnabled(cacheable=true)
    // public static String getGarantieMoyen(String factureId, Boolean isFacture) {
    //     List<ComboOption> garantieOptions  = new List<ComboOption>();
    //     Map<Id, List<moyen_du_service__c>> mapGarantieToMoyenDuService = new Map<Id, List<moyen_du_service__c>>();
    //     Response resp = new Response();
    //     resp.options = garantieOptions;
    //     resp.garantieToMoyenDuService = mapGarantieToMoyenDuService;

    //     // Retrieve case Id for the given facture 
    //     List<facture_devis__c> factureDevisList = [SELECT service__c FROM facture_devis__c WHERE Id=:factureId AND service__c != ''];
    //     if (factureDevisList.isEmpty()){
    //         return JSON.serialize(resp);
    //     }

    //    // Query for the related case and its associated garanties
    //    List<Case> caseList = new List<Case>();
    //    system.debug('boolean:'+isFacture);
    //    if(isFacture){
    //     caseList = [select id, (select id,name from Garanties_du_service__r WHERE (Name != 'Frais médicaux hospitalier' AND Name != 'Frais médicaux non hospitaliers')), (select Name, garantie__c from moyens_du_service__r WHERE garantie__c!='') from case WHERE Id=:factureDevisList[0].service__c];
    //     system.debug('case true: '+caseList);
    //    }else{

    //        caseList = [select id, (select id,name from Garanties_du_service__r), (select Name, garantie__c from moyens_du_service__r WHERE garantie__c!='') from case WHERE Id=:factureDevisList[0].service__c];
    //        system.debug('case false: '+caseList);
    //     }
    //     if (caseList.isEmpty()){
    //         return JSON.serialize(resp);
    //     }
        
    //     // map garantie name to id
    //     Map <String, Id> mapGarantieNameToId =  new Map<String,Id>();

    //     // Build list to store the IDs of garanties
    //     // Build garantieOptions list
    //     for (garantie_du_service__c garantie : caseList[0].Garanties_du_service__r) {
    //         garantieOptions.add(new ComboOption(garantie.Name,garantie.Id));

    //         // build map
    //         mapGarantieToMoyenDuService.put(garantie.Id, new List<moyen_du_service__c>());
    //         mapGarantieNameToId.put(garantie.Name, garantie.Id);
    //     }
        
    //     // mapGarantieToMoyenDuService
    //     for (moyen_du_service__c moyen : caseList[0].Moyens_du_service__r) {
    //         // if garantie is not related to the case garantie then ignore it
    //         if(mapGarantieNameToId.get(moyen.garantie__c)!=null){
    //             mapGarantieToMoyenDuService.get(mapGarantieNameToId.get(moyen.garantie__c)).add(moyen);
    //         }
    //     }

    //     return JSON.serialize(resp);
    // }

    @AuraEnabled(cacheable=true)
    public static String getGarantieMoyenFromCase(String caseId) {
        List<ComboOption> garantieOptions  = new List<ComboOption>();
        Map<Id, List<ComboOption>> mapGarantieToMoyenDuService = new Map<Id, List<ComboOption>>();
        Response resp = new Response();
        resp.options = garantieOptions;
        resp.mapGarantieToMoyenDuServiceOptions = mapGarantieToMoyenDuService;

       // Query for the related case and its associated garanties
       //List<Case> caseList = [select id, (select id,name from Garanties_du_service__r), (select Name,garantie__c from moyens_du_service__r WHERE garantie__c!='' AND selectionne__c = true) from case WHERE Id=:caseId];
       List<Case> caseList = [select id, (select id,name from Garanties_du_service__r) from case WHERE Id=:caseId];

        if (caseList.isEmpty()){
            return JSON.serialize(resp);
        }
        
        // map garantie name to id
        Map <String, Id> mapGarantieNameToId =  new Map<String,Id>();

        // Build list to store the IDs of garanties
        // Build garantieOptions list
        for (garantie_du_service__c garantie : caseList[0].Garanties_du_service__r) {
            garantieOptions.add(new ComboOption(garantie.Name,garantie.Id));

            // build map
            //mapGarantieToMoyenDuService.put(garantie.Id, new List<ComboOption>());
            mapGarantieNameToId.put(garantie.Name, garantie.Id);
        }
        
        // mapGarantieToMoyenDuService
        // for (moyen_du_service__c moyen : caseList[0].Moyens_du_service__r) {
        //     // if garantie is not related to the case garantie then ignore it
        //     if(mapGarantieNameToId.get(moyen.garantie__c)!=null){
        //         mapGarantieToMoyenDuService.get(mapGarantieNameToId.get(moyen.garantie__c)).add(new ComboOption(moyen.Name, moyen.Id));
        //     }
        // }
        return JSON.serialize(resp);
    }

    @AuraEnabled(cacheable=true)
    public static Map<String,Id> getFraisMedicauxGarantieMoyen(String caseId){
        Map<String,Id> resultMap = new Map<String,Id>();

        List<garantie_du_service__c> garantieList = [SELECT Id, Name FROM garantie_du_service__c WHERE (Name = 'Frais médicaux hospitalier' OR Name = 'Frais médicaux non hospitaliers') AND service__c=:caseId];
        
        if (!garantieList.isEmpty()) {
            system.debug(garantieList);
            //resultMap.put('garantieId', garantieList[0].Id);
            for (garantie_du_service__c gar : garantieList) {
                resultMap.put(gar.Name, gar.Id); 
                system.debug('result map:'+resultMap);
            }
        }

        // List<moyen_du_service__c> moyenList = [SELECT Id, Name FROM moyen_du_service__c WHERE Name = 'Prise en charge frais médicaux' AND service__c=:caseId];
        // if (!moyenList.isEmpty()) {
        //     resultMap.put('moyenId', moyenList[0].Id);
        // }

        return resultMap;
    }

    @AuraEnabled(cacheable=true)
    public static String getGarantieMoyen(String factureId, Boolean isFacture) {
        List<ComboOption> garantieOptions  = new List<ComboOption>();
        Map<Id, List<moyen_garantie__c>> mapGarantieToMoyenDuService = new Map<Id, List<moyen_garantie__c>>();
        Response resp = new Response();
        resp.options = garantieOptions;
        resp.garantieToMoyenDuService = mapGarantieToMoyenDuService;

        // Retrieve case Id for the given facture 
        List<facture_devis__c> factureDevisList = [SELECT service__c FROM facture_devis__c WHERE Id=:factureId AND service__c != ''];
        if (factureDevisList.isEmpty()){
            return JSON.serialize(resp);
        }

       // Query for the related case and its associated garanties
       List<Case> caseList = new List<Case>();
       system.debug('boolean:'+isFacture);
       if(isFacture){
        caseList = [select id, (select name, garanties__c from Garanties_du_service__r WHERE (Name != 'Frais médicaux hospitalier' AND Name != 'Frais médicaux non hospitaliers')) from case WHERE Id=:factureDevisList[0].service__c];
        system.debug('case true: '+caseList);
       }else{
           caseList = [select id, (select name, garanties__c from Garanties_du_service__r) from case WHERE Id=:factureDevisList[0].service__c];
           system.debug('case false: '+caseList);
        }
        if (caseList.isEmpty() || caseList[0]?.Garanties_du_service__r?.isEmpty()){
            return JSON.serialize(resp);
        }
        
        // map garantie name to id
        Map <String, Id> mapGarantieNameToId =  new Map<String,Id>();
        List<Id> garantiesFormuleIdList = new List <Id>();

        // Build list to store the IDs of garanties
        // Build garantieOptions list
        for (garantie_du_service__c garantie : caseList[0].Garanties_du_service__r) {
            garantieOptions.add(new ComboOption(garantie.Name,garantie.Id));

            // build map
            mapGarantieToMoyenDuService.put(garantie.Id, new List<moyen_garantie__c>());
            mapGarantieNameToId.put(garantie.Name, garantie.Id);
            garantiesFormuleIdList.add(garantie.garanties__c);

        }
        
        System.debug('mapGarantieNameToId: ' + mapGarantieNameToId);
        // List<garanties_formule__c> garantiesFormuleList = [SELECT Id, Name, (SELECT Id, Name FROM Moyens__r WHERE inclus_bis__c=true) FROM garanties_formule__c WHERE Id =:mapGarantieNameToId.values()];
        System.debug('mapGarantieNameToId.values(): ' + mapGarantieNameToId.values());
        List <moyen_garantie__c> moyenGarantieList = [SELECT Id, name, garanties__r.Name FROM moyen_garantie__c WHERE garanties__c IN :garantiesFormuleIdList AND inclus_bis__c=true];
        System.debug('moyenGarantieList: ' + moyenGarantieList);
        for (moyen_garantie__c moyen: moyenGarantieList){
            if(mapGarantieNameToId.get(moyen.garanties__r.Name)!=null){
                mapGarantieToMoyenDuService.get(mapGarantieNameToId.get(moyen.garanties__r.Name)).add(moyen);
            }
        }
        // // mapGarantieToMoyenDuService
        // for (moyen_du_service__c moyen : caseList[0].Moyens_du_service__r) {
        //     // if garantie is not related to the case garantie then ignore it
        //     if(mapGarantieNameToId.get(moyen.garantie__c)!=null){
        //         mapGarantieToMoyenDuService.get(mapGarantieNameToId.get(moyen.garantie__c)).add(moyen);
        //     }
        // }

        return JSON.serialize(resp);
    }


}