import { LightningElement, api } from 'lwc';

const svgCheckIconHtml = `
    <span class="slds-icon_container slds-icon-utility-check slds-current-color">
        <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
            <use xlink:href="/_slds/icons/utility-sprite/svg/symbols.svg#check"></use>
        </svg>
    </span>`;

export default class Lwc05multiselectCombobox extends LightningElement {
    @api options = [
        { label: 'Burlington Textiles Corp of America', value: 'test1' },
        { label: 'Dickenson pic', value: 'test2' },
        { label: 'Dickenson pic', value: 'test3' },
        { label: 'Edge Communications', value: 'test4' }
    ];

    @api placeholder = 'Select an option';
    @api label;

    @api value // comma-delimited values representing multiselect labels 

    selectedCount;
    selectedOptions = []; // Array to store selected options

    @api
    resetOptions() {
        this.selectedOptions.length = 0
        this.selectedCount = this.template.querySelectorAll('.slds-is-selected').length;
        this.dispatchEvent(new CustomEvent('change', { detail: { value: null } }));
    }
    prefillSelectedOptions() {
        // Split the value into an array of values
        const values = this.value.split(', ');

        // Get all option elements
        const options = this.template.querySelectorAll('[role="option"]');
        // 02sG50000035fosIAA

        // Loop through the values and select the corresponding options
        values.forEach(value => {
            // Find the option element with the matching title
            const option = Array.from(options).find(optionElement => optionElement.querySelector('[title]').title === value.trim());

            if (option && !option.classList.contains('slds-is-selected')) {
                this.selectOption(option);
            }
        });

        this.dispatchEvent(new CustomEvent('change', { detail: { value: this.selectedOptions.join(', ') } }));
    }


    get text() {
        // return this.selectedCount ? `${this.selectedCount} Options Selected` : this.placeholder;
        return this.selectedCount ? `${this.value}` : this.placeholder;
    }

    toggleDropdown = () => {
        const dropdown = this.template.querySelector('.slds-dropdown-trigger');
        const isExpanded = this.template.querySelector('[role="combobox"]').getAttribute('aria-expanded') === 'true';
        const iconUseElement = this.template.querySelector('.slds-combobox__form-element span svg use');

        dropdown.classList.toggle('slds-is-open');
        iconUseElement.setAttribute('xlink:href', isExpanded ? '/_slds/icons/utility-sprite/svg/symbols.svg#down' : '/_slds/icons/utility-sprite/svg/symbols.svg#up');
        this.template.querySelector('[role="combobox"]').setAttribute('aria-expanded', String(!isExpanded));
        this.template.querySelector('[role="combobox"]').classList.toggle('slds-combobox__input');

        if (!isExpanded) {
            this.template.querySelector('[role="listbox"]').focus();
        }
    }

    deselectOption(selectedOption) {
        selectedOption.classList.remove('slds-is-selected');
        selectedOption.setAttribute('aria-checked', false);

        const iconSpan = selectedOption.querySelector('.slds-icon_container');
        if (iconSpan) {
            iconSpan.remove();
        }

        // Remove from selectedOptions array
        const optionTitle = selectedOption.querySelector('span[title]').getAttribute('title');
        this.selectedOptions = this.selectedOptions.filter(option => option !== optionTitle);

        // Also remove from the pre-filled array
        this.value = this.value.split(', ').filter(value => value !== optionTitle).join(', ');
    }

    selectOption(option) {
        option.classList.add('slds-is-selected');
        option.setAttribute('aria-checked', true);
        option.querySelector('.slds-media__figure').innerHTML = svgCheckIconHtml;

        // Add to selectedOptions array
        this.selectedOptions.push(option.querySelector('span[title]').getAttribute('title'))
        this.selectedOptions.sort()

        // this.selectedCount = this.template.querySelectorAll('.slds-is-selected').length;
    }

    optionClicked(event) {
        const option = event.currentTarget;

        if (option.classList.contains('slds-is-selected')) {
            this.deselectOption(option);
        } else {
            this.selectOption(option);
        }

        this.selectedCount = this.template.querySelectorAll('.slds-is-selected').length;
        if (this.selectedOptions.length == 0) {
            this.dispatchEvent(new CustomEvent('change', { detail: { value: null } }));
        }else{
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.selectedOptions.join(', ') } }));
        }
    }


    blurHandler(event) {
        if (event.relatedTarget !== this.template.querySelector('[role="combobox"]')) {
            this.toggleDropdown();
        }
    }

    renderedCallback() {
        console.log('this.options: ',this.options)
        console.log('this.value: ',this.value)
        if (this.template.querySelectorAll('[title]').length == 0){
            this.selectedCount = this.template.querySelectorAll('.slds-is-selected').length;
            return
        }
        if (this.value)
            this.prefillSelectedOptions();
        else{
            // deselect all selected options if present
            // this.template.querySelectorAll('.slds-is-selected').forEach(option =>{
            //     this.deselectOption(option)
            // })
        }

        this.selectedCount = this.template.querySelectorAll('.slds-is-selected').length;
    }
}