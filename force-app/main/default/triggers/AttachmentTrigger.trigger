/**
 * @description       : Ce déclencheur se déclenche lors de l'ajout d'une pièce jointe de GOP sur la qualification de la facture devis via Omniscript.
 * @author            : MDV
 * @group             :
 * @last modified on  : 30/04/2024
 * @last modified by  : HBO
 **/
trigger AttachmentTrigger on Attachment (after insert) {
    AttachmentTriggerHandler handler = new AttachmentTriggerHandler();
    switch on Trigger.operationType {
        when AFTER_INSERT{ 
            handler.afterInsert(Trigger.new);
        }
    }
}