/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 06-06-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class AP_DatatableUtils {
   
    static List<String> lstRecordType = new List<String>{'Remboursement' ,'Facture'};
    static List<String> lstStatut = new List<String>{'Mise en paiement' ,'Echec Paiement'};

    @AuraEnabled
    public static List<facture_devis__c> getFinance(Integer countLimit, Integer offset, String searchValue, Map<String, List<String>> mapFilter, String dateFilter, Boolean visualisation, String recordId){
        //try {
            //String query = 'SELECT Id, Name, Account.Name, Date_echeance__c, StageName, Probability, Amount FROM Opportunity WHERE Visualised__c = ' + visualisation + ' ';
            String query='';
            if(visualisation){
                         query = 'select id, Name, service__r.CaseNumber, Date_reception_facture__c, Montant_pris_en_charge__c, devise_lookup__r.Code_ISO4217__c,Contrevaleur_montant_total_PEC_c__c,Emetteur_facture__r.Name,DestinatairePaiement__r.Name,Date_echeance__c,Date_de_mise_en_paiement__c,GrandCompte__c,Formule__r.Name,ModeleEconomique__c,Statut__c,service__c,devise_lookup__c,Emetteur_facture__c,DestinatairePaiement__c,Formule__c from facture_devis__c where Lot_paiement__c = \''+recordId+ '\' ';
            }
            else{
              
                query = 'select id, Name, service__r.CaseNumber, Date_reception_facture__c, Montant_pris_en_charge__c, devise_lookup__r.Code_ISO4217__c,Contrevaleur_montant_total_PEC_c__c,Emetteur_facture__r.Name,DestinatairePaiement__r.Name,Date_echeance__c,Date_de_mise_en_paiement__c,GrandCompte__c,Formule__r.Name,ModeleEconomique__c,Statut__c,service__c,devise_lookup__c,Emetteur_facture__c,DestinatairePaiement__c,Formule__c from facture_devis__c where Lot_paiement__c = null and (Statut__c =\'Mise en paiement\' or Statut__c =\'Echec Paiement\') and (RecordType.Name=\'Facture\' OR RecordType.Name =\'Remboursement\') ';
                    //  query = 'select id, Name, service__r.CaseNumber, Date_reception_facture__c, Montant_pris_en_charge__c, devise_lookup__r.Code_ISO4217__c,Contrevaleur_montant_total_PEC_c__c,Emetteur_facture__r.Name,DestinatairePaiement__r.Name,Date_echeance__c,Date_de_mise_en_paiement__c,GrandCompte__c,Formule__r.Name,ModeleEconomique__c,Statut__c,service__c,devise_lookup__c,Emetteur_facture__c,DestinatairePaiement__c,Formule__c from facture_devis__c where Lot_paiement__c = null and (Statut__c IN "'+String.join(lstStatut, '","')+') and (RecordType.DeveloperName IN "'+String.join(lstRecordType, '","')+') ';
                     

            }
            query= buildQuery(mapFilter,searchValue,query,dateFilter);

            // if (searchValue != '') {
            //     query = query + ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\' ';
            //     if (filterQuery != '') {
            //         query = query + ' AND ' + filterQuery;
            //     }
            // } else if (filterQuery != '') {
            //     query = query + ' AND ' + filterQuery;
            // }
            // if (dateFilter == 'Passée') query = query + ' AND Date_echeance__c < TODAY ';
            // else if (dateFilter == 'Aujourd\'hui') query = query + ' AND Date_echeance__c = TODAY ';
            // else if (dateFilter == '7 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:7 ';
            // else if (dateFilter == '15 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:15 ';
            // else if (dateFilter == '30 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:30 ';

            return Database.query(query + ' LIMIT ' + countLimit + ' OFFSET ' + offset);
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }

    @AuraEnabled
    public static Integer getNumberFinances(String searchValue, Map<String, List<String>> mapFilter, String dateFilter, Boolean visualisation, String recordId){
        //try {
            system.debug(recordId);
            String query='';
            if(visualisation){

                query = 'select count(id) NumberRows from facture_devis__c where Lot_paiement__c = \''+recordId+ '\' ';
            }
            else{
                query = 'select count(id) NumberRows from facture_devis__c where Lot_paiement__c = null and (Statut__c =\'Mise en paiement\' or Statut__c =\'Echec Paiement\') and (RecordType.Name=\'Facture\' OR RecordType.Name =\'Remboursement\') ';

            }
            query= buildQuery(mapFilter,searchValue, query,dateFilter);

            // if (searchValue != '') {
            //     query = query + ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\' ';
            //     if (filterQuery != '') {
            //         query = query + ' AND ' + filterQuery;
            //     }
            // } else if (filterQuery != '') {
            //     query = query + ' AND '+ filterQuery;
            // }

            // if (dateFilter == 'Passée') query = query + ' AND Date_echeance__c < TODAY ';
            // else if (dateFilter == 'Aujourd\'hui') query = query + ' AND Date_echeance__c = TODAY ';
            // else if (dateFilter == '7 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:7 ';
            // else if (dateFilter == '15 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:15 ';
            // else if (dateFilter == '30 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:30 ';

            system.debug(query);
            return (Integer)Database.query(query)[0].get('NumberRows');
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // } 
    }

    @AuraEnabled
    public static GlobalDatasetWrapper getGlobalDataset(String searchValue, Map<String, List<String>> mapFilter, String dateFilter, Boolean visualisation, String recordId){
        //try {
            String query='';
            if(visualisation){
                query = 'SELECT devise_lookup__r.Code_ISO4217__c, Emetteur_facture__r.Name, RecordType.Name,ModeleEconomique__c, toLabel(Statut__c), Contrevaleur_montant_total_PEC_c__c,Contrevaleur_en_euros_validee_Ebury__c,GrandCompte__c FROM facture_devis__c WHERE Lot_paiement__c = \''+recordId+ '\' ';
            }
            else {
                query = 'SELECT devise_lookup__r.Code_ISO4217__c, Emetteur_facture__r.Name, RecordType.Name,ModeleEconomique__c, toLabel(Statut__c), Contrevaleur_montant_total_PEC_c__c ,Contrevaleur_en_euros_validee_Ebury__c,GrandCompte__c FROM facture_devis__c WHERE Lot_paiement__c = null and (Statut__c =\'Mise en paiement\' or Statut__c =\'Echec Paiement\') and (RecordType.Name=\'Facture\' OR RecordType.Name =\'Remboursement\') ';

            }
            //system.debug(mapFilter);
            query= buildQuery(mapFilter,searchValue,query,dateFilter);

            // if (searchValue != '') {
            //     query = query + ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\' ';
            //     if (filterQuery != '') {
            //         query = query + ' AND ' + filterQuery;
            //     }
            // } else if (filterQuery != '') {
            //     query = query + ' AND '+ filterQuery;
            // }
            // if (dateFilter == 'Passée') query = query + ' AND Date_echeance__c < TODAY ';
            // else if (dateFilter == 'Aujourd\'hui') query = query + ' AND Date_echeance__c = TODAY ';
            // else if (dateFilter == '7 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:7 ';
            // else if (dateFilter == '15 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:15 ';
            // else if (dateFilter == '30 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:30 ';
           
            system.debug(query);

            List<facture_devis__c> lstFinance = Database.query(query);

            //List<Opportunity> lstOpportunity = [SELECT StageName, Account.Name, Amount FROM Opportunity];
            
            GlobalDatasetWrapper wrapper = new GlobalDatasetWrapper();
            wrapper.totalAmount = 0;
            wrapper.totalValide = 0;
            if (!lstFinance.isEmpty()) {
                Set<String> setDevise = new Set<String>();
                Set<String> setPrestataire = new Set<String>();
                Set<String> setTypeFinance = new Set<String>();
                Set<String> setModeleEconomique = new Set<String>();
                Set<String> setGrandCompte = new Set<String>();
                Set<String> setStatut = new Set<String>();
                for (facture_devis__c  fin : lstFinance) {
                    if (fin.devise_lookup__r.Code_ISO4217__c != NULL) setDevise.add(fin.devise_lookup__r.Code_ISO4217__c);
                    if (fin.Emetteur_facture__r.Name != NULL) setPrestataire.add(fin.Emetteur_facture__r.Name);
                    if (fin.RecordType.Name != NULL) setTypeFinance.add(fin.RecordType.Name);
                    if (fin.ModeleEconomique__c != NULL) setModeleEconomique.add(fin.ModeleEconomique__c);
                    if (fin.Statut__c != NULL) setStatut.add(fin.Statut__c);
                    if (fin.GrandCompte__c != NULL) setGrandCompte.add(fin.GrandCompte__c);
                    if (fin.Contrevaleur_montant_total_PEC_c__c != NULL) wrapper.totalAmount += fin.Contrevaleur_montant_total_PEC_c__c;
                    if (fin.Contrevaleur_en_euros_validee_Ebury__c != NULL) wrapper.totalValide += fin.Contrevaleur_en_euros_validee_Ebury__c;
                }
                wrapper.Devise = JSON.serialize(setDevise);
                wrapper.Prestataire = JSON.serialize(setPrestataire);
                wrapper.TypeFinance = JSON.serialize(setTypeFinance);
                wrapper.ModeleEconomique = JSON.serialize(setModeleEconomique);
                wrapper.Statut = JSON.serialize(setStatut);
                wrapper.grandCompte = JSON.serialize(setGrandCompte);
            }
            return wrapper;
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }

    @AuraEnabled
    public static List<Id> getAllId(String searchValue, Map<String, List<String>> mapFilter, String dateFilter, Boolean visualisation, String recordId){
        //try {
            //return new List<Id>(new Map<Id, Opportunity>([SELECT Id FROM Opportunity]).keySet());
            
           // String query = 'SELECT Id FROM  WHERE Visualised__c = ' + visualisation + ' ';
           String query='';
           if(visualisation){
                query = 'SELECT Id FROM facture_devis__c WHERE Lot_paiement__c = \''+recordId+ '\' ';
            }
            else {
                query = 'SELECT Id FROM facture_devis__c WHERE Lot_paiement__c = null and (Statut__c =\'Mise en paiement\' or Statut__c =\'Echec Paiement\') and (RecordType.Name=\'Facture\' OR RecordType.Name =\'Remboursement\') ';

            }
            system.debug(mapFilter);
            query= buildQuery(mapFilter, searchValue,query,dateFilter);

            // if (searchValue != '') {
            //     query = query + ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\' ';
            //     if (filterQuery != '') {
            //         query = query + ' AND ' + filterQuery;
            //     }
            // } else if (filterQuery != '') {
            //     query = query + ' AND '+ filterQuery;
            // }
            // if (dateFilter == 'Passée') query = query + ' AND Date_echeance__c < TODAY ';
            // else if (dateFilter == 'Aujourd\'hui') query = query + ' AND Date_echeance__c = TODAY ';
            // else if (dateFilter == '7 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:7 ';
            // else if (dateFilter == '15 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:15 ';
            // else if (dateFilter == '30 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:30 ';

            query += ' order by Id';

            List<facture_devis__c> lstFinance = Database.query(query);

            List<Id> lstFinId = new List<Id>();

            for (facture_devis__c fin : lstFinance) {
                lstFinId.add(fin.Id);
            } 

            return lstFinId;

        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }

    @AuraEnabled
    public static void updateFin(List<String> lstId, String recordId, Boolean remove ){
        //try {
           
            List<facture_devis__c> lstFin = new List<facture_devis__c>();
            if(remove){
                for (String finId : lstId) {
                    lstFin.add(new facture_devis__c(Id = finId, Lot_paiement__c = null));
                }
            }else{
                for (String finId : lstId) {
                    lstFin.add(new facture_devis__c(Id = finId, Lot_paiement__c = recordId));
                }
            }
          
            update lstFin;
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }

    @AuraEnabled
    public static void saveTotalAmount(String recordId, Double totalAmount, Double totalValide) {
        //try {
            Lot_paiement__c ldp = new Lot_paiement__c(Id = recordId, Montant_total__c = totalAmount, Montant_total_en_euros_valide__c = totalValide);
            
            update ldp;
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }
    @AuraEnabled
    public static void saveNumberElement(String recordId, Integer numberElement) {
        //try {
            Lot_paiement__c ldp = new Lot_paiement__c(Id = recordId, Nombre_elements__c = numberElement);
            
            update ldp;
        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }
    }
    @AuraEnabled
    public static void saveFinanceStatus(String recordId){
        //try {
            String query = 'SELECT Id,RecordType.Name, toLabel(Statut__c),TECH_statusbar__c FROM facture_devis__c WHERE Lot_paiement__c = \''+recordId+ '\' ';
            List<facture_devis__c> lstFinance = Database.query(query);
            system.debug('techbar'+lstFinance);
            List<facture_devis__c> lstFin = new List<facture_devis__c>();
            if (!lstFinance.isEmpty()) {
                for (facture_devis__c  fin : lstFinance) {
                    String inputString = fin.TECH_statusbar__c;
                    String[] outputArray = inputString.substring(1, inputString.length() - 1).split(',');

                    // Trim each element in the array to remove extra spaces and quotes
                    // for(Integer i = 0; i < outputArray.size(); i++) {
                    //     outputArray[i] = outputArray[i].trim().replaceAll('"', '');
                    // }
                    if(fin.RecordType.Name =='Facture'){
                        if(fin.Statut__c=='Mise en Paiement'){
                            outputArray[5] = '"completed"';
                            outputArray[6] = '"completed"';
                        }
                        if(fin.Statut__c=='Echec Paiement'){
                            outputArray[5] = '"completed"';
                            outputArray[6] = '"completed"';
                            outputArray[7] = '"not yet"';
                        }

                    }else{
                        if(fin.Statut__c=='Mise en Paiement'){
                            outputArray[4] = '"completed"';
                            outputArray[5] = '"completed"';
                        }
                        if(fin.Statut__c=='Echec Paiement'){
                            outputArray[4] = '"completed"';
                            outputArray[5] = '"completed"';
                            outputArray[6] = '"not yet"';
                        }
                    }
                    System.debug(outputArray);
                    // String[] quotedArray = new List<String>();
                    // for (String element : outputArray) {
                    //     quotedArray.add('"' + element + '"');
                    // }
                    String statusbar = '[' +String.join(outputArray, ',')+ ']';
                    system.debug(statusbar);
                    lstFin.add(new facture_devis__c(Id = fin.Id, Statut__c = 'Envoye Ebury', TECH_statusbar__c = statusbar));
                }
                update lstFin;
            }

        // } catch (Exception e) {
        //     throw new AuraHandledException(e.getMessage());
        // }

    }

    public class GlobalDatasetWrapper {
        
        @AuraEnabled
        public String Devise;
        @AuraEnabled
        public String Prestataire;
        @AuraEnabled
        public String TypeFinance;
        @AuraEnabled
        public String ModeleEconomique;
        @AuraEnabled
        public String Statut;
        @AuraEnabled
        public Decimal totalAmount;
        @AuraEnabled
        public Decimal totalValide;
        @AuraEnabled
        public String grandCompte;

    }

    public static String buildQuery(Map<String, List<String>> mapFilter,String searchValue ,String query, String dateFilter){
        String filterQuery = '';
            for (String field : mapFilter.keySet()) {
                if (mapFilter.get(field).size() > 0) {
                    if (filterQuery != '') filterQuery += 'AND ';
                    filterQuery = filterQuery + field + ' IN (';
                    for (Integer i = 0; i < mapFilter.get(field).size(); i++) {
                        if (i != 0) filterQuery += ', ';
                        filterQuery = filterQuery + '\'' + String.escapeSingleQuotes(mapFilter.get(field)[i]) + '\''; 
                        if (i == mapFilter.get(field).size() - 1) filterQuery += ') ';
                    }
                }
            }
            if (searchValue != '') {
                query = query + ' AND Name LIKE \'%' + String.escapeSingleQuotes(searchValue) + '%\' ';
                if (filterQuery != '') {
                    query = query + ' AND ' + filterQuery;
                }
            } else if (filterQuery != '') {
                query = query + ' AND '+ filterQuery;
            }

            if (dateFilter == 'Passée') query = query + ' AND Date_echeance__c < TODAY ';
            else if (dateFilter == 'Aujourd\'hui') query = query + ' AND Date_echeance__c = TODAY ';
            else if (dateFilter == '7 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:7 ';
            else if (dateFilter == '15 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:15 ';
            else if (dateFilter == '30 prochains jours') query = query + ' AND Date_echeance__c > TODAY AND Date_echeance__c <= NEXT_N_DAYS:30 ';
        return query;
    }
}