import { LightningElement, api } from 'lwc';
import getProductDetails from '@salesforce/apex/ProductDetailsController.getProductDetails';
import HA_No_Details from '@salesforce/label/c.HA_No_Details';
import HA_Details from '@salesforce/label/c.HA_Details';
import HA_Brand from '@salesforce/label/c.HA_Brand';
import HA_Properties from '@salesforce/label/c.HA_Properties';
import HA_Material from '@salesforce/label/c.HA_Material';
import HA_Certification from '@salesforce/label/c.HA_Certification';

export default class ProductDetails extends LightningElement {
    label = {
        HA_No_Details,
        HA_Details,
        HA_Brand,
        HA_Properties,
        HA_Material,
        HA_Certification
    }
    @api recordId;
    error;
    productDetails;

    connectedCallback() {
        this.getDetails();
    }

    get detailsToShow() {
        return this.productDetails !== undefined && this.productDetails != null;
    }

    getDetails() {
        if(this.recordId) {
            getProductDetails({
                productId: this.recordId
            }).then((result) => {
                this.productDetails = result;
                this.error = undefined;
            }).catch((error) => {
                this.error = error.message;
            });
        } else {
            return;
        }
    }
}