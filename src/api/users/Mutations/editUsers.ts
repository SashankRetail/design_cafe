import { prisma } from "../../../prismaConfig";
import { mapAllUsers } from "../Queries/GetAllUsers";
import superagent from "superagent";

const addEditedUserDetailsToSf = async (user) => {
    const teamNamesArr = [];
    const experiencCentersArr = [];
    const citiesArr = [];

    /************************************************************ */
    const fetchedTeams = await prisma.dc_teams.findMany({
        where: {
          OR: user.designer_team.map((team) => {
            return {
              id: team,
            };
          }),
        },
      });
      fetchedTeams.forEach((team) => {
        teamNamesArr.push(team.name);
      });

    /*************************************************************** */

    const fetchedExperienceCenters = await prisma.dc_experiencecenters.findMany({
        where: {
        OR: user.experience_center.map((exp) => {
            return {
            centerid: exp,
            };
        }),
        },
    });
    fetchedExperienceCenters.forEach((exp) => {
        experiencCentersArr.push(exp.name);
    });

    /**************************************************************** */
    const fetchedCities = await prisma.dc_cities.findMany({
        where: {
        OR: user.region.map((city) => {
            return {
            id: city,
            };
        }),
        },
    });
    fetchedCities.forEach((city) => {
        citiesArr.push(city.name);
    });
    /************************************************************************ */
    const fetchedProfile = await prisma.dc_profile.findFirst({
        where: {
        profileid: user.role,
        },
    });
    /************************************************************************ */
    const payload = {
        name: user.name,
        designer_dashboard_ID: user.designer_dashboard_ID,
        email: user.email,
        mobile: user.mobile,
        isActive: true,
        role: fetchedProfile.profile_name,
        designer_team: teamNamesArr.toString(),
        experience_center: experiencCentersArr.toString(),
        region: citiesArr.toString(),
      };
      const sfResponse = await superagent
        .post(`${process.env.salesforceUrl}/designeruser`)
        .send(payload)
        .set("Content-Type", "application/json");
      console.log(sfResponse.body)
      if (sfResponse.body.StatusCode === "200") {
        return sfResponse.body.Designer_User_Id;
      }
      return null;

}


export const editUsers = async(parent, args, context) =>{
    const editUserResponse = {
        code:200,
        message:"",
        users:null
    }

    try{
        const {id,empid,departmentid,firstname,middlename,lastname,username,phonenumber,designcafeemail,reportingmanager,isbetauser,profileid,cities,experiencecenters,teams}=args;
        const user = await prisma.dc_users.update({
            data:{empid,departmentid,firstname,middlename,lastname,username,phonenumber,designcafeemail,reportingmanager,isbetauser,profileid},
            where:{
                userid:id
            }
        })

        const userPayloadForSF = {
            name: `${firstname?.trim()}${
              middlename ? " " + middlename?.trim() + " " : " "
            }${lastname?.trim()}`,
            designer_dashboard_ID: user.userid,
            email: designcafeemail,
            mobile: phonenumber,
            isActive: true,
            role: profileid,
            designer_team: teams,
            experience_center: experiencecenters,
            region: cities,
          };

        const userSFId = await addEditedUserDetailsToSf(userPayloadForSF);
        console.log('*************************')
        console.log(user.userid, userSFId);
        console.log('*************************')

        /************************************************************************************************************
         Add the Cities which are present in cities[] Arr but not in already assingned Array(userCity[]) and
         delete those city which are present in assigned Array (userCity[]) but not present in cities[] Arr
        **************************************************************************************************************/
        if(cities){
            const userCity = await prisma.dc_users_city.findMany({ where: { userid: id } })
            await manageCitiesWhileEditing(userCity,cities,id);
        }

       /************************************************************************************************************
         Add the Experience center which are present in experiencecenters[] Arr but not in already assingned Array(userEC[]) and
         delete those experienccenters which are present in assigned Array (userEC[]) but not present in experiencecenters[] Arr
        **************************************************************************************************************/
       if(experiencecenters){
        const userEC = await prisma.dc_users_experiencecenters.findMany({ where: { userid: id } })
        await manageECwhileEditing(userEC,experiencecenters,id);
       }

        /*****************************************************************************************************************************
          Add the Teams which are present in teams[] Arr but not in already assingned Array(userTeams[]) and
          delete those teams which are present in assigned Array (userTeams[]) but not present in teams[] Arr
        ********************************************************************************************************************************/

        if(teams){
            const userTeams = await prisma.dc_users_team.findMany({ where: { userid: id } })
            console.log(45,userTeams)
            await manageTeamsWhileEditing(userTeams,teams,id);
        }
        const fetchedUserByUserId = await prisma.dc_users.findMany({
            where:{
                userid:id
            },
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

        editUserResponse.users = mapAllUsers(fetchedUserByUserId);
}
    catch(e){
        console.log(69,e);
        editUserResponse.code = 400;
        editUserResponse.message = e.message;
        editUserResponse.users = null;
    }

    return editUserResponse;
}

const manageCitiesWhileEditing = async(userCity,cities,userid) =>{
    const citiesToBeAdded = [];
    const citiesToBeDeleted = [];
    cities.forEach((city)=>{
        const isCityAlreadyAdded = userCity.find((cityAssignedToUser)=>{
            return cityAssignedToUser.cityid === city
        })
        if(!isCityAlreadyAdded){
            citiesToBeAdded.push({
                userid:userid,
                cityid:city,
                created_at:new Date(),
                updated_at:new Date()
            })
        }
    })

    userCity.forEach((cityAssignedToUser)=>{
        if(!cities.includes(cityAssignedToUser.cityid)){
            citiesToBeDeleted.push(cityAssignedToUser.cityid)
        }
    })

    if(citiesToBeAdded.length > 0){
        await prisma.dc_users_city.createMany({data: citiesToBeAdded})
    }

    if(citiesToBeDeleted.length > 0){
        await prisma.dc_users_city.deleteMany({
            where: {
              cityid: { in: citiesToBeDeleted },
              userid: userid
            },
          })
    }
}

const manageECwhileEditing = async (userEC,experiencecenters,userid)=>{
        const ecToBeAdded = [];
        const ecToBeDeleted = [];

        experiencecenters.forEach((ec)=>{
            const isECAlreadyAdded = userEC.find((experiencCentersAssignedToUsers)=>{
                return experiencCentersAssignedToUsers.centerid === ec
            })

            if(!isECAlreadyAdded){
                ecToBeAdded.push({
                    userid:userid,
                    centerid:ec,
                    created_at:new Date(),
                    updated_at:new Date()
                })
            }
        })

        userEC.forEach((experiencCentersAssignedToUsers)=>{
            if(!experiencecenters.includes(experiencCentersAssignedToUsers.centerid)){
                ecToBeDeleted.push(experiencCentersAssignedToUsers.centerid)
            }
        })

        if(ecToBeAdded.length > 0){
            await prisma.dc_users_experiencecenters.createMany({
                data: ecToBeAdded
            })
        }

        if(ecToBeDeleted.length > 0){
            await prisma.dc_users_experiencecenters.deleteMany({
                where: {
                  centerid: { in: ecToBeDeleted },
                  userid: userid
                },
              })
        }
}

const manageTeamsWhileEditing = async(userTeams,teams,userid)=>{
    const teamsToBeAdded = [];
    const teamsToBeDeleted = [];

    teams.forEach((team)=>{
        const isTeamsAlreadyAdded = userTeams.find((teamAssignedToUser)=>{
            return teamAssignedToUser.teamid === team
        })

        if(!isTeamsAlreadyAdded){
            teamsToBeAdded.push({
                userid:userid,
                teamid:team,
                created_at:new Date(),
                updated_at:new Date()
            })
        }
    })

    userTeams.forEach((teamAssignedToUser)=>{
        if(!teams.includes(teamAssignedToUser.teamid)){
            teamsToBeDeleted.push(teamAssignedToUser.teamid)
        }
    })

    if(teamsToBeAdded.length > 0){
        await prisma.dc_users_team.createMany({
            data: teamsToBeAdded
        })
    }

    if(teamsToBeDeleted.length > 0){
        await prisma.dc_users_team.deleteMany({
            where: {
              teamid: { in: teamsToBeDeleted },
              userid: userid
            },
          })
    }
}

