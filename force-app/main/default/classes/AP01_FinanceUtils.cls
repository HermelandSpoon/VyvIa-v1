/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-05-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AP01_FinanceUtils {
    public static void saveStatusBar(List<facture_devis__c> lstFin){
        for(facture_devis__c fin:lstFin){
            String recName = Schema.SObjectType.facture_devis__c.getRecordTypeInfosById().get(fin.RecordTypeId).getName();
            String inputString = fin.TECH_statusbar__c;
            String[] outputArray = inputString.substring(1, inputString.length() - 1).split(',');
            if(recName =='Facture'){
                if(fin.Statut__c=='Echec Paiement'){
                    outputArray[7] = '"completed"';
                }
                if(fin.Statut__c=='Facture payee'){
                    outputArray[7] = '"skip"';
                    outputArray[8] = '"completed"';
                }

            }else{
                if(fin.Statut__c=='Rembourse'){
                    outputArray[6] = '"skip"';
                    outputArray[7] = '"completed"';
                }
                if(fin.Statut__c=='Echec Paiement'){
                    outputArray[6] = '"completed"';
                }
            }
            
            System.debug('output array in AP'+outputArray);
            String statusbar = '[' +String.join(outputArray, ',')+ ']';
            fin.TECH_statusbar__c = statusbar;
    
        }

    }
}