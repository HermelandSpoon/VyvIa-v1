// global without sharing class AP02_CloneFinance {
// global without sharing class AP02_CloneFinance implements omnistudio.VlocityOpenInterface{
global without sharing class AP02_CloneFinance {
    public static final String CONTEXT_ID = 'ContextId';
    public static final String ALL_FINANCE_FIELDS='ALD__c, Autre_justificatif__c, Avoir__c, Bon_a_payer_rapide__c, Bon_a_payer_verifie__c, Commentaire_BAP__c, Complement_nuitee__c, Contact__c, Contrevaleur_en_euros_validee_Ebury__c, Contrevaleur_euros__c, Contrevaleur_montant_total_PEC_c__c, ControleManagement__c, CoordonneesBancaire__c, CreatedById, CreatedDate, DateHeure_contrevaleur_euro__c, Date_de_fin_de_GOP__c, Date_de_mise_en_paiement__c, Date_debut_previsionnelle_prestation__c, Date_echeance__c, Date_fin_document_financier__c, Date_fin_previsionnelle_prestation__c, Date_reception_facture__c, Date_taux_change__c, DecisionMedicale__c, Decision_medicale__c, DestinatairePaiementTXT__c, DestinatairePaiement__c, Devise_depense__c, Devise_finance_refacturation__c, Devise_remboursement__c, Duree_du_sejour_couverte__c, Duree_du_sejour_finance__c, Emetteur_facture__c, En_attente_justificatifs__c, Erreur_sync__c, Evenement__c, Facture_Achat__c, Facture_Fournisseur__c, Facture_trait_e__c, Formule__c, Fournisseur_facturation__c, Franchise__c, Garantie__c, GrandCompte__c, Grand_compte__c, Grand_compte_bis__c, Id, Id_paiement__c, IsDeleted, Justificatif_identite__c, Justificatif_medical__c, Justificatifs_attendus__c, Liste_de_moyens__c, Lot_paiement__c, Modalites_de_remboursement__c, ModeleEconomique__c, Montant_copay__c, Montant_initial_en_devises__c, Montant_negociation__c, Montant_pris_en_charge__c, Motif_de_reject__c, Motif_de_rejet_Ebury__c, Name, Nom_facture_devis__c, Nom_recherche_texte__c, Notes_GOP__c, Notes__c, Notes_internes_analyse__c, Nuitee__c, NumeroDevisFacture__c, Numero_du_service__c, OwnerId, Personne__c, Pr_nom_recherche_texte__c, Prestataire_Finance__c, Prestataire_inconnu_checkbox__c, Prestataire_inconnu_text__c, Preuve_de_paiement__c, RIB__c, RecordTypeId, Recours_CNSE__c, Responsable_validation_devis_urgence__c, Sous_type__c, Statut__c, Statut_devis__c, SystemModstamp, TECH_Garantie__c, TECH_ValidationMedical__c, TECH_statusbar__c, Taux_change__c, Taux_de_change_valide_Ebury__c, Taux_prise_charge__c, Type_de_devis__c, Type_de_facture__c, Urgence__c, Visible_pour_le_GC__c, acte_principal__c, acte_secondaire__c, adresse__c, adresse_d_arrivee__c, adresse_de_depart__c, autres_services_medicaux__c, bon_payer__c, commentaire__c, date_d_entree__c, date_de_debut_du_service__c, date_de_fin_de_service__c, date_de_sortie__c, date_du_devis_facture__c, date_du_paiement__c, date_et_heure_facture__c, date_heure_d_arrivee__c, date_heure_de_depart__c, devise_lookup__c, divers__c, duree_du_sejour__c, facture__c, forfait_medical_chirurgical__c, frais_de_bloc_operatoire__c, frais_de_sejour__c, honoraires_acte_chirurgical__c, honoraires_visites_consultations__c, imagerie__c, implants_protheses__c, laboratoire__c, montant_total__c, montant_total_en_euro__c, moyen__c, moyen_du_service__c, pathologie__c, pays_d_arrivee__c, pays_de_depart__c, pharmacie__c, prestataire__c, prestataire_logistique__c, sequence__c, service__c, sous_moyen__c, type_de_facturation__c, type_de_soins__c';

    public static final String ALL_LIGNE_DE_FACTURATION_FIELDS='Contrevaleur_montant_total_PEC__c, Contrevaleur_validee_Ebury__c, Copaiement_devises__c, CreatedById, CreatedDate, Date_heure_taux_change__c, Detail_moyen__c, Detail_moyen_frais_medicaux__c, Devise__c, Franchise_devises__c, Garantie_du_service__c, Id, Montant_total_PEC_devises__c, Montant_total_devises__c, Name, OwnerId, Plafond_devises__c, Pourcentage_PEC__c, Quantite__c, RecordTypeId, SystemModstamp, TECH_Garantie__c, TECH_Moyen__c, Taux_change__c';

    static List<LigneFacturation__c> lstLigne= new List<LigneFacturation__c>();
    static List<ContentDocumentLink> lstContentDocumentLink= new List<ContentDocumentLink>();

    // global Boolean invokeMethod(String methodName, Map<String,Object> inputMap, Map<String,Object> outMap, Map<String,Object> options){
    //     Boolean result = true;
    //     try {
    //         if(!inputMap.isEmpty()){
    //             String oldRecordId=(String)inputMap.get(CONTEXT_ID);
    //             String newRecordId = cloneFinanceAndRelatedItems(oldRecordId);
    //             outMap.put('newRecordId', (String.isNotBlank(newRecordId)?newRecordId:'ERROR'));
    //         }
    //     }catch(Exception e) {
    //         result=false;
    //     }
    //     return result;
    // }

    private final facture_devis__c o;
     public AP02_CloneFinance(ApexPages.StandardController stdController) {
        this.o = (facture_devis__c)stdController.getRecord();
    }
   public PageReference autoRun() {
    // facture_devis__c fac =  (facture_devis__c) controller.getRecord();
    String rId =ApexPages.CurrentPage().getparameters().get('id');
    String newRecord = cloneFinanceAndRelatedItems(rId);
     PageReference pageRef = new PageReference('/' + newRecord);
        pageRef.setRedirect(true);
        return pageRef;
    }


    
   public static String cloneFinanceAndRelatedItems(String oldRecordId){
        String newRecordId = cloneFinance(oldRecordId);
        System.debug('newRecordId'+newRecordId);
        if(String.isNotBlank(newRecordId)){
            cloneLigneDeFacturation(newRecordId,oldRecordId);
            cloneContentDocument(newRecordId,oldRecordId);
        }
        return newRecordId;
    }

    public static String cloneFinance(String oldRecordId){
        String query ='SELECT ' + ALL_FINANCE_FIELDS + ' FROM facture_devis__c  WHERE Id = \'' + oldRecordId + '\'';
        System.debug(query);
        List<facture_devis__c> lstFin = Database.query(query);
        if(lstFin.isEmpty()) return '' ;
        facture_devis__c newFinanceRecord = (facture_devis__c) lstFin[0].clone(false, true);
        newFinanceRecord.Statut__c='Analyse';
        newFinanceRecord.TECH_isCloned__c=true;
        insert newFinanceRecord;
        return newFinanceRecord.Id;
    }

     public static void cloneLigneDeFacturation(String newId, String oldId){
        System.debug('START cloneLigneDeFacturation, oldId:' + oldId+ ' ,newId:'+newId);
        String query='SELECT ' + ALL_LIGNE_DE_FACTURATION_FIELDS + ' FROM LigneFacturation__c WHERE Finance__c = \'' + oldId + '\'';
        System.debug(query);

        List<LigneFacturation__c> lstLigneFac = Database.query(query);
        System.debug(lstLigneFac);
        if(lstLigneFac.isEmpty()) return ;
        for(LigneFacturation__c fac : lstLigneFac){
            LigneFacturation__c currFac = fac.clone(false, true, false, false);
            currFac.Finance__c= newId;
            lstLigne.add(currFac);
        }
        if(!lstLigne.isEmpty()){
            insert lstLigne;
        }
        System.debug('END cloneLigneDeFacturation');

    }


    public static void cloneContentDocument(String newId, String oldId){
        System.debug('START cloneContentDocument');

        List<ContentDocumentLink> lstContentDocOld = [SELECT id,ContentDocumentId,LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: oldId];
        System.debug(lstContentDocOld);
        if(lstContentDocOld.isEmpty()) return;
        for(ContentDocumentLink cnt: lstContentDocOld){
            ContentDocumentLink currCntLink = cnt.clone(false, true, false, false);
            currCntLink.LinkedEntityId= newId;
            lstContentDocumentLink.add(currCntLink);
        }
        if(!lstContentDocumentLink.isEmpty()){
            insert lstContentDocumentLink;
        }
    }
}