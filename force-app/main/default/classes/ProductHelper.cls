public with sharing class ProductHelper {

    public static Id getProductVariantParentId(Id productId) {
        List<ProductAttribute> productAttributes = [SELECT Id, ProductId, VariantParentId 
                                                    FROM ProductAttribute 
                                                    WHERE ProductId =: productId];
        if(productAttributes.isEmpty()) {
            return null;
        }
        return productAttributes[0].VariantParentId;
    }

    public static Id getBasicProductId(Id productId) {
        List<Product2> products = [SELECT Id, ProductClass FROM Product2 WHERE Id =: productId];
        if(products.isEmpty()) {
            return null;
        }
        if(products[0].ProductClass == StoreConstants.VARIATION_PARENT_CLASS_NAME) {
            return productId;
        } else {
            return getProductVariantParentId(productId);
        }
    }

    public static List<ProductAttribute> getProductAttributes(Set<Id> productIds) {
         List<ProductAttribute> productAttributes = [SELECT Id, ProductId, Size__c
                                                     FROM ProductAttribute
                                                     WHERE ProductId IN: productIds];
        if(productAttributes.isEmpty()) {
            return null;
        }
        return productAttributes;
    }

    public static ProductAttribute getProductAttribute(List<ProductAttribute> productAttributes, String productId) {
        if(!productAttributes.isEmpty()) {
            for(productAttribute productAttribute : productAttributes) {
                if(productAttribute.ProductId == productId) {
                    return productAttribute;
                }
            }
        }
        return null;
    }
}
