export const widgetsTypedef = `

type leadSummaryResponse {
    code: Int
    message: String
    data: JSON
}
type conversionResponse {
    code: Int
    message: String
    percentage: Float
    totalMeetingDone: Int
    closedWon: Int
}
type upcomingMeetingsResponse {
    code:Int
    message: String
    data: JSON
}
type broadcastedLeadsResponse {
    code:Int
    message: String
    leads: Int 
}
type proposalSentResponse {
    code:Int
    message: String
    percentage: Float
    totalMeetingDone: Int
    totalProposalSent: Int
}
type totalActiveProjectsResponse {
    code:Int
    message: String
    data: [JSON]
}
type achievedRevenueResponse {
    code:Int
    message: String
    totalachievedrevenue: Int
    monthlytarget: Float
}
   
    type Query {
        leadSummary(month:Int): leadSummaryResponse
        conversion(month:Int): conversionResponse
        upcomingMeetings(timeperiod:Int):upcomingMeetingsResponse
        broadcastedLeads:broadcastedLeadsResponse
        proposalSent(month:Int):proposalSentResponse
        totalActiveProjects:totalActiveProjectsResponse
        achievedRevenue(month: Int):achievedRevenueResponse

    }
  
    scalar DateTime
`
