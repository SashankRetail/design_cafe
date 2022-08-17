export const dcSupportTypedef = `
   
    type Query {
        webHookTicket(ticket_id: Int!): WebHookResponse
        fetchTicketMessage(ticket_id:Int!,offset: Int,limit: Int): FetchTicketMessageResponse
        fetchTickets(status:Int,searchKey: String, searchValue: String, pageSize:Int,pageIndex: Int): FetchTicketResponse
        fetchTicketById(ticket_id: Int!):FetchTicketByIdResponse
    }
    type WebHookResponse { 
        code:Int
        message: String    
    }
    type FetchTicketResponse { 
        code:Int
        message: String
        data:[JSON]   
    }
    type FetchTicketByIdResponse { 
        code:Int
        data:JSON   
    }
    type FetchTicketMessageResponse { 
        code:Int
        message: String
        description: String
        comments: [JSON]
    }
    type replyToTicketMessageResponse { 
        code:Int
        message: String
        data: JSON
    }

    type updateTicketStatusResponse { 
        code:Int
        message: String
        data: JSON
    }

    type Mutation {
        updateTicketStatus(ticketId: Int!
            status: Int,
            ):updateTicketStatusResponse

            replyToTicketMessage(ticketId: Int!
            message: String
            attachment: JSON
            ):replyToTicketMessageResponse
    }

    scalar DateTime
`
