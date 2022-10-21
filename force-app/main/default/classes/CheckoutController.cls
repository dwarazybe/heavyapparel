public with sharing class CheckoutController {

    @AuraEnabled
    public static List<String> getCountryOptions() {
        List<String> countryOptions = new List<String>();
        Schema.DescribeFieldResult fieldResult = Order.Country__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry picklistEntry : picklistEntries) {
            countryOptions.add(picklistEntry.getLabel());
        }
        return countryOptions;
    }

    @AuraEnabled
    public static List<String> getPaymentOptions() {
        List<String> paymentOptions = new List<String>();
        Schema.DescribeFieldResult fieldResult = Order.Payment_Method__c.getDescribe();
        List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry picklistEntry : picklistEntries) {
            paymentOptions.add(picklistEntry.getLabel());
        }
        return paymentOptions;
    }

    @AuraEnabled
    public static String createOrder(String street, String city, String province, String postalCode, String country, String paymentMethod) {
        Savepoint sp = null;
        try {
            sp = Database.setSavepoint();
            WebStore webStore = getWebStore();
            WebStorePricebook pricebook = getPricebook(webStore.Id);
            WebCart webCart = getWebCart();
            User user = getUser();
            List<CartItem> cartItems = getCartItems(webCart.Id);
            Set<Id> productIds = getProductIds(cartItems);
            List<PricebookEntry> pricebookEntries = getPricebookEntries(productIds, pricebook.Pricebook2Id);
            List<ProductAttribute> productAttributes = ProductHelper.getProductAttributes(productIds);

            Order order = new Order();
            order.AccountId = user.AccountId;
            order.BillingStreet = street;
            order.BillingCity = city;
            order.BillingState = province;
            order.BillingPostalCode = postalCode;
            order.BillingCountry = country;
            order.ShippingStreet = street;
            order.ShippingCity = city;
            order.ShippingState = province;
            order.ShippingPostalCode = postalCode;
            order.ShippingCountry = country;
            order.BillToContactId = user.ContactId;
            order.EffectiveDate = System.today();
            order.Pricebook2Id = pricebook.Pricebook2Id;
            order.Payment_Method__c = paymentMethod;
            order.Status = StoreConstants.ORDER_STATUS_DRAFT;
            insert order;

            List<OrderItem> orderItems = new List<OrderItem>();
            for(CartItem cartItem : cartItems) {
                PricebookEntry pricebookEntry = getPricebookEntry(pricebookEntries, cartItem.Product2Id);
                OrderItem orderItem = new OrderItem();
                orderItem.OrderId = order.Id;
                orderItem.PricebookEntryId = pricebookEntry.Id;
                orderItem.Product2Id = cartItem.Product2Id;
                orderItem.Quantity = cartItem.Quantity;
                orderItem.UnitPrice = pricebookEntry.UnitPrice;
                orderItem.Description = System.Label.HA_Size + ': ' + ProductHelper.getProductAttribute(productAttributes, cartItem.Product2Id).Size__c;
                orderItems.add(orderItem);
            }
            insert orderItems;

            order.Status = StoreConstants.ORDER_STATUS_ACTIVATED;
            update order;

            delete webCart;

            Order newOrder = [SELECT Id, OrderNumber FROM Order WHERE Id =: order.Id];

            return newOrder.OrderNumber;

        } catch(Exception e) {
            Database.rollback(sp);
            return e.getMessage();
        }
    }

    public static WebStore getWebStore() {
        List<WebStore> webStores = [SELECT Id, Name 
                                    FROM WebStore 
                                    WHERE Name =: StoreConstants.STORE_NAME];
        if(webStores.isEmpty()) {
            return null;
        }
        return webStores[0];
    }

    public static WebStorePricebook getPricebook(String storeId) {
        List<WebStorePricebook> webStorePricebooks = [SELECT Id, Pricebook2Id
                                                      FROM WebStorePricebook
                                                      WHERE WebStoreId =: storeId AND IsActive = true];
        if(webStorePricebooks.isEmpty()) {
            return null;
        }
        return webStorePricebooks[0];
    }

    public static User getUser() {
        List<User> users =  [SELECT Id, AccountId, ContactId
                             FROM User
                             WHERE Id =: UserInfo.getUserId()];
        if(users.isEmpty()) {
            return null;
        }
        return users[0];
    }

    public static WebCart getWebCart() {
        List<WebCart> webCarts = [SELECT Id, AccountId, Status, TotalAmount, TotalAmountAfterAllAdjustments, TotalChargeAmount
                                  FROM WebCart
                                  WHERE OwnerId =: UserInfo.getUserId()];
        if(webCarts.isEmpty()) {
            return null;
        }
        return webCarts[0];
    }

    public static List<CartItem> getCartItems(String cartId) {
        List<CartItem> cartItems = [SELECT Id, Name, CartId, ListPrice, Product2Id, Quantity, SalesPrice, TotalAmount,
                                           TotalLineAmount, TotalListPrice, TotalPriceAfterAllAdjustments
                                    FROM CartItem
                                    WHERE CartId =: cartId];
        return cartItems;
    }

    public static List<PricebookEntry> getPricebookEntries(Set<Id> productIds, Id pricebookId) {
        List<PricebookEntry> pricebookEntries = [SELECT Id, IsActive, UnitPrice, ProductCode, Product2Id, Pricebook2Id
                                                 FROM PricebookEntry
                                                 WHERE Product2Id IN: productIds AND Pricebook2Id =: pricebookId];
        return pricebookEntries;
    }

    public static Set<Id> getProductIds(List<CartItem> cartItems) {
        Set<Id> productIds = new Set<Id>(); 
        if(!cartItems.isEmpty()) {
            for(CartItem cartItem : cartItems) {
                productIds.add(cartItem.Product2Id);
            }
        }
        return productIds;
    }

    public static PricebookEntry getPricebookEntry(List<PricebookEntry> pricebookEntries, String productId) {
        if(!pricebookEntries.isEmpty()) {
            for(PricebookEntry pricebookEntry : pricebookEntries) {
                if(pricebookEntry.Product2Id == productId) {
                    return pricebookEntry;
                }
            }
        }
        return null;
    }
}
