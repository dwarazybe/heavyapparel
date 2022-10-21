import { LightningElement, api } from 'lwc';
import getProductDescription from '@salesforce/apex/ProductDetailsController.getProductDescription';
import HA_Product_No_Description from '@salesforce/label/c.HA_Product_No_Description';
import HA_Description from '@salesforce/label/c.HA_Description';

export default class ProductDescription extends LightningElement {
    label = {
        HA_Product_No_Description,
        HA_Description
    }
    @api recordId;
    error;
    productDescription;

    connectedCallback() {
        this.getDescription();
    }

    get descriptionToShow() {
        return this.productDescription !== undefined && this.productDescription != null;
    }

    getDescription() {
        if(this.recordId) {
            getProductDescription({
                productId: this.recordId
            }).then((result) => {
                this.productDescription = result;
                this.error = undefined;
            }).catch((error) => {
                this.error = error.message;
            });
        } else {
            return;
        }
    }
}