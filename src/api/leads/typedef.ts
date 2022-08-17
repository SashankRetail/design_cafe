export const leadsTypedef = `
    type Leads{
        sfid:String
        id:Int
        firstname:String
        lastname:String
        middlename:String
        mobilephone:String
        status:String
        dsa_code__c:String
        designer_team_name__c:String
        name:String
        region__c:String
        broadcast_status__c:String
        willingness_for_meeting__c: DateTime
        meeting_venue__c: String,
        design_user__c:String,
        has_designer_accepted__c:String
        meeting_type__c:String     
        approx_budget__c:String
        design_user_name__c:String
        email:String
        propertyaddress__c:String
        property_type__c:String
        rejected_by__c:String 
        client_s_budget__c:Float
        lead_owner_name__c:String
        home_type__c: String
    }

    type RequirementFormDD {
        id: Int
        requirementformdetails: JSON
        user: Int
        leadid: Int
        created_at: DateTime
        updated_at: DateTime
    }

    type LeadsResponse{
        code:Int
        message:String,
        data:[Leads]
    }

    type AcceptLeadsResponse{
        code:Int
        message:String,
        data:Leads
    }

    type LeadDetailsRepsone{
        code:Int
        message:String,
        data:Leads
    }

    type AssignTeamsToLeadResponse{
        code:Int
        message:String
    }
    type requirementFormDDResponse { 
        code:Int
        message: String
        data:RequirementFormDD
    }
    type updateDesignerResponse { 
        code:Int
        message: String
    }
    type uploadLeadFilesResponse { 
        code:Int
        message: String
        data:[JSON]
    }
    type uploadFilesResponse { 
        code:Int
        message: String
        data:JSON
    }

    type LeadFiles {
        id: Int
        filekey: String
        contenttype: String
        location: String
        leadid: String
        opportunityid: String
        uploadedby: String
        created_at: DateTime
    }
    type getLeadFilesResponse { 
        code:Int
        message: String
        data:[LeadFiles]
    }

    type Mutation{
        acceptRejectLeads(isAccept:Int,leadSfId:String):AcceptLeadsResponse
        assignDesigerToLeads(userId:Int,leadSfId:String,designerToBeAssigned:String):AcceptLeadsResponse
        assignTeamsToLead(leadId:String):AssignTeamsToLeadResponse
        editRequirements(requirementdetails:JSON!,leadid:Int!,requirementid:Int):requirementFormDDResponse
        updateDesigner(designerId:Int!,leadSfId:String):updateDesignerResponse
        uploadLeadFiles(leadAttachment:[JSON],leadid:String,opportunityid: String):uploadLeadFilesResponse
        uploadFilesInLeads(leadid:String, opportunityid:String, base64:String, filekey:String, contentType:String): uploadFilesResponse
    }

    type Query{
        getBroadcastLeadsForUser:LeadsResponse
        getLeadDetailsById(leadid:String):LeadDetailsRepsone
        getMyLeads(searchText:String,
                    filterPreset:Int,
                    fromDate:DateTime,
                    toDate:DateTime,
                    teamNames:[String],
                    designerNames:[String],
                    citys:[String],
                    experienceCenters:[String],
                    sortByMeetingScheduled:String,
                    sortByName:String):LeadsResponse
        getRequirements(leadid:Int,opportunityid:String):requirementFormDDResponse
        getLeadAttachments(leadid:String,opportunityid:String,type:Int!):getLeadFilesResponse

    }

    scalar DateTime
`;
