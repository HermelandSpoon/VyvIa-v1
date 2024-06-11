let definition =
      {"states":[{"fields":[],"conditions":{"id":"state-condition-object","isParent":true,"group":[]},"definedActions":{"actions":[]},"name":"Active","isSmartAction":false,"smartAction":{},"styleObject":{"padding":[{"type":"around","size":"x-small","label":"around:x-small"}],"margin":[{"type":"bottom","size":"x-small","label":"bottom:x-small"}],"container":{"class":"slds-card"},"size":{"isResponsive":false,"default":"12"},"sizeClass":"slds-size_12-of-12 ","class":"slds-card slds-p-around_x-small slds-m-bottom_x-small ","background":{"color":"","image":"","size":"","repeat":"","position":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{},"text":{"align":"","color":""},"inlineStyle":"","style":"      \n         "},"components":{"layer-0":{"children":[{"name":"Text","element":"outputField","size":{"isResponsive":false,"default":"12"},"stateIndex":0,"class":"slds-col ","property":{"record":"{record}","mergeField":"","card":"{card}"},"type":"text","styleObject":{"sizeClass":"slds-size_12-of-12 ","size":{"isResponsive":false,"default":"12"}},"elementLabel":"Text-0"},{"name":"Datatable","element":"flexDatatable","size":{"isResponsive":false,"default":"12"},"stateIndex":0,"class":"slds-col ","property":{"record":"{record}","card":"{card}","issearchavailable":false,"issortavailable":true,"styles":{"cellMargin":[],"cellPadding":[]},"cellLevelEdit":false,"pagelimit":"5","groupOrder":"desc","rowLevelEdit":true,"pagesize":"4","groupBy":"","sortAcrossGroups":true,"hideExtraColumn":false,"userSelectableRow":false,"data-conditions":{"id":"state-condition-object","isParent":true,"group":[{"id":"state-new-condition-30","field":"RecordType.Name","operator":"==","value":"Frais médicaux","type":"custom","hasMergeField":false},{"id":"state-new-condition-37","field":"Finance__r.RecordType.Name","operator":"!=","value":"Remboursement","type":"custom","hasMergeField":false,"logicalOperator":"&&"}]},"rowDelete":true,"fireeventOnDeleteconfirm":false,"confirmdeleterow":true,"columns":[{"fieldName":"CreatedDate","label":"Date de création","searchable":false,"sortable":true,"type":"datetime","visible":"false","userSelectable":"true","format":"DD/MM/YYYY, HH:MM"},{"fieldName":"Detail_moyen_frais_medicaux__c","label":"Détail du moyen","searchable":"true","sortable":true,"type":"text","userSelectable":"true"},{"fieldName":"Montant_total_devises__c","label":"Montant total","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true"},{"fieldName":"Plafond_devises__c","label":"Plafond","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true"},{"fieldName":"Franchise_devises__c","label":"Franchise","searchable":false,"sortable":true,"type":"number","visible":"false","editable":"false","userSelectable":"true"},{"fieldName":"Pourcentage_PEC__c","label":"% PEC","searchable":false,"sortable":true,"type":"percent","editable":"true","userSelectable":"true"},{"fieldName":"Montant_total_PEC_devises__c","label":"Montant total PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Copaiement_devises__c","label":"Copaiement","searchable":false,"sortable":true,"type":"number","userSelectable":"true","editable":"false"},{"fieldName":"Contrevaleur_montant_total_PEC__c","label":"Contrevaleur PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Id","label":"Id","searchable":"false","sortable":true,"type":"text","format":"DD/MM/YYYY","visible":"false"}],"records":"{records}"},"type":"element","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"elementLabel":"Datatable-3","styleObjects":[{"key":0,"conditions":"default","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"label":"Default","name":"Default","conditionString":"","draggable":false}]},{"name":"Datatable","element":"flexDatatable","size":{"isResponsive":false,"default":"12"},"stateIndex":0,"class":"slds-col ","property":{"record":"{record}","card":"{card}","issearchavailable":false,"issortavailable":true,"styles":{"cellMargin":[],"cellPadding":[]},"cellLevelEdit":false,"pagelimit":"5","groupOrder":"desc","rowLevelEdit":true,"pagesize":"4","groupBy":"","sortAcrossGroups":true,"hideExtraColumn":false,"userSelectableRow":false,"data-conditions":{"id":"state-condition-object","isParent":true,"group":[{"id":"state-new-condition-0","field":"Finance__r.RecordType.Name","operator":"!=","value":"Remboursement","type":"custom","hasMergeField":false},{"id":"state-new-condition-13","field":"RecordType.Name","operator":"!=","value":"Frais médicaux","type":"custom","hasMergeField":false,"logicalOperator":"&&"}]},"rowDelete":true,"fireeventOnDeleteconfirm":false,"confirmdeleterow":true,"columns":[{"fieldName":"CreatedDate","label":"Date de création","searchable":false,"sortable":true,"type":"datetime","visible":"false","userSelectable":"true","format":"DD/MM/YYYY, HH:MM"},{"fieldName":"TECH_Moyen__c","label":"Détail du moyen","searchable":"true","sortable":true,"type":"text","userSelectable":"true"},{"fieldName":"Quantite__c","label":"Quantité","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true","visible":"false"},{"fieldName":"Montant_total_devises__c","label":"Montant total","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true"},{"fieldName":"Plafond_devises__c","label":"Plafond","searchable":false,"sortable":true,"type":"number","visible":"true","editable":"true","userSelectable":"true"},{"fieldName":"Pourcentage_PEC__c","label":"% PEC","searchable":false,"sortable":true,"type":"percent","editable":"true","userSelectable":"true"},{"fieldName":"Montant_total_PEC_devises__c","label":"Montant total PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Copaiement_devises__c","label":"Copaiement","searchable":false,"sortable":true,"type":"number","userSelectable":"true","editable":"false"},{"fieldName":"Contrevaleur_montant_total_PEC__c","label":"Contrevaleur PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Id","label":"Id","searchable":"false","sortable":true,"type":"text","format":"DD/MM/YYYY","visible":"false"}],"records":"{records}"},"type":"element","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"elementLabel":"Datatable-4","styleObjects":[{"key":0,"conditions":"default","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"label":"Default","name":"Default","conditionString":"","draggable":false}]},{"name":"Datatable","element":"flexDatatable","size":{"isResponsive":false,"default":"12"},"stateIndex":0,"class":"slds-col ","property":{"record":"{record}","card":"{card}","issearchavailable":false,"issortavailable":true,"styles":{"cellMargin":[],"cellPadding":[]},"cellLevelEdit":false,"pagelimit":"5","groupOrder":"desc","rowLevelEdit":true,"pagesize":"4","groupBy":"","sortAcrossGroups":true,"hideExtraColumn":false,"userSelectableRow":false,"data-conditions":{"id":"state-condition-object","isParent":true,"group":[{"id":"state-new-condition-23","field":"Finance__r.RecordType.Name","operator":"==","value":"Remboursement","type":"custom","hasMergeField":false}]},"rowDelete":true,"fireeventOnDeleteconfirm":false,"confirmdeleterow":true,"columns":[{"fieldName":"TECH_Garantie__c","label":"Garantie","searchable":false,"sortable":true,"type":"text","visible":"true","userSelectable":"true","format":"DD/MM/YYYY, HH:MM"},{"fieldName":"TECH_Moyen__c","label":"Détail du moyen","searchable":"true","sortable":true,"type":"text","userSelectable":"true"},{"fieldName":"Quantite__c","label":"Quantité","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true","visible":"false"},{"fieldName":"Montant_total_devises__c","label":"Montant total","searchable":false,"sortable":true,"type":"number","editable":"true","userSelectable":"true"},{"fieldName":"Plafond_devises__c","label":"Plafond","searchable":false,"sortable":true,"type":"number","visible":"true","editable":"true","userSelectable":"true"},{"fieldName":"Pourcentage_PEC__c","label":"% PEC","searchable":false,"sortable":true,"type":"percent","editable":"true","userSelectable":"true"},{"fieldName":"Montant_total_PEC_devises__c","label":"Montant total PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Copaiement_devises__c","label":"Copaiement","searchable":false,"sortable":true,"type":"number","userSelectable":"true","editable":"false"},{"fieldName":"Contrevaleur_montant_total_PEC__c","label":"Contrevaleur PEC","searchable":false,"sortable":true,"type":"number","userSelectable":"true"},{"fieldName":"Id","label":"Id","searchable":"false","sortable":true,"type":"text","format":"DD/MM/YYYY","visible":"false"}],"records":"{records}"},"type":"element","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"elementLabel":"Datatable-5","styleObjects":[{"key":0,"conditions":"default","styleObject":{"sizeClass":"slds-size_12-of-12 ","padding":[],"margin":[],"background":{"color":"","image":"","size":"","repeat":"","position":""},"size":{"isResponsive":false,"default":"12"},"container":{"class":""},"border":{"type":"","width":"","color":"","radius":"","style":""},"elementStyleProperties":{"styles":{"cellMargin":[],"cellPadding":[]}},"text":{"align":"","color":""},"inlineStyle":"","class":"","style":"      \n         "},"label":"Default","name":"Default","conditionString":"","draggable":false}]}]}},"childCards":[],"actions":[],"omniscripts":[],"documents":[]}],"dataSource":{"type":"Query","value":{"dsDelay":"","query":"SELECT Id, CreatedDate, finance__r.recordtype.Name, recordType.Name,TECH_moyen__c,TECH_Garantie__c,Finance__c,toLabel(Detail_moyen_frais_medicaux__c),Quantite__c, Montant_total_devises__c, Plafond_devises__c, Franchise_devises__c, Pourcentage_PEC__c, Montant_total_PEC_devises__c, Copaiement_devises__c,Contrevaleur_montant_total_PEC__c FROM LigneFacturation__c WHERE Finance__c  ='{recordId}'","jsonMap":"{\"recordId\":\"{recordId}\"}","resultVar":""},"orderBy":{"name":"","isReverse":""},"contextVariables":[]},"title":"FC01LigneDeFacturation","enableLwc":true,"isFlex":true,"theme":"slds","selectableMode":"Multi","lwc":{"DeveloperName":"cfFC01LigneDeFacturation_4_VyvAI","Id":"0Rbbg0000000LZ7CAM","MasterLabel":"cfFC01LigneDeFacturation_4_VyvAI","NamespacePrefix":"c","ManageableState":"unmanaged"},"osSupport":true,"dynamicCanvasWidth":{"type":"desktop"},"isRepeatable":false,"events":[],"requiredPermission":"","Name":"FC01LigneDeFacturation","uniqueKey":"FC01LigneDeFacturation","Id":"0kobg00000001CDAAY","OmniUiCardKey":"FC01LigneDeFacturation/VyvAI/4.0","OmniUiCardType":"Parent"};
  export default definition