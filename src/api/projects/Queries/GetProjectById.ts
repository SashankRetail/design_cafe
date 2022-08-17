import { prisma } from "../../../prismaConfig";
import { mapAllUsers } from "../../users/Queries/GetAllUsers";
import {
  callExternalAPIWithPost,
  queryForFetchingTemplate,
} from "../../../utils/commonUtils";

export const getProjectById = async (_root, args, _context) => {
  try {
    const getProjects = await prisma.dc_projects.findFirst({
      where: { id: args.id },
      include: {
        customer: {
          include: {
            addresses: {
              include: { customers: true },
            },
          },
        },
        designstudio: true,
        experiencecenter: true,
        city: true,
        designer: {
          include: {
            users_experiencecenters: {
              include: { center: true },
            },
            users_city: {
              include: { city: true },
            },
            users_team: {
              include: {
                team: true,
              },
            },
          },
        },
        salesmanager: true,
        chm: true,
        surveyexecutive: true,
      },
    });
    const updateProjectObj = {};
    console.log(38, getProjects);
    if (getProjects) {
      const designer = mapAllUsers([getProjects?.designer]);
      if (designer) {
        getProjects.designer = designer[0];
      }
    }
    if (!getProjects.quotelink) {
      updateProjectObj["quotelink"] = getProjects.quotelink = getPdfLinks(
        getProjects.milestones,
        "modular"
      );
    }
    if (
      getProjects.projectsiteservicesvalue &&
      !getProjects.siteservicepdflink
    ) {
      updateProjectObj["siteservicepdflink"] = getProjects.siteservicepdflink =
        getPdfLinks(getProjects.milestones, "siteservice");
    }

    if (!getProjects.milestones) {
      const projectTemplates = await callExternalAPIWithPost(

        "https://cms.designcafe.com/graphqlm",

        queryForFetchingTemplate
      );
      await prisma.dc_projects.update({
        where: {
          id: args.id,
        },
        data: {
          milestones: projectTemplates?.data?.projectTemplates.data[0],
          currentmilestone: "Site Survey",
        },
      });
      getProjects.currentmilestone = "Site Survey";
    }
    if (getProjects.isimosproject && !getProjects.quoteid) {
      const modularBeforeTax = (+getProjects.projectmodularvalue * 100) / 118;
      const reverseModularDisc =
        (100 - Math.abs(getProjects.modulardiscount)) / 100;
      const modularBaseAmount =
        modularBeforeTax / reverseModularDisc || modularBeforeTax;
      getProjects.modularbaseamount = parseFloat(modularBaseAmount.toFixed(2));
      if (getProjects.projectsiteservicesvalue) {
        const siteBeforeTax =
          (+getProjects.projectsiteservicesvalue * 100) / 118;
        const reverseSiteDisc =
          (100 - Math.abs(getProjects.siteservicediscount)) / 100;
        const siteBaseAmount = siteBeforeTax / reverseSiteDisc || siteBeforeTax;
        getProjects.siteservicebaseamount = parseFloat(
          siteBaseAmount.toFixed(2)
        );
      }

      updateProjectObj["modularbaseamount"] = getProjects.modularbaseamount;
      updateProjectObj["siteservicebaseamount"] =
        getProjects.siteservicebaseamount;
      await prisma.dc_projects.update({
        where: {
          id: args.id,
        },
        data: updateProjectObj,
      });
      let quote;
      const projModularValue = getProjects.projectmodularvalue;
      const projSiteValue = getProjects.projectsiteservicesvalue;
      const projModularDiscount = getProjects.modulardiscount;
      const projSiteDiscount = getProjects.siteservicediscount;
      const dbQuoteObj: any = {
        opportunityid: getProjects.opportunityid,
        customername: [
          getProjects?.customer.firstname,
          getProjects?.customer.lastname,
        ].join(" "),
        modulardiscount: projModularDiscount,
        ...(projSiteDiscount && { siteservicediscount: projSiteDiscount }),
        modularvalue: projModularValue,
        ...(projSiteValue && { siteservice: projSiteValue }),
        islatestquote: true,
        quotename:
          [
            getProjects?.customer.firstname,
            getProjects?.customer.lastname,
          ].join(" ") + " Quote 1",
        isimosproject: true,
      };
      quote = await prisma.dc_project_quotes.create({ data: dbQuoteObj });
      await prisma.dc_projects.update({
        where: {
          id: args.id,
        },
        data: { quoteid: quote.id },
      });
      getProjects.quoteid = quote.id;
    }

    const designerAssignedToProject = getProjects.designer;
    getProjects.designer = designerAssignedToProject;
    delete getProjects.milestones;
    const surveyExecutives = await getSurveyExecutives(
      getProjects.experiencecenterid
    );
    const PAMProfiles = await getPAMProfiles(getProjects.designerid);

    return {
      code: 200,
      message: "Success",
      data: getProjects,
      surveyExecutives: surveyExecutives,
      pamProfiles: PAMProfiles,
    };
  } catch (error) {
    console.log(117, error);
    return { code: 400, message: error.message };
  }
};
const getSurveyExecutives = async (experiencecenterid) => {
  // get users with profile survey executive
  const fetchedSurveyExecutives = await prisma.dc_users.findMany({
    where: {
      profileid: 15,
    },
    include: {
      users_experiencecenters: {
        include: { center: true },
      },
    },
  });
  const surveyExecutives = [];
  if (fetchedSurveyExecutives.length > 0) {
    await Promise.all(
      fetchedSurveyExecutives.map((surveyExecutive) => {
        surveyExecutive.users_experiencecenters.map((exc) => {
          if (exc.centerid === experiencecenterid) {
            surveyExecutives.push(surveyExecutive);
          }
        });
      })
    );
  }

  return surveyExecutives;
};
const getPAMProfiles = async (designerid) => {
  const profile = await prisma.dc_profile.findFirst({
    where: { profile_name: "CHM Executive" },
  });
  let fetchUser = [];
  const profiles = [];
  const fetchTeam = await prisma.dc_users_team.findFirst({
    where: { userid: designerid },
  });
  fetchUser = await prisma.dc_users_team.findMany({
    where: { teamid: fetchTeam.teamid },
    select: { userid: true },
  });
  var fetchedUser = fetchUser;
  let getUserProfile;
  for (var i = 0; i < fetchedUser.length; i++) {
    if (fetchedUser[i].userid !== null) {
      getUserProfile = await prisma.dc_users.findFirst({
        where: { userid: fetchedUser[i].userid },
      });
      if (getUserProfile.profileid === profile.profileid) {
        profiles.push(getUserProfile);
      }
    }
  }
  return profiles;
};

const getPdfLinks = (milestone, type) => {
  const data = milestone.attributes.files_checklist;
  let link;
  if (type === "modular") {
    data.forEach((element) => {
      if (element.checklist_string === "Modular Quotation") {
        link = element.fileurl;
      }
    });
  }
  if (type === "siteservice") {
    data.forEach((element) => {
      if (element.checklist_string === "Site Services Quotation") {
        link = element.fileurl;
      }
    });
  }
  return link;
};
