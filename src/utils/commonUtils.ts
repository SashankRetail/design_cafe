import superagent from "superagent";
import { updateMilestone } from "../api/projects/Smartsheet/Mutations/UpdateMilestone";
import { prisma } from "../prismaConfig";

export const defaultResponseObj = {
  code: null,
  message: null,
  data: null,
};

export const queryForFetchingTemplate = JSON.stringify({
  query: `{
    projectTemplates {
      data{
        attributes{
          Template_Name
          milestone_details(pagination : {start : 0, limit: 20} ){
            label
            payment_percentage
            milestone_checklist{
              is_payment_milestone_checklist
              approval_from_customer
              share_with_customer
              checklist_string
              description
              required
              is_checked
              data
            }
            autorequest
            InvoicePercentage
            mom
            description
            smartsheet_field
          }
          default
          files_checklist{
            checklist_string
            description
            required
            share_with_customer
            approval_from_customer
          }
        }
      }
    }
  }`,
});
export const queryForFetchingRemindersTemplate = (slug) =>
  JSON.stringify({
    query: `{
    reminders(filters : {slug : { eq : "${slug}" }}){
      data{
        attributes{
          label
          slug
          emailActivate
          email_template
          emailSubject
          recipients{
            recepient
          }
          smsActivate
          smsDLTID
          smsBody
          whatsappActive
          whatsAppImageUrl
          whatsAppImageUrl
          whatsAppTemplateName
          whatsAppBodyTemplate
          recipient_cc{
            recepient
          }
          whatsAppBodyTemplate
          params
        }
      }
    }
  }`,
  });
export const callExternalAPIWithPost = async (url, body) => {
  const res = await superagent
    .post(url)
    .send(body)
    .set("Content-Type", "application/json");
  return res.body;
};

export const getGstByStates = (state) => {
  switch (state.toLowerCase()) {
    case "karnataka":
      return "29AABCU9603R1ZJ";
    case "maharashtra":
      return "27AABCU9603R1ZN";
    case "tamil nadu":
      return "33AABCU9603R1ZU";
    default:
      return null;
  }
};

export enum OdooStateID {
  "karnataka" = 593,
  "maharashtra" = 597,
  "tamil nadu" = 607,
  "telangana" = 608,
}

export enum ExperienceCentersAsInSalesforce {
  MGDC = "MGDC",
  WDC = "WDC",
  MUMBAI_DC = "Mumbai DC",
  HYDERABAD_DC = "Hyderabad DC",
  HSRDC = "HSRDC",
  CHENNAI_DC = "Chennai DC",
  JPDC = "JPDC",
  THANE_DC = "Thane DC",
  KDRMYS = "KDRMYS",
  YERPUN = "YERPUN",
  BHHYD = "BHHYD",
  SJPBLR = "SJPBLR",
  KHMUM = "KHMUM",
  WLMUM = "WLMUM",
  OMRCH = "OMRCH",
  HRBRBLR = "HRBRBLR",
  RSPCO = "RSPCO",
}

export enum OdooExperienceCenterID {
  MGDC = 1,
  WDC = 2,
  HSRBLR = 3,
  RCMUM = 4,
  GBHYD = 5,
  ASCHN = 27,
  JPNBLR = 31,
  GBRTHN = 33,
  KDRMYS = 36,
  BHHYD = 39,
  YERPUN = 42,
  SJPBLR = 45,
  KHMUM = 47,
  WLMUM = 50,
  OMRCH = 54,
  HRBRBLR = 56,
  RSPCO = 62,
}

enum GroupEnum {
  BENGALURU = "bengaluru",
  MYSORE = "mysore",
  MUMBAI = "mumbai",
  THANE = "thane",
  HYDERABAD = "hyderabad",
  CHENNAI = "chennai",
}
enum OdooGroupID {
  BENGALURU = 3,
  MYSORE = 17,
  MUMBAI = 6,
  THANE = 16,
  HYDERABAD = 9,
  CHENNAI = 12,
}

enum StudioNameAsInSalesforce {
  MGDCSTUDIO1 = "MGDC Studio 1",
  MGDCSTUDIO2 = "MGDC Studio 2",
  DPBANGALOREMGDC = "DP Bangalore MGDC",
  WDCSTUDI1 = "WDC Studio 1",
  DPBANGALOREWDC = "DP Bangalore WDC",
  HSRDCSTUDIO1 = "HSRDC Studio 1",
  DPBANGALOREHSRDC = "DP Bangalore HSRDC",
  MUMBAISTUDIO1 = "Mumbai Studio 1",
  MUMBAISTUDIO2 = "Mumbai Studio 2",
  MUMBAISTUDIO3 = "Mumbai Studio 3",
  DPMUMBAI = "DP Mumbai",
  HYDERABADSTUDIO1 = "Hyderabad Studio 1",
  DPHYDERABAD = "DP Hyderabad",
  CHENNAISTUDIO1 = "Chennai Studio 1",
  CHENNAIDP = "Chennai DP",
  JPDCXPRESSO = "JPDC XPresso",
  KDRMYSSTD1 = "KDRMYS-Std-1",
  KDRMYSDPSTD1 = "KDRMYS-DPStd-1",
  YERPUNSTD1 = "YERPUN-Std-1",
  YERPUNDPSTD1 = "YERPUN-DPStd-1",
  BHHYDSTD1 = "BHHYD-Std-1",
  BHHYDDPSTD1 = "BHHYD-DPStd-1",
  GBRTHNDPSTD1 = "DP Thane",
  GBRTHNSTD1 = "Thane Studio 1",
  GBRTHNSTD2 = "Thane Studio 2",
  SJPBLRSTD1 = "SJPBLR-Std-1",
  KHMUMSTD1 = "KHMUM-Std-1",
  KHMUMDPSTD1 = "KHMUM-DPStd-1",
  WLMUMSTD1 = "WLMUM-Std-1",
  WLMUMDPSTD1 = "WLMUM-DPStd-1",
  OMRCHSTD1 = "OMRCH-Std-1",
  OMRCHDPstd1 = "OMRCH-DPstd-1",
  HRBRBLRSTD1 = "HRBRBLR-Std-1",
  RSPCOSTD1 = "RSPCO-Std-1",
  RSPCODPSTD1 = "RSPCO-DPStd-1",
}

enum OdooStudioID {
  MGBLRSTD1 = 6,
  MGBLRSTD2 = 7,
  MGBLRDPSTD1 = 8,
  WFBLRSTD1 = 9,
  WFBLRDPSTD1 = 10,
  HSRBLRSTD1 = 11,
  HSRBLRDPSTD1 = 12,
  RCMUMSTD1 = 13,
  RCMUMSTD2 = 14,
  RCMUMSTD3 = 15,
  RCMUMDPSTD1 = 16,
  GBHYDSTD1 = 17,
  GBHYDDPSTD1 = 18,
  ASCHNSTD1 = 29,
  ASCHNDPSTD1 = 30,
  JPNBLRSTD1 = 32,
  KDRMYSSTD1 = 37,
  KDRMYSDPSTD1 = 38,
  YERPUNSTD1 = 43,
  YERPUNDPSTD1 = 44,
  BHHYDSTD1 = 40,
  BHHYDDPSTD1 = 41,
  GBRTHNDPSTD1 = 34,
  GBRTHNSTD1 = 35,
  SJPBLRSTD1 = 46,
  KHMUMSTD1 = 48,
  KHMUMDPSTD1 = 49,
  WLMUMSTD1 = 51,
  WLMUMDPSTD1 = 52,
  GBRTHNSTD2 = 53,
  OMRCHSTD1 = 55,
  HRBRBLRSTD1 = 57,
  OMRCHDPstd1 = 59,
  RSPCOSTD1 = 63,
  RSPCODPSTD1 = 64,
}

export const experiencecenters = (exp) => {
  if (exp === ExperienceCentersAsInSalesforce.MGDC) {
    return OdooExperienceCenterID.MGDC;
  } else if (exp === ExperienceCentersAsInSalesforce.WDC) {
    return OdooExperienceCenterID.WDC;
  } else if (exp === ExperienceCentersAsInSalesforce.HYDERABAD_DC) {
    return OdooExperienceCenterID.GBHYD;
  } else if (exp === ExperienceCentersAsInSalesforce.MUMBAI_DC) {
    return OdooExperienceCenterID.RCMUM;
  } else if (exp === ExperienceCentersAsInSalesforce.HSRDC) {
    return OdooExperienceCenterID.HSRBLR;
  } else if (exp === ExperienceCentersAsInSalesforce.CHENNAI_DC) {
    return OdooExperienceCenterID.ASCHN;
  } else if (exp === ExperienceCentersAsInSalesforce.JPDC) {
    return OdooExperienceCenterID.JPNBLR;
  } else if (exp === ExperienceCentersAsInSalesforce.KDRMYS) {
    return OdooExperienceCenterID.KDRMYS;
  } else if (exp === ExperienceCentersAsInSalesforce.YERPUN) {
    return OdooExperienceCenterID.YERPUN;
  } else if (exp === ExperienceCentersAsInSalesforce.BHHYD) {
    return OdooExperienceCenterID.BHHYD;
  } else if (exp === ExperienceCentersAsInSalesforce.THANE_DC) {
    return OdooExperienceCenterID.GBRTHN;
  } else if (exp === ExperienceCentersAsInSalesforce.SJPBLR) {
    return OdooExperienceCenterID.SJPBLR;
  } else if (exp === ExperienceCentersAsInSalesforce.KHMUM) {
    return OdooExperienceCenterID.KHMUM;
  } else if (exp === ExperienceCentersAsInSalesforce.WLMUM) {
    return OdooExperienceCenterID.WLMUM;
  } else if (exp === ExperienceCentersAsInSalesforce.OMRCH) {
    return OdooExperienceCenterID.OMRCH;
  } else if (exp === ExperienceCentersAsInSalesforce.HRBRBLR) {
    return OdooExperienceCenterID.HRBRBLR;
  } else if (exp === ExperienceCentersAsInSalesforce.RSPCO) {
    return OdooExperienceCenterID.RSPCO;
  } else {
    return null;
  }
};

export const getOdooGroupID = (ECCity: string) => {
  const lowerCaseECCity: string = ECCity.toLowerCase();
  const trimmedCity = lowerCaseECCity.trim();

  if (trimmedCity === GroupEnum.BENGALURU) {
    return OdooGroupID.BENGALURU;
  } else if (trimmedCity === GroupEnum.MYSORE) {
    return OdooGroupID.MYSORE;
  } else if (trimmedCity === GroupEnum.MUMBAI) {
    return OdooGroupID.MUMBAI;
  } else if (trimmedCity === GroupEnum.THANE) {
    return OdooGroupID.THANE;
  } else if (trimmedCity === GroupEnum.HYDERABAD) {
    return OdooGroupID.HYDERABAD;
  } else if (trimmedCity === GroupEnum.CHENNAI) {
    return OdooGroupID.CHENNAI;
  } else {
    return null;
  }
};

//Code complexity needs to be reduced later on
export const getOdooStudioID = (studioNameInRequest: string) => {
  const trimmedStudioname = studioNameInRequest.trim();

  if (trimmedStudioname === StudioNameAsInSalesforce.MGDCSTUDIO1) {
    return OdooStudioID.MGBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.MGDCSTUDIO2) {
    return OdooStudioID.MGBLRSTD2;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.DPBANGALOREMGDC) {
    return OdooStudioID.MGBLRDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.WDCSTUDI1) {
    return OdooStudioID.WFBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.DPBANGALOREWDC) {
    return OdooStudioID.WFBLRDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.HSRDCSTUDIO1) {
    return OdooStudioID.HSRBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.DPBANGALOREHSRDC) {
    return OdooStudioID.HSRBLRDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.MUMBAISTUDIO1) {
    return OdooStudioID.RCMUMSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.MUMBAISTUDIO2) {
    return OdooStudioID.RCMUMSTD2;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.MUMBAISTUDIO3) {
    return OdooStudioID.RCMUMSTD3;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.DPMUMBAI) {
    return OdooStudioID.RCMUMDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.HYDERABADSTUDIO1) {
    return OdooStudioID.GBHYDSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.DPHYDERABAD) {
    return OdooStudioID.GBHYDDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.CHENNAISTUDIO1) {
    return OdooStudioID.ASCHNSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.CHENNAIDP) {
    return OdooStudioID.ASCHNDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.JPDCXPRESSO) {
    return OdooStudioID.JPNBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.KDRMYSSTD1) {
    return OdooStudioID.KDRMYSSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.KDRMYSDPSTD1) {
    return OdooStudioID.KDRMYSDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.YERPUNSTD1) {
    return OdooStudioID.YERPUNSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.YERPUNDPSTD1) {
    return OdooStudioID.YERPUNDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.BHHYDSTD1) {
    return OdooStudioID.BHHYDSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.BHHYDDPSTD1) {
    return OdooStudioID.BHHYDDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.GBRTHNSTD1) {
    return OdooStudioID.GBRTHNSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.GBRTHNDPSTD1) {
    return OdooStudioID.GBRTHNDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.GBRTHNSTD2) {
    return OdooStudioID.GBRTHNSTD2;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.SJPBLRSTD1) {
    return OdooStudioID.SJPBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.KHMUMSTD1) {
    return OdooStudioID.KHMUMSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.KHMUMDPSTD1) {
    return OdooStudioID.KHMUMDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.WLMUMSTD1) {
    return OdooStudioID.WLMUMSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.WLMUMDPSTD1) {
    return OdooStudioID.WLMUMDPSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.OMRCHSTD1) {
    return OdooStudioID.OMRCHSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.OMRCHDPstd1) {
    return OdooStudioID.OMRCHDPstd1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.HRBRBLRSTD1) {
    return OdooStudioID.HRBRBLRSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.RSPCOSTD1) {
    return OdooStudioID.RSPCOSTD1;
  } else if (trimmedStudioname === StudioNameAsInSalesforce.RSPCODPSTD1) {
    return OdooStudioID.RSPCODPSTD1;
  } else {
    return null;
  }
};

export const checkAndMarkMilestonesOnSmartsheet = async (
  projectid,
  milestoneDetails
) => {
  console.log("milestone_details", milestoneDetails);
  let areAllMilestonesCompleted = true;
  milestoneDetails.milestone_checklist.forEach((mileStoneChecklist) => {
    console.log("mileStoneChecklist", mileStoneChecklist.is_checked);
    if (!mileStoneChecklist.is_checked) {
      areAllMilestonesCompleted = false;
    }
  });

  if (areAllMilestonesCompleted) {
    const projectData = await prisma.dc_projects.findUnique({
      where: {
        id: projectid,
      },
    });
    const updateSmartsheetMilestonePayload = {
      smartSheetId: projectData.smartsheetid,
      mileStoneName: milestoneDetails.label,
      actualStartDate: "2022-06-01",
      actualFinishDate: new Date().toISOString().split("T")[0],
    };
    console.log("Calling the Smartsheet API");
    console.log(updateSmartsheetMilestonePayload);
    const updateMilestoneOnSmartsheetResponse = await updateMilestone(
      null,
      updateSmartsheetMilestonePayload,
      null
    );
    console.log(updateMilestoneOnSmartsheetResponse);
  } else {
    console.log("Not Calling Smartsheet API");
  }
};

export const getLeadsAndOpportunityConditionForAccessLevel2 = (
  experienceCenters,
  searchCondition
) => {
  return {
    AND: {
      OR: experienceCenters.map((expCenter) => {
        return {
          meeting_venue__c: expCenter.name,
        };
      }),
    },
    OR: searchCondition,
  };
};

export const getLeadsAndOpportunityConditionForAccessLevel3 = (
  cities,
  searchCondition
) => {
  return {
    AND: {
      OR: cities.map((city) => {
        return {
          region__c: city.name,
        };
      }),
    },
    OR: searchCondition,
  };
};
