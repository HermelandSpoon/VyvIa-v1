import { LightningElement, api } from 'lwc';

const svgCheckIconHtml = `
    <span class="slds-icon_container slds-icon-utility-check slds-current-color">
        <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
            <use xlink:href="/_slds/icons/utility-sprite/svg/symbols.svg#check"></use>
        </svg>
    </span>`;

const classString = 'slds-input_faux slds-combobox__input';

export default class Lwc03groupedCombobox extends LightningElement {
    // one selection at most
    selectedOption
    selectedOptionId

    @api label;

    @api placeholder = 'Select an option';

    @api groupedOptions = [{
        groupName: 'Sélectionné',
        items: [{
            label: 'Burlington Textiles Corp of America',
            value: 'test1',
        }, {
            label: 'Dickenson pic',
            value: 'test2',

        }]
    }, {
        groupName: 'Non Sélectionné',
        items: [{
            label: 'Dickenson pic',
            value: 'test3'
        }, {
            label: 'Edge Communications',
            value: 'test4'
        }]
    }];


    get selected() {
        return this.selectedOption || this.placeholder
    }

    get inputClass() {
        return this.selectedOption ? classString + ' slds-combobox__input-value' : classString;
    }
    // Arrow function to maintain the 'this' context
    toggleDropdown = () => {
        const dropdown = this.template.querySelector('.slds-dropdown-trigger');
        const isExpanded = this.template.querySelector('[role="combobox"]').getAttribute('aria-expanded') === 'true';
        const iconUseElement = this.template.querySelector('.slds-combobox__form-element span svg use');
        dropdown.classList.toggle('slds-is-open');
        iconUseElement.setAttribute('xlink:href', isExpanded ? '/_slds/icons/utility-sprite/svg/symbols.svg#down' : '/_slds/icons/utility-sprite/svg/symbols.svg#up');
        this.template.querySelector('[role="combobox"]').setAttribute('aria-expanded', String(!isExpanded));


        if (!isExpanded) {
            this.template.querySelector('[role="listbox"]').focus();
        }
    }

    // Function to deselect the selected option and remove its SVG icon
    deselectOption() {
        const selectedOption = this.template.querySelector('.slds-is-selected[role="option"]');
        if (selectedOption == null) return;
        selectedOption.classList.remove('slds-is-selected')
        selectedOption.setAttribute('aria-checked', false)

        const iconSpan = selectedOption.querySelector('.slds-icon_container');
        if (iconSpan) {
            iconSpan.remove();
        }
    }
    optionClicked(event) {
        const option= event.currentTarget

        this.deselectOption()
        this.selectedOption = option.querySelector('span[title]').getAttribute('title');
        this.selectedOptionId = option.getAttribute('data-option-id')

        option.classList.add('slds-is-selected')
        option.setAttribute('aria-checked', true)
        option.querySelector('.slds-media__figure').innerHTML = svgCheckIconHtml;
        this.toggleDropdown()
    }

    blurHandler(event){
        if (event.relatedTarget == null || event.relatedTarget === this.template.querySelector('[role="combobox"]')) {
            return;
        }
        this.toggleDropdown();
    }
}