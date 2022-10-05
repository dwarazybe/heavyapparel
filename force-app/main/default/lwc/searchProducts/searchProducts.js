import { LightningElement, track } from 'lwc';
import getProducts from '@salesforce/apex/ProductDataService.getProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SearchProducts extends LightningElement {
    @track
    products
}