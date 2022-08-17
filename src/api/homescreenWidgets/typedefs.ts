export const homescreenWidgetTypedef = `

type cardDetails {
    id : String!
    cardstage : JSON
}
type cardStatusResponseObj {
    code : Int,
    message : String
    userDetails : JSON
    flags : JSON
    data: JSON
    dynamic_Card: JSON
}
type Mutation{
    cardStatus : cardStatusResponseObj
}
scalar DateTime
`
