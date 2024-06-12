/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


/**
 * @File Name          : qsydFileExplorer.js
 * @Description        :
 * @Author             : Paul Lucas, Jiun Ryu, Elly Zhu, Derrick Vuong
 **/
import {LightningElement, api, track} from 'lwc';
import {
	CONSTANTS,
	dictionaryToList,
	listToTree,
	clone,
	item,
	showToast,
	reduceErrors,
	interpolate,
} from 'c/qsydFileExplorerCommon';

import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import checkForPermission
	from '@salesforce/apex/qsydFileExplorerController.checkForPermission';
import retrieveItemMap
	from '@salesforce/apex/qsydFileExplorerController.retrieveItemMap';

import isFileVisible
	from '@salesforce/apex/qsydFileExplorerController.isFileVisible';

import retrieveItemMapSharedFilter
	from '@salesforce/apex/qsydFileExplorerController.retrieveItemMapSharedFilter';
 
/* Changes to these width should be done in qsydFileExplorer.css as well for consistency */
const treeMinWidth = '159', mainMinWidth = '285';

let dragging = false, startPos, treeContainerWidth, mainContainerWidth;

export default class QsydFileExplorerCmp extends LightningElement {

	/**
	 * Internal properties
	 */
	_error;
	_action;

	/**
	 * Private properties
	 */
	CONSTANTS = CONSTANTS;
	spinnerAltText = 'Loading';
	showFileExplorer;
	results;
	typedownResults;
	shadowItem;
	item;
	dataSet;
	dataDictionary;
	dataTree;
	breadcrumbs;
	explorerManagementHeader = 'Manage File Explorer';
	sortValue = 'byDateDesc';
	sizeFileTodeleted;
	showdetail = false;

	default_partner_profils = [];  

	@track filtercheckboxval;

	  
	get error() {
		return this._error;
	}

	set error(value) {
		this._error = value; 
		showToast(
			this,
			CONSTANTS.TOAST_MESSAGE_TYPES.ERROR,
			reduceErrors(this._error).join(', '),
			'',
			CONSTANTS.TOAST_THEMES.ERROR,
			CONSTANTS.TOAST_MODE.STICKY);
	}

	get action() {
		return this._action;
	}

	set action(value) {
		this._action = value;
	}

	get folderId() {
		if (this.item) {
			return this.item.documentId
				? this.item.folder
				: this.item.id;
		}
		return null;
	}

	/**
	 * Public properties
	 */
	@api recordId;
	@api objectApiName;
	@api showSpinner;
	@api title;
	@api searchResultDisplayStyle = 'Console Results';
	@track checkedItemFile=[];

	constructor() {
		super();

		this.addEventListener(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED,
			this.handleDataLoaded);
		this.addEventListener(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.EXPLORER_LOADED,
			this.handleExplorerLoaded.bind(this));
		// this.addEventListener('keydown', this.handleKeyDown);
		this.checkedItemFile=[];
	}

	connectedCallback() {
		this.showFileExplorer = false;
		this.initialise();
	}

	renderedCallback() {
	}

	disconnectedCallback() {
		this.removeEventListener(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED,
			this.handleDataLoaded);
		this.removeEventListener(
			CONSTANTS.CUSTOM_DOM_EVENT_TYPES.EXPLORER_LOADED,
			this.handleExplorerLoaded);
	}

	errorCallback(error, stack) {
		showToast(
			this,
			CONSTANTS.TOAST_MESSAGE_TYPES.ERROR,
			reduceErrors(error).join(', '),
			'',
			CONSTANTS.TOAST_THEMES.ERROR,
			CONSTANTS.TOAST_MODE.DISMISSABLE);
	}

	initialise() {
		checkForPermission().then(result => {
			this.showFileExplorer = result;
			//reset checkbox filter  HBO
			this.filtercheckboxval = false;  
			if (this.showFileExplorer) { 
				this.retrieveFileExplorerItemMap();
			} else {
				this.showSpinner = true;
				this.template.querySelector('lightning-layout.no-access').classList.remove('slds-hidden');
				
			}
		}).catch(error => {
			this.dispatchEvent(
				new CustomEvent(
					CONSTANTS.CUSTOM_DOM_EVENT_TYPES.EXPLORER_LOADED, {}),
			);
			this.error = error;
		});
	}

	@api
	retrieveFileExplorerItemMap(e) {
		this.showSpinner = true;
		retrieveItemMap({
			recordId: this.recordId,
			sortParam: this.sortValue
		}).then(result => {
			this.dataDictionary = JSON.parse(result);
			console.log('YMU this.datadictionary 1 : ', this.dataDictionary);
			this.dataSet = dictionaryToList(clone(this.dataDictionary));
			this.dataTree = listToTree(this.dataSet);
			this.results = this.findTreeItem(this.dataDictionary, 'Contents',
				null);
			this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary, null);

			this.dispatchEvent(
				new CustomEvent(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED, {
					detail: this.dataDictionary,
				}),
			);
		}).catch(error => {
			this.error = error;
			console.log('>>>>> Error in retrieveFileExplorerItemMap:');
			console.log(error);
		});
	}

	findTreeItem(dictionary, type, folderId) {
		if (dictionary) {
			return {
				type: type,
				files: dictionary.files.filter(
					({folder}) => {
						return folder == folderId;
					}),
				folders: dictionary.folders.filter(
					({folder}) => {
						return folder == folderId;
					}),
			};
		}
		return null;
	}

	findItemInSet(item) {
		return this.dataSet.find(i => i.id === item.id);
	}

	buildBreadcrumbs(dictionary, item) {
		let breadcrumbs = [];
		if (item) {
			if (!item.documentId) {
				breadcrumbs.unshift(item);
			}
			let folderId = item.folder;
			while (folderId) {
				const folder = dictionary.folders.find(
					({id}) => id == folderId);
				if (folder) {
					breadcrumbs.unshift(folder);
					folderId = folder.folder;
				} else {
					folderId = null;
				}
			}
		}
		return breadcrumbs;
	}

	handleDataLoaded(e) {
		switch (this.action) {
			case CONSTANTS.ACTION_TYPES.ADD_FILE:
				this.results = this.findTreeItem(this.dataDictionary,'Contents',this.folderId);
				break;

			case CONSTANTS.ACTION_TYPES.UPDATE_FILE:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;
			
			case CONSTANTS.ACTION_TYPES.SHARE_FILE:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;

			case CONSTANTS.ACTION_TYPES.ADD_FOLDER:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;

			case CONSTANTS.ACTION_TYPES.MOVE_FOLDER:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;

			case CONSTANTS.ACTION_TYPES.RENAME_FOLDER:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;

			case CONSTANTS.ACTION_TYPES.DELETE_FOLDER:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;
			
			case CONSTANTS.ACTION_TYPES.DELETE_FILE:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;

			case CONSTANTS.ACTION_TYPES.MOVE_FILE:
				this.item = this.findItemInSet(this.shadowItem) || new item();
				break;	

			default:
				break;
		} 
	}

	handleExplorerLoaded(e) {
		this.showSpinner = false;
	}

	// TODO: Implement keyboard shortcuts
	handleKeyDown({code}) {
		let itemType = new item(this.item).getType(),
			action = `${CONSTANTS.ACTION_TYPES_KEY_MAP[code.charAt(
				code.length - 1).toLowerCase()]}_${itemType}`;

		let explorerActions = this.template.querySelector(
			'c-qsyd-file-explorer-actions'),
			explorerManagement = this.template.querySelector(
				'c-qsyd-file-explorer-management');

		if (explorerActions && !explorerManagement.showModal) {
			if (explorerActions.isSelectedItemMenuActionEnabled(action)) {
				explorerActions.handleMenuItemSelect({
					detail: {
						value: action,
					},
				});
			}
		}
	}

	handleItemAction(e) {
		console.log('YMU here action '+ e.detail);
		const explorerManagement = this.template.querySelector(
			'c-qsyd-file-explorer-management'); 
			 
		switch (e.detail) {
			case CONSTANTS.ACTION_TYPES.REFRESH:

				var child = this.template.querySelector("c-qsyd-file-explorer-results");
				if(child){
					child.handleValueChange();
				} 
				//reset checkbox filter  HBO 
				this.item = new item();
				this.filtercheckboxval = false;
				this.checkedItemFile =[];
				this.sizeFileTodeleted = '';  
			    this.initialise(); 
				break;
			case CONSTANTS.ACTION_TYPES.DELETE_FILE:    
				if(this.checkedItemFile.length <= 0){  
					this.dispatchEvent(
						new ShowToastEvent({
								  title: 'Warning',
								  message: 'No File selected, please check the file to delete.',
								  variant: 'warning',
								  mode: 'dismissable'
							  })
					 );  
				}else {
					this.sizeFileTodeleted = this.checkedItemFile.length+" File(s) to delete"; 
					this.item.setHostFolderLabel(this.dataDictionary.folders);
					this.explorerManagementHeader = interpolate(
					CONSTANTS.ACTION_HEADERS[e.detail.toString().toUpperCase()], this.item); 
					explorerManagement.show(e.detail);
				}
				break;
			case CONSTANTS.ACTION_TYPES.SHARE_FILE:
				//Share file comunity 
				explorerManagement.isChecked = false; 
				isFileVisible({
					fileId : this.item.id
				}).then((result) => { 
					if(result.Visibility){
						explorerManagement.isChecked = result.Visibility = true;
					}  
					if(result.ProfilePartner){
	 
						var lst_profil = result.ProfilePartner.split(';');
						var default_value = [];
						if(lst_profil.length > 0){
							lst_profil.forEach(element => {
								default_value.push(element);
							});
							this.options = Object.keys(lst_profil).map(key => ({ key: key, value: default_value[key] }));
							//this.defaultValues = Object.keys(data);
							this.default_partner_profils = Object.values(default_value);
						}  
					}else {
						this.default_partner_profils = [];
					}

					this.item.setHostFolderLabel(this.dataDictionary.folders);
					this.explorerManagementHeader = interpolate(
					CONSTANTS.ACTION_HEADERS[e.detail.toString().toUpperCase()], this.item);
					console.log('YMU e.detail: ',e.detail);
					explorerManagement.show(e.detail);

				});
				break;
			case CONSTANTS.ACTION_TYPES.MOVE_FILE: 
				if(this.checkedItemFile.length <= 0){  
					this.dispatchEvent(
						new ShowToastEvent({
									title: 'Warning',
									message: 'No File selected, Please, check the file to move.',
									variant: 'warning',
									mode: 'dismissable'
								})
						);
				}else { 
					this.item.setHostFolderLabel(this.dataDictionary.folders);
					this.explorerManagementHeader = interpolate(
						CONSTANTS.ACTION_HEADERS[e.detail.toString().toUpperCase()], this.item);
					console.log('YMU e.detail: ',e.detail);
					explorerManagement.show(e.detail); 
				} 
			break;
			default:
				this.item = new item(this.item);
				this.item.setHostFolderLabel(this.dataDictionary.folders);
				this.explorerManagementHeader = interpolate(
					CONSTANTS.ACTION_HEADERS[e.detail.toString().toUpperCase()], this.item);
				console.log('YMU e.detail: ',e.detail);
				explorerManagement.show(e.detail);
				break;
		}
	}

	handleItemChange(e) {
		console.log('YMU herechange');
	}

	handleExplorerManagementClose(e) {
		if (e && e.detail && e.detail.action) {
			this.action = e.detail.action;
			this.shadowItem = e.detail.item;
			this.retrieveFileExplorerItemMap();
		}
	}
	
	//Checkbox change on each file 
	hanldeCheckedItemFile(e) {
		var selectedItem = e.detail.item;
		var isChecked = e.detail.isChecked;  

		if(isChecked){
			this.checkedItemFile.push({key:selectedItem.id, value:selectedItem});
		 }else{

			const isFound = this.checkedItemFile.some(element => {
				if (element.key ===  selectedItem.id) {
				  return true;
				} 
				return false;
			}); 
			if (isFound) {
				var index = this.checkedItemFile.findIndex(x => x.key === selectedItem.id);
				if(index > -1)this.checkedItemFile.splice(index, 1);
			}
		 }  
	}


	// #### CLICK ITEM START
	handleItemClick(e) {
		this.item = new item(e.detail);  
		
		//Reset listfieldcheked to delete if change folder 
		if(
				(this.item != null && this.item.type === null && 
				 this.checkedItemFile.length > 0 && 
				 this.item.id != this.checkedItemFile[0].value.folder && 
				 !this.item.isRoot())
				  ||
				 (this.item != null && this.item.isRoot() && this.checkedItemFile.length > 0 && 
				  this.checkedItemFile[0].value.folder != null) 
				  ||
				  (this.item != null && this.item.type != null &&
					this.checkedItemFile.length > 0 &&
				   this.checkedItemFile[0].value.folder != this.item.folder )
			){
				this.checkedItemFile =[];
				this.sizeFileTodeleted = ''; 
			}
		 
		if (!this.item.isRoot()) {
			this.results = this.findTreeItem(this.dataDictionary, 'Contents',
				this.folderId);
			this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary,
				this.item);  
		} else { 
			this.results = this.findTreeItem(this.dataDictionary, 'Contents',
				null);
			this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary, null);
		}
	}

	// #### CLICK ITEM END

	// #### SEARCH EVENT START
	handleSearch(e) {
		let searchText = e.detail;

		if (this.searchResultDisplayStyle === 'Typedown Results') {
			this.typedownResults = this.findMatchingResultsToText(
				this.dataDictionary,
				searchText);
		} else if (searchText !== null && searchText !== '') {
			this.results = this.findMatchingResultsToText(
				this.dataDictionary,
				searchText);
		} else {
			if (!this.item || !this.item.isRoot()) {
				this.results = this.findTreeItem(this.dataDictionary,
					'Contents',
					this.folderId);
				this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary,
					this.item);
			} else {
				this.results = this.findTreeItem(this.dataDictionary,
					'Contents',
					null);
				this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary,
					null);
			}
		}
	}

	// #### SEARCH EVENT END

	// #### DRAG RESIZE CONTAINER START
	dragBarMouseDown(e) {
		console.log('HERE!!!!');
		e.preventDefault();
		treeContainerWidth = this.template.querySelector(
			'.file-tree-container').offsetWidth;
		mainContainerWidth = this.template.querySelector(
			'.file-main-container').offsetWidth;
		startPos = e.pageX + 2;
		dragging = true;
	}

	dragMouseMove(e) {
		if (dragging && treeContainerWidth !== 0 && mainContainerWidth !== 0) {
			let currentPos = e.pageX + 2, posDiff = currentPos - startPos;
			let treeContainer = this.template.querySelector(
				'.file-tree-container');
			let mainContainer = this.template.querySelector(
				'.file-main-container');

			let newTreeWidth = treeContainerWidth + posDiff;
			let newMainWidth = mainContainerWidth - posDiff;

			if (newTreeWidth >= treeMinWidth && newMainWidth >= mainMinWidth) {
				let parentWidth = treeContainer.parentNode.offsetWidth;
				treeContainer.style = 'width: ' + (newTreeWidth / parentWidth) *
					100 + '%';
				mainContainer.style = 'width: ' + (newMainWidth / parentWidth) *
					100 + '%';
			}
		}
	}

	dragBarMouseUp(e) {
		if (dragging) {
			treeContainerWidth = 0;
			mainContainerWidth = 0;
			startPos = null;
			dragging = false;
		}
	}

	// #### DRAG RESIZE CONTAINER END

	// #### HELPER FUNCTIONS
	findMatchingResultsToText(data, searchText) {
		let results, folderTextMatches = [], fileTextMatches = [],
			fileTagMatches = [];
		let folders = data.folders, files = data.files;

		if (searchText) {
			const searchKey = RegExp(searchText, 'i');

			if (files && files.length > 0) {
				files.forEach(file => {
					if (file.text.match(searchKey)) {
						fileTextMatches.push(file);
					}

					if (file.tags && file.tags.match(searchKey)) {
						fileTagMatches.push(file);
					}
				});
			}

			if (folders && folders.length > 0) {
				folders.forEach(folder => {
					if (folder.text.match(searchKey)) {
						folderTextMatches.push(folder);
					}
				});
			}
			results = {
				'searchText': searchText,
				'type': 'Search',
				'files': fileTextMatches,
				'folders': folderTextMatches,
				'tags': fileTagMatches,
			};
		} else {
			results = null;
		}
		return results;
	}

	//YMU
	get sortOptions(){
		return [
			{label: 'Trier par date descendant', value:'byDateDesc'},
			{label: 'Trier par date ascendant', value:'byDateAsc'},
			{label: 'Trier Z - A', value:'byNameDateDesc'},
			{label: 'Trier A - Z', value:'byNameDateAsc'},
		];
	}

	handleSortChange(event) {
		this.sortValue = event.detail.value;
		if(this.filtercheckboxval){
			this.showSpinner = true;
			retrieveItemMapSharedFilter({
				recordId: this.recordId,
				sortParam: this.sortValue
			}).then(result => {
				this.dataDictionary = JSON.parse(result);
				console.log('YMU this.datadictionary 2 : ', this.dataDictionary);
				this.dataSet = dictionaryToList(clone(this.dataDictionary));
				this.dataTree = listToTree(this.dataSet);
				this.results = this.findTreeItem(this.dataDictionary, 'Contents',
					null);
				this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary, null);
	
				this.dispatchEvent(
					new CustomEvent(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED, {
						detail: this.dataDictionary,
					}),
				);
			}).catch(error => {
				this.error = error;
				console.log('>>>>> Error in retrieveFileExplorerItemMap:');
				console.log(error);
			});
		}else {
			
		retrieveItemMap({
			recordId: this.recordId,
			sortParam: this.sortValue
		}).then(result => {
			this.dataDictionary = JSON.parse(result);
			console.log('YMU this.datadictionary 3 : ', this.dataDictionary);
			this.dataSet = dictionaryToList(clone(this.dataDictionary));
			this.dataTree = listToTree(this.dataSet);
			this.results = this.findTreeItem(this.dataDictionary, 'Contents',
				null);
			this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary, null);

			this.dispatchEvent(
				new CustomEvent(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED, {
					detail: this.dataDictionary,
				}),
			);
		}).catch(error => {
			this.error = error;
			console.log('>>>>> Error in retrieveFileExplorerItemMap:');
			console.log(error);
		});
		console.log('YMU this.sortValue : ', this.sortValue);
		}
 
    }
 
	//HBO filter shared file
	handleFilterShareCheckClick(event){
		this.value = event.target.checked;        
    	// console.log("Todo: " + event.target.checked);
		this.filtercheckboxval = event.target.checked;  
		if(event.target.checked){

			console.log('this.dataDictionary ',this.dataDictionary);
			console.log('HBO this.recordId ',this.recordId);
			console.log('HBO this.sortValue ',this.sortValue);
		
			this.showSpinner = true;
			retrieveItemMapSharedFilter({
				recordId: this.recordId,
				sortParam: this.sortValue
			}).then(result => {
				this.dataDictionary = JSON.parse(result);
				console.log('YMU this.datadictionary 4: ', this.dataDictionary);
				this.dataSet = dictionaryToList(clone(this.dataDictionary));
				this.dataTree = listToTree(this.dataSet);
				this.results = this.findTreeItem(this.dataDictionary, 'Contents',
					null);
				this.breadcrumbs = this.buildBreadcrumbs(this.dataDictionary, null);
	
				this.dispatchEvent(
					new CustomEvent(CONSTANTS.CUSTOM_DOM_EVENT_TYPES.DATA_LOADED, {
						detail: this.dataDictionary,
					}),
				);
			}).catch(error => {
				this.error = error;
				console.log('>>>>> Error in retrieveFileExplorerItemMap:');
				console.log(error);
			});

		}else { 
			this.initialise(); 
		}

	}

	handleCustomFilterEvent(event) {  
        const textVal = event.detail; 
        this.filtercheckboxval = textVal; 
    }

}