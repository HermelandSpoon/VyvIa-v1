public with sharing class AP01LotDePaiement {
   @AuraEnabled(Cacheable=true)
    public static List<PicklistWrapper> getPicklistValue(String objectName, String fieldName) {
        List<PicklistWrapper> lstPicklist = new List<PicklistWrapper>();
        Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
        for (Schema.PicklistEntry pickListVal : fieldResult.getPicklistValues()) {
            lstPicklist.add(new PicklistWrapper(pickListVal.getLabel(), pickListVal.getValue()));
        }
        return lstPicklist;
    }

    private class PicklistWrapper{
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;
        public PicklistWrapper(String label, String value){
            this.label = label;
            this.value = value;
        }
    }

    @AuraEnabled(Cacheable=false)
    public static void updateRecord(String rId, String stat){
        List<Lot_paiement__c> lstLotPaiement = new List<Lot_paiement__c>{
            new Lot_paiement__c(id = rId,Statut__c=stat)
        };
        if(!lstLotPaiement.isEmpty()) update lstLotPaiement;
    }


    @AuraEnabled
    public static string getReportUrl(){
        List<Report> lstReport = [SELECT id from Report WHERE DeveloperName= 'Rapport_re_facturation_GC'];
        if(lstReport.isEmpty()) return '';
        return lstReport[0]?.id;
        
    }
}