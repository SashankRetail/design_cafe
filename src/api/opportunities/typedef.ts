export const opportunityTypedef = `
    type Opportunity{
        sfid:String
        id:Int
        name:String
        stagename:String
        team__c:String
        lead_id__c:String
        design_user__c:String
        design_user_name__c: String
        client_s_budget__c:Float
        signup_amount__c:Float
        amount:Float
        proposed_budget__c:Float
        studio_name__c:String
        mobile__c:String
        meeting_venue__c:String
        createddate:DateTime
        region__c:String
    }

    type GetOpportunityById{
        sfid:String
        name:String
        email__c:String
        mobile__c:String
        customer_id__c:String
        amount:Float
        stagename:String
        salesmanagername__c:String
        property_address__c:String
        home_type__c:String
        studio_name__c:String
        designer_user__c:String
        client_s_budget__c:String
        designerUser:Users
        region__c:String
        createddate:DateTime
    }

    type AssignDesignerToOpportunityResponse{
        code:Int
        message:String
    }

    type GetMyOpportunity{
        code:Int,
        message:String,
        data:[Opportunity]
    }

    type GetOpportunityDetailsByIdResponse{
        code:Int,
        message:String,
        data:GetOpportunityById
    }

    type Query{
        getMyOpportunities(
            searchText:String,
            filterPreset:Int,
            fromDate:DateTime,
            toDate:DateTime,
            designerNames:[String],
            stageNames:[String],
            experienceCenters:[String],
            regions:[String],
            teams:[String],
            sortByMeetingScheduled:String,
            sortByName:String):GetMyOpportunity
        
        getOpportunityDetailsById(opportunityId:String):GetOpportunityDetailsByIdResponse
    }

    type Mutation{
        assignDesignerToOpportunity(opportunitySFId:String,designerSFId:String):AssignDesignerToOpportunityResponse
    }

    scalar DateTime
`;
