public without sharing class ProductDetailsController {
    
    @AuraEnabled
    public static Product2 getProductDetails(Id productId) {
        List<Product2> products = [SELECT Id, ProductClass, Brand__c, Material__c, Properties__c, Certification__c 
                                   FROM Product2 
                                   WHERE Id =: ProductHelper.getBasicProductId(productId)];
        if(products.isEmpty()) {
            return null;
        }
        return products[0];
    }

    @AuraEnabled
    public static String getProductDescription(Id productId) {
        List<Product2> products = [SELECT Id, ProductClass, Description 
                                   FROM Product2 
                                   WHERE Id =: ProductHelper.getBasicProductId(productId)];
        if(products.isEmpty()) {
            return null;
        }
        return products[0].Description;
    }
    
    @AuraEnabled
    public static List<Product_Review__c> getAllReviews(Id productId) {
        List<Product_Review__c> productReviews = [SELECT Id, Comment__c, Rating__c, Product__c, Status__c, 
                                                         CreatedBy.Id, CreatedById, CreatedBy.Name, CreatedBy.SmallPhotoUrl 
                                                  FROM Product_Review__c 
                                                  WHERE Product__c =: ProductHelper.getBasicProductId(productId) AND 
                                                        Status__c =: StoreConstants.RECORD_APPROVED_STATUS
                                                  ORDER BY CreatedDate DESC];
        if(productReviews.isEmpty()) {
            return null;
        }
        return productReviews;
    }
}
