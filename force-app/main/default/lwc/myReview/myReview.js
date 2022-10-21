import { LightningElement, api, track } from 'lwc';
import LightningConfirm from 'lightning/confirm';
import getReview from '@salesforce/apex/MyReviewController.getReview';
import postReview from '@salesforce/apex/MyReviewController.postReview';
import editReview from '@salesforce/apex/MyReviewController.editReview';
import deleteReview from '@salesforce/apex/MyReviewController.deleteReview';
import getRatingOptions from '@salesforce/apex/MyReviewController.getRatingOptions';
import getUser from '@salesforce/apex/MyReviewController.getUser';
import HA_Delete_Review_Confirmation from '@salesforce/label/c.HA_Delete_Review_Confirmation';
import HA_Delete_Review from '@salesforce/label/c.HA_Delete_Review';
import HA_Empty_Fields_Warning from '@salesforce/label/c.HA_Empty_Fields_Warning';
import HA_Approved from '@salesforce/label/c.HA_Approved';
import HA_Loading from '@salesforce/label/c.HA_Loading';
import HA_My_Review from '@salesforce/label/c.HA_My_Review';
import HA_Cancel from '@salesforce/label/c.HA_Cancel';
import HA_Confirm from '@salesforce/label/c.HA_Confirm';
import HA_Post from '@salesforce/label/c.HA_Post';
import HA_Edit from '@salesforce/label/c.HA_Edit';
import HA_Delete from '@salesforce/label/c.HA_Delete';

export default class CreateReview extends LightningElement {
    label = {
        HA_Delete_Review_Confirmation,
        HA_Delete_Review,
        HA_Empty_Fields_Warning,
        HA_Approved,
        HA_Loading,
        HA_My_Review,
        HA_Cancel,
        HA_Confirm,
        HA_Post,
        HA_Edit,
        HA_Delete
    }
    isLoading;
    error;
    @api recordId;
    @track ratingOptions;
    user;
    review;
    reviewId;
    reviewRollback;
    reviewApproved = true;
    rating;
    comment;
    editModeEnabled = false;

    connectedCallback() {
        this.getUser();
        this.getRatingOptions();
        this.getReview();
    }

    getRatingOptions() {
        this.isLoading = true;
        getRatingOptions({})
        .then((result) => {
            let ratingOptions = [];
            result.forEach(element => {
                ratingOptions.push({
                    label: element,
                    value: element
                });
            });
            this.ratingOptions = ratingOptions;
        }).catch((error) => {
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    handleRatingChange(event) {
        this.rating = event.detail.value;
    }

    handleCommentChange(event) {
        this.comment = event.detail.value;
    }

    async handleDelete() {
        const result = await LightningConfirm.open({
            message: this.label.HA_Delete_Review_Confirmation,
            variant: 'header',
            label: this.label.HA_Delete_Review,
        });
        if(result) {
            this.deleteReview();
        }
    }

    handlePostReview() {
        this.postReview();
    }

    handleEdit() {
        this.reviewRollback = this.review;
        this.editModeEnabled = true;
        this.reviewId = this.review.Id;
        this.rating = this.review.Rating__c;
        this.comment = this.review.Comment__c;
        this.review = null;
    }

    handleEditReview() {
        this.editReview();
        this.editModeEnabled = false;
    }

    handleCancelEditReview() {
        this.review = this.reviewRollback;
        this.editModeEnabled = false;
    }

    getUser() {
        this.isLoading = true;
        getUser({})
        .then((result) => {
            this.user = result;
            this.error = undefined;
        }).catch((error) => {
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    getReview() {
        this.isLoading = true;
        getReview({
            productId: this.recordId
        }).then((result) => {
            this.review = result;
            this.checkIfReviewIsApproved(result);
            this.error = undefined;
        }).catch((error) => {   
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    deleteReview() {
        this.isLoading = true;
        deleteReview({
            reviewId: this.review.Id
        }).then((result) => {
            if(result) {
                this.reviewApproved = true;
                this.review = null;
                this.error = undefined;
            }
        }).catch((error) => {
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    postReview() {
        this.isLoading = true;
        if(this.areAllFieldsFilled()) {
            postReview({
                productId: this.recordId,
                rating: this.rating,
                comment: this.comment
            }).then((result) => {
                this.review = result;
                this.checkIfReviewIsApproved(result);
                this.error = undefined;
                this.rating = undefined;
                this.comment = undefined;
            }).catch((error) => {
                this.error = error.message;
            }).finally(() => {
                this.isLoading = false;
            })
        } else {
            this.error = this.label.HA_Empty_Fields_Warning;
            this.isLoading = false;
        }
    }

    editReview() {
        this.isLoading = true;
        if(this.areAllFieldsFilled()) {
            editReview({
                reviewId: this.reviewId,
                rating: this.rating,
                comment: this.comment
            }).then((result) => {
                this.review = result;
                this.checkIfReviewIsApproved(result);
                this.error = undefined;
                this.rating = undefined;
                this.comment = undefined;
            }).catch((error) => {
                this.error = error.message;
            }).finally(() => {
                this.isLoading = false;
            })
        } else {
            this.error = this.label.HA_Empty_Fields_Warning;
            this.isLoading = false;
        }
    }

    checkIfReviewIsApproved(review) {
        if(review != null) {
            if(review.Status__c !== this.label.HA_Approved) {
                this.reviewApproved = false;
            }
        }
    }

    areAllFieldsFilled() {
        return (Boolean(this.rating && this.comment));
    }
}