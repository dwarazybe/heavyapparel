import { LightningElement, api } from 'lwc';
import getAllReviews from '@salesforce/apex/ProductDetailsController.getAllReviews';
import Id from '@salesforce/user/Id';
import HA_Community_Reviews from '@salesforce/label/c.HA_Community_Reviews';
import HA_No_Reviews from '@salesforce/label/c.HA_No_Reviews';
import HA_Average_Rating from '@salesforce/label/c.HA_Average_Rating';

export default class ProductReviews extends LightningElement {
    label = {
        HA_Community_Reviews,
        HA_No_Reviews,
        HA_Average_Rating
    }
    @api recordId;
    userId = Id;
    error;
    productReviews;
    reviewsToDisplay;
    averageRating;

    connectedCallback() {
        this.getAllReviews();
    }

    get reviewsToShow() {
        return this.productReviews !== undefined && this.productReviews != null && this.productReviews.length > 0;
    }

    getAllReviews() {
        if(this.recordId) {
            getAllReviews({
                productId: this.recordId
            }).then((result) => {
                this.setAverageRating(result);
                this.setProductReviews(result);
                this.error = undefined;
            }).catch((error) => {
                this.error = error.message;
            });
        } else {
            return;
        }
    }

    setProductReviews(reviews) {
        let productReviews = [];
        for(let i = 0; i < reviews.length; i++) {
            if(reviews[i].CreatedById != this.userId) {
                productReviews.push(reviews[i]);
            }
        }
        this.productReviews = productReviews;
    }

    setAverageRating(reviews) {
        if(reviews.length > 0) {
            let ratingSum = 0.0;
            for(let i = 0; i < reviews.length; i++) {
                ratingSum += parseFloat(reviews[i].Rating__c);
            }
            this.averageRating = Math.round((ratingSum / reviews.length) * 10) / 10;
        }
    }

    
}