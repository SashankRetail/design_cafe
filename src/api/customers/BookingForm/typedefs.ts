export const bookingFormTypedef = `

type acc{
    sfid: String!
    name : String
    personemail :  String
    personmobilephone : String
    pan__c : String
    gst_no__c : String
    shippingstreet  :String
    shippingcity  :String
    shippingstate  :String
    shippingpostalcode :String
    shippingcountry  :String
    billingstreet  :String
    billingcity  :String
    billingstate   :String
    billingcountry  :String
    billingpostalcode : String
} 

type opportunity{
    sfid:  String
    customer_id__c : String
    home_type__c : String
    scope_of_work__c : String
    civil_work__c : Boolean
    proposed_budget__c :Float
    amount : Float
    modular_discount__c : Float
    modular_amount_dis_incl_gst__c: Float
    civil_discount__c : Float
    site_services_amount_dis_incl_gst__c :Float
    decor_amount_incl_gst__c :Float
    initial_payment__c :Float
    signup_amount__c : Float
    frames_for_all_external_doors_windows__c :Boolean
    the_doors_windows_are_installed_requir__c : Boolean
    all_walls_are_completed_required__c : Boolean
    putty_and_1_coat_of_plastering_required__c :Boolean
    floors_are_levelled_out_prepped_basic__c :Boolean
    flooring_is_completed_required__c :Boolean
    notes__c : String
    wohoo_card__c : String
    remarks_for_marketing__c : String
}

type sales{
    name  : String
    email  : String
    mobilephone : String
}

type bookingformstatus{
    bookingformstatus :String
}
    type getBookingFormResponseObj {
        code: Int
        message: String
        user_details: acc
        opportunity_details:opportunity
        quote_details: Quote
        sales_manager_details:sales
        bookingformstatus:bookingformstatus
    }
    
    type Query {
        getBookingForm: getBookingFormResponseObj
    }

    type updateBookingFormResponse{
        code: Int
        message: String
    }

    type sfResponse{
        code: Int
        message: String,
    }

    type Mutation{
        acceptBookingForm(
        modularAmount: Float
        isEdit : Boolean
        dcCode : String
        closeDate : DateTime
        clientName : String
        phoneNumber : String
        emailId: String
        projectType : String
        scopeOfWork : String
        civilWorkRequired : Boolean
        currentAddress : JSON
        projectAddress : JSON
        proposedValue : Float
        signupValue : Float
        modularDiscount : Float
        siteServicesDiscount : Float
        siteServicesAmount : Float
        decorAmount : Float
        fivePercentageProjectValue : Float
        signupAmount : Float
        basicFramesofExternalDoorsAndWindows:Boolean
        reqdDoorsAndWindowsInstalled :Boolean
        basicAllWallsCompleted :Boolean
        reqdPuttyCoatOfPlasteringOnWalls:Boolean
        basicFloorsLeveledOutAndPrepped:Boolean
        reqdFlooringIsCompleted:Boolean
        notes: String
        pan: String
        gst: String
        wohooCard:String
        remarkFromSales:String
        salesManagerName:String
        salesManagerMobile:String
        salesManagerEmail:String
        ):sfResponse

        updateBookingFormStatus(
            customerphone: String!
            bookingformstatus: String!
        ):updateBookingFormResponse
    }
    scalar DateTime
`;
