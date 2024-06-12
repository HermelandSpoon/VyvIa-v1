/*
* Copyright (c) 2020, salesforce.com, inc.
* All rights reserved.
* SPDX-License-Identifier: BSD-3-Clause
* For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
*/


/**
 Author:         Paul Lucas
Company:        Salesforce
Description:    qsydFileExplorerManagement
Date:           01-May-2020

TODO:

*/

import {LightningElement, track, api, wire} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {loadScript, loadStyle} from 'lightning/platformResourceLoader';
import jquery from '@salesforce/resourceUrl/jquery_350';
import jstree from '@salesforce/resourceUrl/jstree_339';
import jstree339 from '@salesforce/resourceUrl/jstree339';
import {
	CONSTANTS,
	item,
	listToTree,
	clone, dictionaryToList,
	reduceErrors 
} from 'c/qsydFileExplorerCommon';
import setFolder from '@salesforce/apex/qsydFileExplorerController.setFolder';
import save
	from '@salesforce/apex/qsydFileExplorerController.postItem';
import remove
	from '@salesforce/apex/qsydFileExplorerController.deleteItem';
import updateFileName
	from '@salesforce/apex/qsydFileExplorerController.updateFileName';
import cloneTemplate
	from '@salesforce/apex/qsydFileExplorerController.cloneTemplate';
import shareFileToPartner
	from '@salesforce/apex/qsydFileExplorerController.shareFileToPartner';
import getListPartnerProfil
from '@salesforce/apex/qsydFileExplorerController.getListPartnerProfil';
import deleteFiles 
	from '@salesforce/apex/qsydFileExplorerController.deleteFiles';

import moveItemFiles from '@salesforce/apex/qsydFileExplorerController.moveItemFiles';

const CSS_CLASS = 'modal-hidden';

export default class QSydFileExplorerManagement extends LightningElement {
	/**
	 * Internal properties
	 */
	_error;
	_resourcesLoaded = false;
	_tree;
	_$tree;
	_$treeInstance;
	_selectedItem;
	_targetItem;
	_action;

	/**
	 * Private properties
	 */
	isLoading = true;
	files;
	folders;
	dataDictionary;
	dataTree;
	uploadedFiles;
	hasHeaderString = false;
	disabledBtn = false; 
	/*default selected partner file*/
	selected_profil = [];  
	/**Partner profils list**/

	_sizeFileTodeleted = "";

	@track lstOptions_partner = []; 
	@track _checkedItemFile = [];
	@track _checkedItemFileTemp= [];

	@wire(getListPartnerProfil) wiredPartner({ error, data }){ 
		if(data){
			for (var i = 0; i < data.length; i++) {
				this.lstOptions_partner.push({label: data[i], value: data[i]});
			}; 
		} 
		//initialise selected_profil
		this.selected_profil = [];
		this._checkedItemFileTemp = [];   
	};

	/****/ 
	@api 
	get checkedItemFile(){
		return this._checkedItemFile;
	} 

	set checkedItemFile(value){ 
		this._checkedItemFile= [];
		this._checkedItemFileTemp= [];
		this._checkedItemFile = value; 
		this.sizeFileTodeleted= value.length;  
	}

	get selectedItemLabel() { 
			return this._selectedItem.text; 
	}

	get moveItemFile(){
		return this._action === CONSTANTS.ACTION_TYPES.MOVE_FILE;
	}

	get moveItem() {
		return this._action === CONSTANTS.ACTION_TYPES.MOVE_FOLDER ;
	}

	get addFile() {
		return this._action === CONSTANTS.ACTION_TYPES.ADD_FILE;
	}
	//YMU - Rename File
	get renameFile(){ 
		return this._action === CONSTANTS.ACTION_TYPES.RENAME_FILE;
	}

	get addFolder() {
		return this._action === CONSTANTS.ACTION_TYPES.ADD_FOLDER;
	}

	get renameFolder() {
		return this._action === CONSTANTS.ACTION_TYPES.RENAME_FOLDER;
	}

	get deleteFolder() {
		return this._action === CONSTANTS.ACTION_TYPES.DELETE_FOLDER;
	}

	get templateFolder(){
		return this._action === CONSTANTS.ACTION_TYPES.TEMPLATE_FOLDER;
	}

	get shareFile(){ 
		return this._action === CONSTANTS.ACTION_TYPES.SHARE_FILE;
	} 

	get deleteFile(){
		console.log('delete', CONSTANTS.ACTION_TYPES.DELETE_FILE);
		return this._action === CONSTANTS.ACTION_TYPES.DELETE_FILE;
	}

	get theaction(){
		return this._action;
	}
 
	@api
	get sizeFileTodeleted(){
		return this._sizeFileTodeleted;
	}

	set sizeFileTodeleted(value){
		this._sizeFileTodeleted = value; 
	}

	/**
	 * Public properties
	 */
	@api recordId;
	@api objectApiName;
	@api folderId;
	@api showModal = false;
	@api isChecked = false;   
	 
	@api 
	get valuespartner(){
		return this.selected_profil;
	}

	set valuespartner(value){
		this.selected_profil = value;  
	}
	
	@api
	get dictionaryData() {
		return this.dataDictionary;
	}

	set dictionaryData(value) {
		this.dataDictionary = clone(value);
		if (value) {
			this.files = this.dataDictionary.files;
			this.folders = this.dataDictionary.folders;
			this.dataTree = listToTree(this.folders);
		}
	}

	@api
	get selectedItem() {
		return this._selectedItem;
	}

	set selectedItem(value) {
		this._selectedItem = new item(value);
	}

	@api
	get targetItem() {
		return this._targetItem;
	}

	set targetItem(value) {
		this._targetItem = new item(value);
	}

	@api
	get header() {
		return this._header;
	}

	set header(value) {
		this.hasHeaderString = value !== '';
		this._header = value;
	}

	get addFileHeading() {
		if (this._selectedItem.isRoot()) {
			return 'Add files to Home folder:';
		}
		return 'Add files to folder "' + this._selectedItem.text + '":';
	}
 
	@api
	show(action) { 
		this._action = action;
		this.showModal = true; 
	}

	@api
	hide() {
		this.showModal = false;
		this._resourcesLoaded = false;
	}

	@api
	checked(value){
		this.isChecked = value;   
	}

	/**
	 * constructor: Called when the component is created. This hook flows from parent to child. You can’t access child
	 * elements in the component body because they don’t exist yet. Properties are not passed yet, either. Properties
	 * are assigned to the component after construction and before the connectedCallback() hook.
	 * You can access the host element with this.template.
	 */
	constructor() {
		super(); 
	}

	/**
	 * connectedCallBack: Called when the element is inserted into a document. This hook flows from parent to child.
	 * You can’t access child elements in the component body because they don’t exist yet.
	 * You can access the host element with this.template.
	 */
	connectedCallback() {

	}

	/**
	 * disconnectedCallback: Called when the element is removed from a document. This hook flows from parent to child.
	 */
	disconnectedCallback() {
	}

	/**
	 * render: For complex tasks like conditionally rendering a template or importing a custom one, use render()
	 * to override standard rendering functionality. This function gets invoked after connectedCallback() and must
	 * return a valid HTML template.
	 */
	// render(){
	// }

	/**
	 * renderedCallback: Called after every render of the component. This lifecycle hook is specific to
	 * Lightning Web Components, it isn’t from the HTML custom elements specification. This hook flows from child to parent.
	 */
	renderedCallback() {
		if (this.showModal) {
			if (this._resourcesLoaded) {
				return true;
			}
			this._resourcesLoaded = true;

			Promise.all([
				loadScript(this, jquery),
				// loadScript(this, jstree + '/jstree.3.3.9.js'),
				loadScript(this, jstree339),
				loadStyle(this, jstree + '/themes/default/style.css'),
			]).then(() => {
				this.initialiseTree();
			}).catch(error => {
				console.log('>>>>> Error initialising tree');
				console.log(error);
			});
		}
	}

	treeReady() {
		return (this._$tree && this._$treeInstance);
	}

	addTreeListeners() {
		this._$tree.on('ready.jstree', this.handleTreeReady.bind(this));
		this._$tree.on('refresh.jstree', this.handleTreeReady.bind(this));
		this._$tree.on('changed.jstree', this.handleTreeChange.bind(this));
	}

	initialiseTree() {
		this._tree = this.template.querySelector('div.jstree');
		this._$tree = $(this._tree);
		this.bindTree(this.dataTree);
	}

	bindTree(data) {
		if (data) {
			this.addTreeListeners();

			this._$tree.jstree({
				'core': {
					'data': data,
					'check_callback': true,
					'themes': {
						'responsive': false,
						'variant': 'large',
						'stripes': false,
					},
				},
				'plugins': ['sort'],
				// 'lwc_host': this.template.host,
				'lwc_host': this._tree,
			});
		} else {
			window.setTimeout((data) => {
				this.bindTree(data);
			}, 1000, this.dataTree);
		}
	}

	handleTreeReady(e, data) {
		this._$treeInstance = this._$tree.jstree(true);
		this.isLoading = false;

		// Expand
		this._$treeInstance.open_all(null, 0, $);
	}

	handleTreeChange(e, data) {
		this.targetItem = data.node.original;
		this.targetItem.parents = data.node.parents;

		this.template.querySelector('div.tree-home').classList.remove('item-selected');
	}

	handleHomeClick(e) {
		this.targetItem = new item({parents: []});
		this._$treeInstance.deselect_all(true);
		e.currentTarget.classList.add('item-selected');
	}

	handleUploadFinished(e) {
		console.log('HERE YMU');
		this.uploadedFiles = e.detail.files;
		let folderId = (this.folderId == 'root' ? null : this.folderId);
		const documentIds = this.uploadedFiles.map(file => file.documentId);
		const numDocuments = documentIds.length;
		const message = numDocuments + ' File' + (numDocuments > 1 ? 's' : '') +
			' Successfully Added!';

		setFolder({contentDocumentIds: documentIds, folderId: folderId}).then(result => {
			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
				message,
				'',
				CONSTANTS.TOAST_THEMES.SUCCESS,
				CONSTANTS.TOAST_MODE.DISMISSABLE);

			this.handleDialogClose({
				action: this._action,
			});
		}).catch(error => {
			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.ERROR,
				reduceErrors(error).join(', '),
				'',
				CONSTANTS.TOAST_THEMES.ERROR,
				CONSTANTS.TOAST_MODE.DISMISSABLE);
		});
	}

	handleDialogClose(data) {
		this.dispatchEvent(
			new CustomEvent(
				CONSTANTS.CUSTOM_DOM_EVENT_TYPES.EXPLORER_MANAGEMENT_CLOSE, {
					detail: data,
				}),
		);

		this.hide();
	}

	showToast(title, message, messageData, variant, mode) {
		if(title._header !=undefined){
			title = title._header;
		}
		
		this.dispatchEvent(new ShowToastEvent({
			'title': title.charAt(0).toUpperCase() +
				title.substr(1).toLowerCase(),
			'message': message,
			'messageData': messageData,
			'variant': variant,
			'mode': mode,
		}));
	}

	handleSlotTaglineChange() {
		const tagline = this.template.querySelector('p');

		if (tagline) {
			tagline.classList.remove(CSS_CLASS);
		}
	}

	handleCancelClick(e) {
		this._checkedItemFileTemp= [];
		this.hide();
	}

	handleShareCheckClick(e) {
		this.isChecked = e.target.checked;      
	}

	handleAcceptClick(e) {
		let deltaItem,
		selector = CONSTANTS.SELECTORS.CLASS_SPECIFIER + this._action,
		element = this.template.querySelector(selector); 

		//Create an event to reset checkbox filter Shared file HBO
		const selectEvent = new CustomEvent('mycustomevent', {
            detail: false
        });
       this.dispatchEvent(selectEvent);

		// Avoid multiple submissions
		e.target.disabled = true;
		switch (this._action) {
			case CONSTANTS.ACTION_TYPES.ADD_FILE: 
				console.log('action break: ', selector);
				break;
			case CONSTANTS.ACTION_TYPES.SHARE_FILE: 
				console.log('##HBO 1 action check  : ', element);
				console.log('##HBO 1 this.selected_profil : ', this.selected_profil);
				//if (element.reportValidity()) {
					//HBO to enter logic to Sahre file in salesforce (content version)
					deltaItem = Object.assign({}, this.selectedItem);
					// deltaItem.text = element.value;   
					var fileIsVisible = this.selected_profil.length > 0;
					this.shareFileAction(deltaItem.id, fileIsVisible, this.selected_profil, e );  
				//} else {
				//	e.target.disabled = false;
				//}
				break;
			case CONSTANTS.ACTION_TYPES.MOVE_FILE: 
				
				if(this._checkedItemFile.length == 0 || this._checkedItemFile.length == this._checkedItemFileTemp.length){
					this.showToast(
						this,
						'No file Selected',
						'No file select, please check the file to move.',
						'',
						CONSTANTS.TOAST_THEMES.ERROR,
						CONSTANTS.TOAST_MODE.DISMISSABLE
					);
				}else if(this.targetItem) {


					console.log('HBO this.targetItem ', this.targetItem);
					console.log('HBO this.selectedItem.folder ', this.selectedItem.folder);

					if (this.targetItem.id === this.selectedItem.folder) {
						this.showToast(
							CONSTANTS.TOAST_MESSAGE_TYPES.WARNING,
							CONSTANTS.ACTION_ERROR_MESSAGES.MOVE_FILE_SAME_SOURCE_AND_TARGET,
							'',
							CONSTANTS.TOAST_THEMES.WARNING,
							CONSTANTS.TOAST_MODE.DISMISSABLE);
						e.target.disabled = false;
						break;
					} 
					deltaItem = Object.assign({}, this.selectedItem);
					deltaItem.folder = this.targetItem.id;
 
					var idFileToDelete=[]; 
					var folderToSelect; //Folder to show after delete
					this._checkedItemFile.forEach(element => {
						var posi = this._checkedItemFileTemp.findIndex(object => object.key === element.key); 
						if(posi <= -1){
							idFileToDelete.push(element.key);
							folderToSelect = element.folder;
						}
					}); 
					this._checkedItemFileTemp= [];

					this.moveItemFileSave(deltaItem, idFileToDelete);
				}  
				break;
			case CONSTANTS.ACTION_TYPES.ADD_FOLDER:
				if (element.reportValidity()) {
					deltaItem = new item({});
					deltaItem.entityId = this.recordId;
					deltaItem.text = element.value;
					deltaItem.folder = this.selectedItem.isRoot()
						? null
						: this.selectedItem.id;
					this.saveItem(deltaItem);
				} else {
					e.target.disabled = false;
				}
				break;
			case CONSTANTS.ACTION_TYPES.MOVE_FOLDER: 
				if (this.targetItem) {

				if (this.targetItem.parents.includes(
					this.selectedItem.id)) {
					this.showToast(
						CONSTANTS.TOAST_MESSAGE_TYPES.WARNING,
						CONSTANTS.ACTION_ERROR_MESSAGES.MOVE_FOLDER_DESCENDANT,
						'',
						CONSTANTS.TOAST_THEMES.WARNING,
						CONSTANTS.TOAST_MODE.DISMISSABLE);
					e.target.disabled = false;
					break;
				}

				if (this.targetItem.id === this.selectedItem.id) {
					this.showToast(
						CONSTANTS.TOAST_MESSAGE_TYPES.WARNING,
						CONSTANTS.ACTION_ERROR_MESSAGES.MOVE_FOLDER_CIRCULAR_DEPENDENCY,
						'',
						CONSTANTS.TOAST_THEMES.WARNING,
						CONSTANTS.TOAST_MODE.DISMISSABLE);
					e.target.disabled = false;
					break;
				}

				if (this.targetItem.id === this.selectedItem.folder) {
					this.showToast(
						CONSTANTS.TOAST_MESSAGE_TYPES.WARNING,
						CONSTANTS.ACTION_ERROR_MESSAGES.MOVE_FOLDER_SAME_SOURCE_AND_TARGET,
						'',
						CONSTANTS.TOAST_THEMES.WARNING,
						CONSTANTS.TOAST_MODE.DISMISSABLE);
					e.target.disabled = false;
					break;
				}

				deltaItem = Object.assign({}, this.selectedItem);
				deltaItem.folder = this.targetItem.id;
				this.saveItem(deltaItem);
				} 
				break;
			case CONSTANTS.ACTION_TYPES.RENAME_FOLDER:
				if (element.reportValidity()) {
					deltaItem = Object.assign({}, this.selectedItem);
					deltaItem.text = element.value;

					console.log('YMU deltaitem : ', deltaItem);
					console.log('YMU element.value: ', element.value);
					console.log('YMU deltaitem.text : ', deltaItem.text);
					console.log('YMU deltaitem.id : ', deltaItem.id);

					this.saveItem(deltaItem);
					console.log('YMU HERE !!!');
				} else {
					e.target.disabled = false;
				}
				break;
			case CONSTANTS.ACTION_TYPES.DELETE_FOLDER:
				deltaItem = Object.assign({}, this.selectedItem);
				this.removeItem(deltaItem);
				break;
			case CONSTANTS.ACTION_TYPES.TEMPLATE_FOLDER:
				// eval('debugger;')
				// let templateList = this.template.querySelector('c-qsyd-file-explorer-template-list');
				// this.selectedItem = templateList.selectedTemplate;
				// alert ('template folder');
				// alert(JSON.stringify( this.selectedItem));
				// break;
				const selectedRows = (element && element.tableData) ? element.tableData.getSelectedRows() : null;
				
				if (!selectedRows || !selectedRows[0]) {
					this.showToast(
						this,
						CONSTANTS.TOAST_MESSAGE_TYPES.WARNING,
						CONSTANTS.ACTION_MESSAGES.SELECT_TEMPLATE_FOLDER,
						'',
						CONSTANTS.TOAST_THEMES.WARNING,
						CONSTANTS.TOAST_MODE.DISMISSABLE);
					e.target.disabled = false;
					break;
				}
				
				console.log('YMU selectedRows[0].Id ', selectedRows[0].Id);
				console.log('YMU recordid ', this.recordId);
				console.log('YMU this.selectedItem.id ', this.selectedItem.id);

				this.saveFolderTemplate(selectedRows[0].Id, this.recordId,
					this.selectedItem.id);
				break;
			case CONSTANTS.ACTION_TYPES.RENAME_FILE:
				if (element.reportValidity()) {
					//YMU to enter logic to rename file name in salesforce (content version)
					deltaItem = Object.assign({}, this.selectedItem);
					deltaItem.text = element.value;
					console.log('ANR deltaitem.id : ', deltaItem.id);
					// var contentDocId = deltaItem.Id;
					
					updateFileName({
						fileExpId : deltaItem.id,
						newFileName : deltaItem.text
					}).then((result) => {
						console.log('File Rename Successful!');
					});

					this.saveItem(deltaItem);
					console.log('YMU HERE RENAME FILE !!!');
				} else {
					e.target.disabled = false;
				}
				break;
			case CONSTANTS.ACTION_TYPES.DELETE_FILE:	 
				if(this._checkedItemFile.length == 0 || this._checkedItemFile.length == this._checkedItemFileTemp.length){
					this.showToast(
						this,
						'No file Selected',
						'No file select, please check the file to delete.',
						'',
						CONSTANTS.TOAST_THEMES.ERROR,
						CONSTANTS.TOAST_MODE.DISMISSABLE
					);
				}else {
					var idFileToDelete=[]; 
					var folderToSelect; //Folder to show after delete
					this._checkedItemFile.forEach(element => {
						var posi = this._checkedItemFileTemp.findIndex(object => object.key === element.key); 
						if(posi <= -1){ 
							idFileToDelete.push(element.key);
							folderToSelect = element.folder;
						}
					}); 
					this._checkedItemFileTemp= [];
					this.handleDeleteFile(idFileToDelete, folderToSelect);  
				} 
			break;
			default:
				break;
		}
	}

	//HBO move multiples files
	moveItemFileSave(deltaItem, idFileToDelete){
		console.log('deltaItem '+deltaItem.folder); 
		console.log('idFileToDelete '+idFileToDelete); 

		moveItemFiles({
			fileIDs : idFileToDelete,
			folder : deltaItem.folder
		}).then((result) => {  
			if(result){
				this.showToast(
					CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
					CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
					'',
					CONSTANTS.TOAST_THEMES.SUCCESS,
					CONSTANTS.TOAST_MODE.DISMISSABLE);

					this.handleDialogClose({
						action: this._action,
						item: {id: deltaItem.folder}, // New selected item should be the parent folder
					});

				this._checkedItemFileTemp = []; 
				this.disabledBtn = false;

				//refresh page
				this.dispatchEvent(
					new CustomEvent(
						CONSTANTS.CUSTOM_DOM_EVENT_TYPES.ITEM_ACTION, {
							detail: CONSTANTS.ACTION_TYPES.REFRESH,
						}), 
				);
 
  
			}
		});
	}

	saveItem(deltaItem, e) { 
		save(
			{
				serializedItem: JSON.stringify(deltaItem),
			}).then((result) => {
			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
				CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
				'',
				CONSTANTS.TOAST_THEMES.SUCCESS,
				CONSTANTS.TOAST_MODE.DISMISSABLE);

			this.handleDialogClose({
				action: this._action,
				// item: this.selectedItem
				item: {id: JSON.parse(result).id},
			});
		}).catch(error => {
			this._error = error;
			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.ERROR,
				reduceErrors(error).join(', '),
				'',
				CONSTANTS.TOAST_THEMES.ERROR,
				CONSTANTS.TOAST_MODE.DISMISSABLE);

			this.handleDialogClose({
				action: this._action,
				item: {},
			});
		});
	}

	removeItem(deltaItem) {
		remove(
			{
				serializedItem: JSON.stringify(deltaItem),
			}).then(result => {

			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
				CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
				'',
				CONSTANTS.TOAST_THEMES.SUCCESS,
				CONSTANTS.TOAST_MODE.DISMISSABLE);

			this.handleDialogClose({
				action: this._action,
				item: {id: this.selectedItem.folder}, // New selected item should be the parent folder
			});
		}).catch(error => {
			this._error = error;

			this.showToast(
				CONSTANTS.TOAST_MESSAGE_TYPES.ERROR,
				reduceErrors(error).join(', '),
				'',
				CONSTANTS.TOAST_THEMES.ERROR,
				CONSTANTS.TOAST_MODE.DISMISSABLE);

			this.handleDialogClose({
				action: this._action,
				item: {},
			});
		});
	}

	saveFolderTemplate(templateId, entityId, folderId) {
		cloneTemplate({
			templateId: templateId,
			entityId: entityId,
			folderId: folderId,
		}).
			then((result) => {
				showToast(
					this,
					CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
					CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
					'',
					CONSTANTS.TOAST_THEMES.SUCCESS,
					CONSTANTS.TOAST_MODE.DISMISSABLE);

				this.handleDialogClose({
					action: this._action,
					item: this.selectedItem,
				});
			}).
			catch(error => {
				this.error = error;
				this.handleDialogClose({
					action: this._action,
					item: this.selectedItem,
				});
			});
	}

	shareFileAction(fileID, isFileVisible, ProfilePartner, event){
	 
		// if(isFileVisible && ProfilePartner.length <= 0){
			// if(ProfilePartner.length <= 0){
	
				// this.showToast(
				// 	'Error Share file',
				// 	'Please choose at least one profile that has access to the file', 
				// 	'', 
				// 	CONSTANTS.TOAST_THEMES.WARNING,
				// 	CONSTANTS.TOAST_MODE.STICKY);

				// 	event.target.disabled = false;
	
			// }else {

				shareFileToPartner({
						fileId: fileID,
						isFileVisible: isFileVisible,  
						ProfilePartner:ProfilePartner
					}).
						then((result) => {

							this.handleDialogClose({
								action: this._action,
								item: this.selectedItem,
							}); 
							this.showToast(
								CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
								CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
								'',
								CONSTANTS.TOAST_THEMES.SUCCESS,
								CONSTANTS.TOAST_MODE.DISMISSABLE);

								this.dispatchEvent(
									new CustomEvent(
										CONSTANTS.CUSTOM_DOM_EVENT_TYPES.ITEM_ACTION, {
											detail: CONSTANTS.ACTION_TYPES.REFRESH,
										}), 
								);
							
						}).
						catch(error => {
							this.error = error;
							this.handleDialogClose({
								action: this._action,
								item: this.selectedItem,
							});
						}); 
			// }
		// } 
	}
 
	handleChange(e){
		this.selected_profil = e.detail.value; 
	}

	handleChangeCheckDeleteFile (e){
		var fileid = e.target.dataset.fileid;  
		if(e.target.checked){ 
				var index = this._checkedItemFileTemp.findIndex(object => object.key === fileid);
				if(index > -1){ 
					this._checkedItemFileTemp.splice(index, 1); 
				}
		}else{
			var index = this._checkedItemFile.findIndex(object => object.key === fileid);
			if(index > -1){
				this._checkedItemFileTemp.push(this._checkedItemFile[index]); 
			}
		} 
		if(this._checkedItemFile.length == this._checkedItemFileTemp.length){
			this.disabledBtn = true;
		}else {
			this.disabledBtn = false;
		}
		var txt =  (this._checkedItemFile.length - this._checkedItemFileTemp.length)+" File(s) to delete"; 
		this._sizeFileTodeleted = txt;
		
	}

	//HBO 
	handleDeleteFile(idFileToDelete, folderToSelect) {
 
		deleteFiles({
			fileIDs : idFileToDelete
		}).then((result) => {  
			if(result){ 
					this.showToast(
						CONSTANTS.TOAST_MESSAGE_TYPES.SUCCESS,
						CONSTANTS.ACTION_SUCCESS_MESSAGES[this._action.toUpperCase()],
						'',
						CONSTANTS.TOAST_THEMES.SUCCESS,
						CONSTANTS.TOAST_MODE.DISMISSABLE);

					this.handleDialogClose({
						action: this._action,
						item: {id: folderToSelect}, // New selected item should be the parent folder
					});

				this._checkedItemFileTemp = []; 
				this.disabledBtn = false;

				//refresh page
				this.dispatchEvent(
					new CustomEvent(
						CONSTANTS.CUSTOM_DOM_EVENT_TYPES.ITEM_ACTION, {
							detail: CONSTANTS.ACTION_TYPES.REFRESH,
						}), 
				);
 
  
			}
		});
	}
 
}