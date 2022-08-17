export const quotationTypedef = `
    type Quote {
        quotetogeocodeaccuracy:String
        discount:Float
        shippinglongitude:Float
        quotetocity:String
        quotetoname:String
        site_services_amount__c:Float
        site_service_fixed_discount__c:Float
        billingstatecode:String
        shippingstate:String
        quotetolatitude:Float
        igst__c:Float
        subtotal:Float
        totalprice:Float
        quotenumber:String
        site_services_pm_design_fee__c:Float
        site_services_amount_discounted__c:Float
        shippingpostalcode:String
        billingcity:String
        quote_link__c:String
        billingname:String
        quotetostatecode:String
        billinglatitude:Float
        accountid:String
        additionallongitude:Float
        billingcountrycode:String
        shippingcountry:String
        customer_email__c:String
        decor_amount_gst__c:Float
        shippinggeocodeaccuracy:String
        modular_fixed_discount__c:Float
        modular_amount_dis_incl_gst__c:Float
        additionalstate:String
        additionalstreet:String
        name:String
        tax:Float
        quotetocountrycode:String
        modular_discount__c:Float
        contractid:String
        modular_amount_gst__c:Float
        sgst__c:Float
        phone:String
        oppty_designer_email_add__c:String
        site_services_amount_incl_gst__c:Float
        opportunityid:String
        decor_amount_dis_incl_gst__c:Float
        additionalcountry:String
        quotetopostalcode:String
        isdeleted:Boolean
        additionalgeocodeaccuracy:String
        systemmodstamp:DateTime
        shippingstatecode:String
        modular_amount_discounted__c:Float
        decor_amount__c:Float
        modular_pm_design_fee__c:Float
        shippingstreet:String
        status:String
        additionalcity:String
        additionalname:String
        shippinghandling:Float
        additionallatitude:Float
        billingpostalcode:String
        billinglongitude:Float
        decor_amount_discount__c:Float
        shippingcountrycode:String
        decor_amount_discounted__c:Float
        modular_amount__c:Float
        createddate:DateTime
        billingstate:String
        additionalstatecode:String
        customer_name__c:String
        quotetolongitude:Float
        grandtotal:Float
        shippingcity:String
        shippingname:String
        site_services_amount_gst__c:Float
        site_services_discount__c:Float
        shippinglatitude:Float
        site_services_pdf__c:String
        quotetostate:String
        quotetostreet:String
        modular_amount_incl_gst__c:Float
        pricebook2id:String
        billingcountry:String
        contactid:String
        oppty_owner__c:String
        email:String
        description:String
        additionalcountrycode:String
        billinggeocodeaccuracy:String
        oppty_customer_email__c:String
        base_amount__c:Float
        issyncing:Boolean
        fax:String
        expirationdate:DateTime
        site_services_amount_dis_incl_gst__c:Float
        proposal_pdf__c:String
        cgst__c:Float
        send_notification_to_customer__c:Boolean
        billingstreet:String
        additionalpostalcode:String
        quotetocountry:String
        latest_quote__c:Boolean
        opportunity_amount__c:Float
        decor_amount_incl_gst__c:Float
        sfid:String
        id:Int!
        hc_lastop:String
        hc_err:String
        dc_modular_xml__c:String
        dc_site_service_xml__c:String
        dc_room_list__c: String
        change_request_list__c: String
        total_calculated_value__c: Float
        total_amount__c: Float
        postgres_id__c: String
        is_imos_project__c: Boolean
    }

    type proposalSignedUrlResponse{
        code: Int
        message: String
        data: JSON
    }

    type postBetaQuoteResponse{
        code:Int
        message:String
        quoteid:String
    }

    type saveBetaQuoteDetailsResponse{
        code: Int
        message: String
    }

    type UpdateQuoteDetailsResponse{
        code: Int
        message: String
        data: String
    }

    type ValidateXmlResponse{
        code: Int
        message: String
        data: XmlResponse
    }

    type XmlResponse{
        customerName: String
        attachment: String
        filekey: String
        location: String
        modularValue: Float
        modularDiscountValue: Int
        modularFixedDiscount: Int
        modularBaseAmount: Float
        modularTotalTax: Float
        modularTotalAmount: Float
        modularDiscountedAmount: Float
        siteServiceValue: Float
        siteServiceDiscountValue: Int
        siteServiceFixedDiscount: Int
        siteServiceBaseAmount: Float
        siteServiceTotalTax: Float
        siteServiceTotalAmount: Float
        siteServiceDiscountedAmount: Float
    }

    type XmlResponseProject{
        customerName: String
        attachment: String
        filekey: String
        modularValue: Float
        modularDiscountValue: Int
        modularFixedDiscount: Int
        modularBaseAmount: Float
        modularTotalTax: Float
        modularTotalAmount: Float
        modularDiscountedAmount: Float
        siteServiceValue: Float
        siteServiceDiscountValue: Int
        siteServiceFixedDiscount: Int
        siteServiceBaseAmount: Float
        siteServiceTotalTax: Float
        siteServiceTotalAmount: Float
        siteServiceDiscountedAmount: Float
        totalProjectValue: Float
        achievedRevenueValue: Float
        pendingAmountValue: Float
    }

    type postRoomwiseXmlResponse{
        code: Int
        message: String
        data: XmlResponseProject
    }

    type UpdateDiscountResponse{
        code: Int
        message: String
        data: JSON
    }

    type updateProjectCommercialResponse{
        code: Int
        message: String
        data: JSON
    }

    type deleteRoomwiseResponse{
        code: Int
        message: String
        data: JSON
    }

    type acceptProposalResponse {
        code: Int
        message: String
    }

    type Mutation{
        validateXmlApi(
            base64File: String!
            fileName: String!
            contentType: String!
            modular: Boolean
            siteService: Boolean
            leadId: String!
        ):ValidateXmlResponse

        acceptProposal(
            quoteId: String!,
            proposalStatus: String!,
            ): acceptProposalResponse

        proposalSignedUrl(
            key:String!,
            contentType:String!,
            base64:String!,leadId:String!): proposalSignedUrlResponse

        postBetaQuote(
            opportunityid: String!
            name: String!
            modularAmount: Float!,
            modularDiscount: Int!,
            modularFixedDiscount: Int!,
            siteServiceValue: Float,
            siteServiceDiscount: Int,
            siteServiceFixedDiscount: Int,
            decorValue: Float,
            proposal_link: String!
            contentType: String
            key: String
        ): postBetaQuoteResponse

        saveBetaQuoteApi(
            postgresId: String!,
            opportunityId: String!
            customerName: String!
            name: String!
            modularAmount: Float!,
            modularDiscount: Int!,
            siteServiceValue: Float,
            siteServiceDiscount: Int,
            modulerXmlLink: String!,
            siteServiceXmlLink: String,
            proposalKey: String!,
            proposalLocation: String!
        ): saveBetaQuoteDetailsResponse
        
        UpdateQuoteDetails(
            modularDiscount:Int
            modularFixedDiscount: Int
            siteServiceDiscount:Int
            siteServiceFixedDiscount: Int
            opportunityId:String!
            updateSiteService:Boolean
            updateModular:Boolean
            modulerXmlLink: String
            siteServiceXmlLink: String
            quoteId: String!
            name:String!
        ): UpdateQuoteDetailsResponse

        PostRoomwiseXmlApi(
            base64File: String!
            fileName: String!
            contentType: String!
            projectId: Int!
        ):postRoomwiseXmlResponse

        deleteRoomwise(
            roomType: String!
            ddQuoteId: Int!
        ):deleteRoomwiseResponse

        updateDiscountGeneratePdf(
            modularDiscount: Int
            projectId: Int!
            siteServiceDiscount: Int
            opportunityId: String!
            modularFixedDiscount: Int
            siteServiceFixedDiscount: Int
        ):UpdateDiscountResponse

        updateProjectCommercial(
            projectId: Int!
            projectModularValue: Float!
            projectSiteServicesValue: Float!
            projectPendingAmount: Float!
            totalProjectValue: Float!
            projectAchievedRevenue: Float!
            modularDiscount: Int!
            civilDiscount: Int
            isImosProject: Boolean
            modularPdfJson: pdfRequest
            siteServicePdfJson: pdfRequest
        ):updateProjectCommercialResponse
    }

    input pdfRequest{
        fileKey: String!
        location:String!

    }

    type getRoomlistResponse{
        code: Int,
        message: String,
        data: [JSON]
    }

    type QuotationResponse { 
        code:Int
        message: String
        quotes: [Quote]
    }
    type QuotationByIdResponse { 
        code:Int
        message: String
        quotes: Quote
    }

    type Query{
        getRoomList(
            isPreSales: Boolean!,
            quoteSfId: String,
            quoteId: Int
        ):getRoomlistResponse
        getQuotation(opportunitysfid: String): QuotationResponse
        getQuotationById(quoteid:Int): QuotationByIdResponse
    }

    scalar JSON
    scalar DateTime
`;
