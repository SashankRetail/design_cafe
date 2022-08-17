export const experienceCenterTypedef = `
    type ExperienceCenters {
        centerid: Int
        name:String
        odoo_id:String
        ectype: String
        address: String
        city: Cities
        centerhead: Users
        created_at:DateTime
        updated_at:DateTime
    }

    type Query {
        allExperienceCenters: ExperienceCenterResponse
        getExperienceCenterById(centerid:Int): ExperienceCenterResponse
    }
    type ExperienceCenterResponse { 
        code:Int
        message: String
        data:[ExperienceCenters!]!
    }
   
    type Mutation{
        addExperienceCenter(name:String,
            odoo_id:String,
            centerhead:Int,
            city: Int,
            ectype: String,
            address: String,
            created_at:DateTime,
            updated_at:DateTime): ExperienceCenterResponse

        updateExperienceCenter(centerid: Int,
            name:String,
            odoo_id:String,
            centerhead:Int,
            city: Int,
            ectype: String,
            address: String,
            created_at:DateTime,
            updated_at:DateTime): ExperienceCenterResponse
    }

    scalar DateTime
`
