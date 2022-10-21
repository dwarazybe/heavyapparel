import { LightningElement } from 'lwc';
import HA_Order_Submitted_Success from '@salesforce/label/c.HA_Order_Submitted_Success';
import HA_Order_Number from '@salesforce/label/c.HA_Order_Number';
import HA_Order_Submitted_Info from '@salesforce/label/c.HA_Order_Submitted_Info';

export default class OrderConfirmation extends LightningElement {
    label = {
        HA_Order_Submitted_Success,
        HA_Order_Number,
        HA_Order_Submitted_Info
    }
    orderNumber;

    get orderNumberLoaded() {
        return this.orderNumber !== undefined && this.orderNumber != null;
    }

    connectedCallback() {
        this.orderNumber = localStorage.getItem('orderNumber');
    }
}