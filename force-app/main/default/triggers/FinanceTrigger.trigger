/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
trigger FinanceTrigger on facture_devis__c (before update) {
    FinanceTriggerHandler handler = new FinanceTriggerHandler();
    if(Trigger.isBefore){
        if(Trigger.isInsert){
        }else if(Trigger.isUpdate){
            handler.handleBeforeUpdate(Trigger.new);
        }
        
    }
}