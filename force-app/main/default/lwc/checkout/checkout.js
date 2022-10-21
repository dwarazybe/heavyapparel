import { LightningElement, track } from 'lwc';
import createOrder from '@salesforce/apex/CheckoutController.createOrder';
import getCountryOptions from '@salesforce/apex/CheckoutController.getCountryOptions';
import getPaymentOptions from '@salesforce/apex/CheckoutController.getPaymentOptions';
import HA_Empty_Fields_Warning from '@salesforce/label/c.HA_Empty_Fields_Warning';
import HA_Loading from '@salesforce/label/c.HA_Loading';
import HA_Proceed from '@salesforce/label/c.HA_Proceed';

export default class Checkout extends LightningElement {
    label = {
        HA_Empty_Fields_Warning,
        HA_Loading,
        HA_Proceed
    }
    error;
    isLoading;

    address = {
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
    };

    paymentMethod = '';

    @track countryOptions;
    @track paymentOptions;

    connectedCallback() {
        this.getCountryOptions();
        this.getPaymentOptions();
    }

    getPaymentOptions() {
        this.isLoading = true;
        getPaymentOptions({})
        .then((result) => {
            let paymentOptions = [];
            result.forEach(element => {
                paymentOptions.push({
                    label: element,
                    value: element
                });
            });
            this.paymentOptions = paymentOptions;
        }).catch((error) => {
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    getCountryOptions() {
        this.isLoading = true;
        getCountryOptions({})
        .then((result) => {
            let countryOptions = [];
            result.forEach(element => {
                countryOptions.push({
                    label: element,
                    value: element
                });
            });
            this.countryOptions = countryOptions;
        }).catch((error) => {
            this.error = error.message;
        }).finally(() => {
            this.isLoading = false;
        })
    }

    handleAddressChange(event) {
        this.address.street = event.detail.street;
        this.address.city = event.detail.city;
        this.address.postalCode = event.detail.postalCode;
        this.address.country = event.detail.country;
        this.address.province = event.detail.province;
    }

    handlePaymentMethodChange(event) {
        this.paymentMethod = event.detail.value;
    }

    handleProceed() {
        this.isLoading = true;
        if(this.areAllFieldsFilled()) {
            this.error = false;
            createOrder({
                street: this.address.street,
                city: this.address.city,
                province: this.address.province,
                postalCode: this.address.postalCode,
                country: this.address.country,
                paymentMethod: this.paymentMethod
            }).then((result) => {
                localStorage.setItem('orderNumber', result);
                this.isLoading = false;
                window.open('/s/order', '_top');
            }).catch((error) => {
                localStorage.setItem('errorMessage', error);
                this.isLoading = false;
                window.open('/s/error', '_top')
            });
        } else {
            this.error = this.label.HA_Empty_Fields_Warning;
            this.isLoading = false;
        }
    }

    areAllFieldsFilled() {
        return (Boolean(
            this.address.street && 
            this.address.city && 
            this.address.province && 
            this.address.postalCode && 
            this.address.country && 
            this.paymentMethod
        ));
    }
}