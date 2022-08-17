export const projectsTypedef = `

type Projects {
    id : Int
    projectid : String
    projectname : String
    projectstatus : String
    projectvalue : Float
    createdate : DateTime
    updatedate : DateTime
    signupdate : DateTime
    customerid : Int
    designerid : Int
    salesmanagerid : Int
    chmid : Int
    surveyexecutiveid : Int
    projectmanagerid : Int
    designstudioid : Int
    modularbaseamount : Float
    modularvalue : Float
    modulardiscount : Float
    siteservicebaseamount : Float
    siteservicevalue : Float
    siteservicediscount : Float
    signupamount : Float
    signupstate : String
    experiencecenterid : Int
    cityid : Int
    clientid : String
    projectaddressid : Int
    cmmname : String
    expectedhandoverdate : DateTime
    currentmilestone : String
    projectphase : String
    hasdesigneraccepted : Boolean
    hasdesigerresponded : Boolean
    hometype : String
    initialsignupvalue : Float
    quoteid : Int
    projectrating : Int
    includepmfee : Boolean
    milestonetype : String
    odooid : String
    odoo_delivery_address_id : String
    isnewpaymentproject : Boolean
    opportunityid : String
    template : String
    milestones:JSON
    projectdecorvalue:Float
    decorvalue: Float
    addonvalue : Float
    totalprojectvalue : Float
    achievedrevenuevalue : Float
    projectmodularvalue :Float
    projectsiteservicesvalue :Float
    pendingamountvalue  : Float
    smartsheetid : String
    paymentrequests : JSON
    iscustomersignoffrequired :Boolean
    modular_collected_amount :Float
    site_services_collected_amount: Float
    isimosproject:Boolean
    valuebeforediscount:Float
    siteaddress:String
    haslift:Boolean
    hasfalseceiling:Boolean
    scopeforelectricalwork:Boolean
    projecttype:String
    tentativeprojectdurationaftersignoff:String
    scopeofwork:String
    specialfinishes:String
    siteserviceabsolutediscount: Int
    modularamountgst:Float
    siteserviceamountgst:Float
    modularabsolutediscount:Float
    modularpmfee:Float
    siteservicegst:Int
    siteservicepdflink:String
    modularamountgstvalue:Float
    sitepmfee:Float
    siteservicediscountvalue:Float
    quotelink:String
    proposalpdflink:String
    projectmanagername:String
    floorarea:Int
    imosrooms:[ImosRoom]
    projectHandOverDate:DateTime
    customer : Customer
    designer : Users
    salesmanager : Users
    chm : Users
    surveyexecutive : Users
    projectmanager : Users
    designstudio : Teams
    experiencecenter : ExperienceCenters
    city : Cities
}

type ImosRoom{
    imosOrdeNo:String
    roomUrl:String
}

input ImosRooms{
    imosOrdeNo:String
    roomUrl:String
}

input FormFillInputs{
    pmName:String,
    valueBeforeDiscount:Float
    projectHandOverDate:DateTime
    siteAddress:String
    isProjectIMOS:Boolean
    hasLift:Boolean
    hasFalseCeiling:Boolean
    scopeForElectricalWork:Boolean
    projectType:String
    tentativeProjectDurationAfterSignOff:String
    scopeOfWork:String
    specialFinishes:String
    dateTimeOfVisit:DateTime,
    floorArea:Int,
    imosRooms:[ImosRooms]
}

type Milestone{
    label:String
    payment_percentage:Int
    milestone_checklist:[MilestoneChecklist]
    autorequest:Boolean
    InvoicePercentage:Int
}

type MilestoneChecklist{
    checklist_string:String
    description:String
    required:Boolean
    is_checked:Boolean
    dateTime:DateTime
}

type Files{
    checklist_string:String
    description:String
    required:Boolean
    filekey:String
    fileurl:String
    uploadedby:String
    uploadedon:DateTime
    updatedon:DateTime
    approvalstatus:String
    created_at:String
    updated_at:String
    share_with_customer:Boolean
}

type Mutation{
    addProject(
        projectid : String!,
        projectname : String!,
        projectstatus : String!,
        projectvalue : Float!,
        createdate : DateTime,
        updatedate : DateTime,
        signupdate : DateTime,
        customerid : Int!,
        designerid : Int!,
        salesmanagerid : Int,
        chmid : Int,
        surveyexecutiveid : Int,
        projectmanagerid : Int,
        designstudioid : Int,
        modularbaseamount : Float,
        projectmodularvalue : Float,
        modulardiscount : Float,
        siteservicebaseamount : Float,
        siteservicevalue : Float,
        siteservicediscount : Float,
        signupamount : Float!,
        signupstate : String,
        experiencecenterid : Int,
        cityid : Int,
        projectaddressid : Int,
        cmmname : String,
        expectedhandoverdate : DateTime,
        currentmilestone : String,
        projectphase : String,
        hasdesigneraccepted : Boolean,
        hasdesigerresponded : Boolean,
        hometype : String,
        initialsignupvalue : Float,
        decorvalue : Float,
        quoteid : Int,
        projectrating : Int,
        includepmfee : Boolean,
        milestonetype : String,
        odooid : String,
        odoo_delivery_address_id : String,
        isnewpaymentproject : Boolean,
        opportunityid : String!,
        template : String,
        isimosproject: Boolean,
    ): projectsResponse

    updateProjectApi(
        id : Int,
        projectid : String,
        projectname : String,
        projectstatus : String,
        projectvalue : Float,
        createdate : DateTime,
        updatedate : DateTime,
        signupdate : DateTime,
        customerid : Int,
        designerid : Int,
        salesmanagerid : Int,
        chmid : Int,
        surveyexecutiveid : Int,
        projectmanagerid : Int,
        designstudioid : Int,
        modularbaseamount : Float,
        projectmodularvalue : Float,
        modulardiscount : Float,
        siteservicebaseamount : Float,
        siteservicevalue : Float,
        siteservicediscount : Float,
        signupamount : Float,
        signupstate : String,
        experiencecenterid : Int,
        cityid : Int,
        projectaddressid : Int,
        cmmname : String,
        expectedhandoverdate : DateTime,
        currentmilestone : String,
        projectphase : String,
        hasdesigneraccepted : Boolean,
        hasdesigerresponded : Boolean,
        hometype : String,
        initialsignupvalue : Float,
        decorvalue : Float,
        quoteid : Int,
        projectrating : Int,
        includepmfee : Boolean,
        milestonetype : String,
        odooid : String,
        odoo_delivery_address_id : String,
        isnewpaymentproject : Boolean,
        opportunityid : String,
        template : String
    ): projectsResponse

    meetingSchedulerMilestone(
        projectId: Int!,
        datetime: DateTime!,
        meetingScheduleType: String!,
        description: String,
        meetingType: String!
    ):meetingSchedulerResponse
    
    updatePaymentMilestones(
        projectId:Int!,
        paymentMilestoneName:String,
        projectValue:Float
    ):updateMilestonesResponse

    completeMilestoneChecklist(
        projectId:Int!,
        checkListName:String!
    ):updateMilestonesResponse

    completeChecklistApi(
        projectId: Int!,
    ):completeChecklistResponse

    addMilestoneFiles(
        projectid: Int!
        filename: String!
        filekey: String!
        fileurl: String!
        contenttype: String!
        uploadedby: String
        approvalstatus: String!
        comments: String
    ): addMilestoneFilesResponse

    updateFormFillMilestones(
        projectId:Int,
        formFillName:String,
        formFillData:FormFillInputs
    ):meetingSchedulerResponse

    shareFileWithCustomer(
        projectid: Int!,
        filename: String!,
        sharewithcustomer:Boolean!
    ): shareFileWithCustomerResponse
}

input Filter{
    designers: [Int],
    studios: [Int],
    cities: [Int],
    ecs: [Int],
    status: [String],
    currentStage: [String],
    filterBy : [String],
    fromDate: DateTime,
    toDate: DateTime
}
input Sorting{
    sortBy : String,
    order : String
}

type completeChecklistResponse{
    code: Int!,
    message: String!
    milestonename:String
}

type meetingSchedulerResponse{
    code: Int!,
    message: String!
}

type updateMilestonesResponse{
    code:Int!,
    message:String!
}

type projectsResponse { 
    code:Int
    message: String
    data: Projects
    surveyExecutives: [Users]
    pamProfiles: [Users]
}
type addMilestoneFilesResponse {
    code: Int
    message: String
}

type projectcostbreakupResponse {
        message:String
        code:Int
        ProjectValue:Float
        CollectedAmount:Float
        modularbaseamount:Float
        modulardiscount:Int
        modularMilestone:JSON
        siteservicebaseamount:Float
        siteservicediscount:Int
        siteServiceMilestone:JSON
        modularinclusivegst:Float
        siteserviceinclusivegst:Float
        modularCollectedAmount:Float
        siteServicesCollectedAmount:Float
        modularpdf:String
        siteservicespdf:String
        pendingamountvalue:Float
        Projectstatus:String
        projectmodularvalue:Float
        projectsiteservicevalue:Float
        modularinvoicedamount:Float
        siteserviceinvoicedamount:Float
}

type  getOldprojectResponse{
    message:String
    code:Int
    modularamount:Float
    sitesserviceamount:Float
    modular_collected_amount:Float
    site_services_collected_amount: Float
    collectedamount:Float

}
type getSubTasksForProjectResponse{
    code:Int
    message:String
    data:[Milestone]
}

type getFilesResponse{
    code:Int
    message:String
    data:[Files]
}

type allProjectsResponse{ 
    code:Int
    message:String
    data:[Projects!]!
}

type File {
    filekey: String
    contenttype: String
    location: String
}
type getFileUrlResponse{
    code: Int,
    message: String,
    data: File
}
type shareFileWithCustomerResponse{
    code: Int,
    message: String
}

type Query {
    allProjects:allProjectsResponse
    getProjectById(id:Int): projectsResponse
    getProjectByUser(userId:Int, searchText:String, filter:Filter, sorting:Sorting): projectsResponse
    getProjectCostBreakup(id:Int):projectcostbreakupResponse
    getProjectsByFilter(searchText:String, filter:Filter, sorting:Sorting): allProjectsResponse
    getSubTaskForProject(projectid:Int):getSubTasksForProjectResponse
    getFiles(id:Int):getFilesResponse
    getFileUrl(attachment:JSON):getFileUrlResponse
    getOldProject(id:Int):getOldprojectResponse
}
    scalar DateTime
`;
