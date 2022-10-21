public with sharing class MyReviewController {

    private final static String VARIATION_PARENT_CLASS_NAME = 'VariationParent';
    
    @AuraEnabled
    public static List<String> getRatingOptions() {
        List<String> ratingOptions = new List<String>();
        Schema.DescribeFieldResult fieldResult = Product_Review__c.Rating__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry picklistEntry : picklistEntries) {
            ratingOptions.add(picklistEntry.getLabel());
        }
        return ratingOptions;
    }

    @AuraEnabled
    public static User getUser() {
        List<User> users = [SELECT Id, Name, SmallPhotoUrl 
                            FROM User 
                            WHERE Id =: UserInfo.getUserId()];
        if(users.isEmpty()) {
            return null;
        }
        return users[0];
    }

    @AuraEnabled
    public static Product_Review__c getReview(String productId) {
        List<Product_Review__c> productReviews = [SELECT Id, Comment__c, Rating__c, Product__c, Status__c, CreatedBy.Id, CreatedBy.Name, CreatedBy.SmallPhotoUrl 
                                                  FROM Product_Review__c 
                                                  WHERE Product__c =: ProductHelper.getBasicProductId(productId) AND CreatedById =: UserInfo.getUserId()];
        if(productReviews.isEmpty()) {
            return null;
        }
        return productReviews[0];
    }

    @AuraEnabled
    public static Product_Review__c postReview(String productId, String rating, String comment) {
        try {
            Product_Review__c productReview = new Product_Review__c();
            productReview.Product__c = ProductHelper.getBasicProductId(productId);
            productReview.Rating__c = rating;
            productReview.Comment__c = comment;
            insert productReview;

            List<Product_Review__c> postedReviews = [SELECT Id, Comment__c, Rating__c, Product__c, Status__c, 
                                                            CreatedBy.Id, CreatedBy.Name, CreatedBy.SmallPhotoUrl 
                                                     FROM Product_Review__c 
                                                     WHERE Id =: productReview.Id];
            if(postedReviews.isEmpty()) {
                return null;
            }
            return postedReviews[0];
        } catch(Exception e) {
            return null;
        }
    }

    @AuraEnabled
    public static Product_Review__c editReview(String reviewId, String rating, String comment) {
        try {
            List<Product_Review__c> productReviews = [SELECT Id, Comment__c, Rating__c, Product__c, Status__c, 
                                                             CreatedBy.Id, CreatedBy.Name, CreatedBy.SmallPhotoUrl 
                                                      FROM Product_Review__c 
                                                      WHERE Id =: reviewId];
            if(productReviews.isEmpty()) {
                return null;
            }
            Product_Review__c productReview = productReviews[0];
            productReview.Rating__c = rating;
            productReview.Comment__c = comment;
            update productReview;

            return productReview;
        } catch(Exception e) {
            return null;
        }
    }

    @AuraEnabled
    public static Boolean deleteReview(String reviewId) {
        try {
            List<Product_Review__c> productReviews = [SELECT Id FROM Product_Review__c WHERE Id =: reviewId];
            if(productReviews.isEmpty()) {
                return false;
            }
            Product_Review__c productReview = productReviews[0];
            delete productReview;

            return true;
        } catch(Exception e) {
            return false;
        }
    }
}
