import { prisma } from "../../../prismaConfig";
import superagent from "superagent";
import { ProfileTypeEnumCode } from "../../../domain/enumerations/ProfileTypeEnumUtil";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";
import HttpError from "standard-http-error";

const addUserToSf = async (user) => {
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

  if (sfResponse.body.StatusCode === "200") {
    return sfResponse.body.Designer_User_Id;
  }
  return null;
};

export const addUser = async (_root, args, _context) => {
  let addUserResponseObj;
  try {
    const {
      empid,
      firstname,
      lastname,
      middlename,
      phonenumber,
      designcafeemail,
      profileid,
      reportingmanager,
      team,
      experiencecenters,
      city,
    } = args;

    const CheckEmailAlreadyExist = await prisma.dc_users.count(
      {
        where:{
          designcafeemail:designcafeemail
          }
      }
    )
    if(CheckEmailAlreadyExist > 0){
      return {code:400, message:'Email already exists'}
    }
    const user = await prisma.dc_users.create({
      data: {
        empid: empid,
        firstname,
        lastname,
        middlename,
        phonenumber,
        profileid,
        designcafeemail,
        reportingmanager,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const userPayloadForSF = {
      name: `${firstname?.trim()}${
        middlename ? " " + middlename?.trim() + " " : " "
      }${lastname?.trim()}`,
      designer_dashboard_ID: user.userid,
      email: designcafeemail,
      mobile: phonenumber,
      isActive: true,
      role: profileid,
      designer_team: team,
      experience_center: experiencecenters,
      region: city,
    };

    const userSFId = await addUserToSf(userPayloadForSF);

    console.log(user.userid, userSFId);

    await prisma.dc_users.update({
      where: {
        userid: user.userid,
      },
      data: {
        salesforceuserid: userSFId,
      },
    });

    const userTeamArr = [];
    team.forEach(async (element) => {
      userTeamArr.push({
        userid: user.userid,
        teamid: element,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
    await prisma.dc_users_team.createMany({ data: userTeamArr });
    const userCityArr = [];
    city.forEach(async (element) => {
      userCityArr.push({
        userid: user.userid,
        cityid: element,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
    await prisma.dc_users_city.createMany({ data: userCityArr });
    const userEcArr = [];
    experiencecenters.forEach(async (element) => {
      userEcArr.push({
        userid: user.userid,
        centerid: element,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });
    await prisma.dc_users_experiencecenters.createMany({ data: userEcArr });
    const users = await prisma.dc_users.findMany({
      where: { userid: user.userid },
      include: {
        users_city: {
          include: { city: true },
        },
        users_experiencecenters: {
          include: { center: true },
        },
        users_team: {
          include: { team: true },
        },
      },
    });
    let response;

    if (
      user.profileid === ProfileTypeEnumCode.IN_HOUSE_DESIGNER ||
      user.profileid === ProfileTypeEnumCode.DESIGN_PARTNER
    ) {
      await createSupportPalUser(user, 2, response); // operator id
    } else if (user.profileid === ProfileTypeEnumCode.CHM_EXECUTIVE) {
      await createSupportPalUser(user, 3, response);
    }
    addUserResponseObj = {
      code: 200,
      message: "Successfully added user",
      data: users.map((adduser) => {
        return {
          ...adduser,
          cities: adduser.users_city.map((c) => {
            return { id: c.city.id };
          }),
          experiencecenters: adduser.users_experiencecenters.map((c) => {
            return { centerid: c.center.centerid };
          }),
          teams: adduser.users_team.map((c) => {
            return { id: c.team.id };
          }),
        };
      }),
    };
    return addUserResponseObj;
  } catch (error) {
    addUserResponseObj = { code: 400, message: error.message };
    return addUserResponseObj;
  }
};
const createSupportPalUser = async (user, group, response) => {
  try {
    const operator = await SupportPalBaseUsecase().createOperator({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.designcafeemail,
      password: process.env.supportPalDCPassword, // hardcode pwd as requested by client
      group: group,
    });

    if (!operator.data.id) {
      throw new HttpError(400, "Unable to create operator in Salesforce!!");
    }

    console.log("operator.data.id ===========> ", operator.data.id);
    // dev comment

    await prisma.dc_users.update({
      data: { supportpaloperatorid: operator.data.id },
      where: { userid: user.userid },
    });

    return response;
  } catch (error) {
    return { code: 400, message: error.message };
  }
};
