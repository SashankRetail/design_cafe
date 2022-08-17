export const citiesTypedef = `
    type Cities {
        id: Int
        name:String
        status:Boolean
        odoo_id:String
        country:String
        cityhead: Users
        created_at:DateTime
        updated_at:DateTime
    }

    type Query {
        allCities: CityResponse
        getCityById(id:Int): CityResponse
    }

    type CityResponse { 
        code:Int
        message: String
        data:[Cities!]!
    }

    type Mutation{
        addCity(name:String,
            status:Boolean,
            odoo_id:String,
            created_at:DateTime,
            updated_at:DateTime,
            cityhead:Int,
            country:String): CityResponse

        updateCity(name:String,
            cityid:Int,
            status:Boolean,
            odoo_id:String,
            created_at:DateTime,
            updated_at:DateTime,
            cityhead:Int,
            country:String): CityResponse
    }
  
    scalar DateTime
`
