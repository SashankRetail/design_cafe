import { prisma } from "../../../prismaConfig";
import { mapAllUsers } from "../Queries/GetAllUsers";

export const getUser = async (id) => {
    try{
        const fetchedUser = await prisma.dc_users.findMany({
            where:{userid:id},
            include:{
                users_city: {
                    include: { city: true },
                },
                users_experiencecenters:{
                    include:{ center:true }
                },
                users_team:{
                    include:{ team:true }
                }
            }
        })
        return mapAllUsers(fetchedUser);
    }
    catch(e){
        return e.message;
    }
}

