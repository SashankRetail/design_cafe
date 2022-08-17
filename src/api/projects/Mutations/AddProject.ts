import { prisma } from "../../../prismaConfig";
import { updateDesignerEmail } from "../Smartsheet/Mutations/UpdateDesigner";
import { updateSurvey } from "../Smartsheet/Mutations/UpdateSurvey";
import {
  callExternalAPIWithPost,
  queryForFetchingTemplate,
} from "../../../utils/commonUtils";
import { createSmartSheet } from "../Smartsheet/Mutations/CreateSmartsheet";
import short from "shortid";
import { triggerEmailNotification } from "../../../domain/services/baseUseCase/baseUseCase";
import EmailTemplate from "../../../domain/services/template/EmailTemplate";

export const addProject = async (_root, args, _context) => {
  const projectCreationResponse = { code: 200, message: "success", data: null };
  const {
    projectid,
    projectname,
    totalprojectvalue,
    signupdate,
    customerid,
    designerid,
    salesmanagerid,
    chmid,
    designstudioid,
    modularbaseamount,
    projectmodularvalue,
    modulardiscount,
    siteservicebaseamount,
    projectsiteservicesvalue,
    siteservicediscount,
    signupamount,
    signupstate,
    experiencecenterid,
    cityid,
    projectaddressid,
    cmmname,
    expectedhandoverdate,
    currentmilestone,
    projectphase,
    hasdesigneraccepted,
    hasdesigerresponded,
    hometype,
    initialsignupvalue,
    decorvalue,
    quoteid,
    projectrating,
    includepmfee,
    milestonetype,
    odooid,
    odoo_delivery_address_id,
    isnewpaymentproject,
    opportunityid,
    template,
    isimosproject,
    modularamountgst,
    siteserviceamountgst,
    modularabsolutediscount,
    modularpmfee,
    siteservicegst,
    siteservicepdflink,
    modularamountgstvalue,
    sitepmfee,
    siteservicediscountvalue,
    quotelink,
    proposalpdflink,
    salesmanagername
  } = args;
  try {
    const projectTemplates = await callExternalAPIWithPost(
      "https://cms.designcafe.com/graphqlm",
      queryForFetchingTemplate
    );
    const surveyExecId = await getSurveyExecutiveId(experiencecenterid);
    const projectAlreadyExist = await prisma.dc_projects.findFirst({
      where: {
        projectid: projectid,
      },
    });
    if (projectAlreadyExist) {
      return { code: 400, message: "Project already exists" };
    }
    if (projectTemplates) {
      const project = await prisma.dc_projects.create({
        data: {
          projectid,
          milestones: projectTemplates?.data?.projectTemplates.data[0],
          projectname,
          projectstatus: "draft",
          totalprojectvalue,
          createdate: new Date(),
          updatedate: new Date(),
          signupdate,
          customerid,
          designerid,
          salesmanagerid,
          chmid,
          surveyexecutiveid: surveyExecId,
          designstudioid,
          modularbaseamount,
          projectmodularvalue,
          modulardiscount,
          siteservicebaseamount,
          projectsiteservicesvalue,
          siteservicediscount,
          signupamount,
          signupstate,
          experiencecenterid,
          cityid,
          projectaddressid,
          cmmname,
          expectedhandoverdate,
          currentmilestone,
          projectphase,
          hasdesigneraccepted,
          hasdesigerresponded,
          hometype,
          initialsignupvalue,
          decorvalue,
          quoteid,
          projectrating,
          includepmfee,
          milestonetype,
          odooid,
          odoo_delivery_address_id,
          isnewpaymentproject,
          opportunityid,
          template,
          isimosproject,
          modularamountgst,
          siteserviceamountgst,
          modularabsolutediscount,
          modularpmfee,
          siteservicegst,
          siteservicepdflink,
          modularamountgstvalue,
          sitepmfee,
          siteservicediscountvalue,
          quotelink,
          proposalpdflink,
          salesmanagername
        },
      });

      //Create Project on Smartsheet
      if (project) {
        /******************************* Create MOM's ********************/
        await addMOM(
          projectTemplates?.data?.projectTemplates.data[0],
          project.id
        );
        /********************* Create MOM's End **************************/

        /***************** Insert the Project on Smartsheet Logic ********************/
        const smartSheetProjectResponse = await addProjectOnSmartSheet(
          project,
          args
        );

        if (smartSheetProjectResponse.code !== 200) {
          projectCreationResponse.code = 400;
          projectCreationResponse.message = smartSheetProjectResponse.message;
          return projectCreationResponse;
        }
        await prisma.dc_projects.update({
          where: {
            id: project.id,
          },
          data: {
            smartsheetid: smartSheetProjectResponse.sheetId.toString(),
          },
        });
        if (projectCreationResponse.code === 200) {
          const profile = await prisma.dc_profile.findFirst({
            where: { profile_name: "CHM Executive" },
          });
          let fetchUser = [];
          const fetchTeam = await prisma.dc_users_team.findFirst({
            where: { userid: args.designerid },
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
                await prisma.dc_projects.update({
                  where: { id: project.id },
                  data: { chmid: getUserProfile.userid },
                });
              }
            }
          }
        }
        /***************** Insert the Project on Smartsheet Logic End********************/
        /***************** Adding Designer and Survey Email in the Smartsheet Milestones start********************/
        await AssignDesignerEmaili(
          smartSheetProjectResponse.sheetId.toString(),
          designerid
        );
        await AssignSurveyEmaili(
          smartSheetProjectResponse.sheetId.toString(),
          project.surveyexecutiveid
        );
        /***************** Adding Designer and Survey Email in the Smartsheet Milestones End********************/
        /******************Add the Payment Request  ************************************/
        const addPaymentRequestResponse = await add5PercentPaymentRequestObject(
          projectmodularvalue,
          projectsiteservicesvalue,
          args.projectid,
          opportunityid
        );

        if (addPaymentRequestResponse.code !== 200) {
          projectCreationResponse.code = 400;
          projectCreationResponse.message = addPaymentRequestResponse.message;
          return projectCreationResponse;
        }
        const quotesForProjects = await prisma.quote.findFirst({
          where: {
            opportunityid: opportunityid,
            latest_quote__c: true,
          },
        });
        if (quotesForProjects) {
          let roomList;
          if (quotesForProjects.dc_room_list__c) {
            roomList = getRoomListArray(quotesForProjects.dc_room_list__c);
          }
          const quoteData = {
            quotename: quotesForProjects.name,
            modularvalue: quotesForProjects.modular_amount__c,
            siteservice: quotesForProjects.site_services_amount__c,
            modulardiscount: quotesForProjects.modular_discount__c,
            modularabsolutediscount:
              quotesForProjects.modular_fixed_discount__c,
            siteserviceabsolutediscount:
              quotesForProjects.site_service_fixed_discount__c,
            siteservicediscount: quotesForProjects.site_services_discount__c,
            islatestquote: quotesForProjects.latest_quote__c,
            salesforcequoteid: quotesForProjects.sfid,
            opportunityid: quotesForProjects.opportunityid,
            proposalpdf: quotesForProjects.proposal_pdf__c,
            decorvalue: quotesForProjects.decor_amount__c,
            modularpdflocation: quotesForProjects.quote_link__c,
            siteservicepdflocation: quotesForProjects.site_services_pdf__c,
            customername: quotesForProjects.customer_name__c,
            roomlist: roomList,
            modularxml: quotesForProjects.dc_modular_xml__c,
            siteservicexml: quotesForProjects.dc_site_services_xml__c,
          };

          const projectQuote = await prisma.dc_project_quotes.create({
            data: quoteData,
          });

          await prisma.dc_projects.update({
            where: {
              id: project.id,
            },
            data: {
              quoteid: projectQuote.id,
            },
          });
        } else {
          projectCreationResponse.code = 400;
          projectCreationResponse.message =
            "Project Created But No Quote Found For the given Opportunity Id";
        }
      }

      projectCreationResponse.data = project;
    } else {
      projectCreationResponse.code = 400;
      projectCreationResponse.message = "Not able to set project template";
    }
  } catch (error) {
    console.log(error);
    projectCreationResponse.code = 400;
    projectCreationResponse.message = error.message;
  }

  return projectCreationResponse;
};

const getRoomListArray = (roomsArray) => {
  const stringifyRoomlist = JSON.parse(
    JSON.stringify(roomsArray).replace(/&quot;/g, '\\"')
  );
  return JSON.parse(stringifyRoomlist);
};

const addProjectOnSmartSheet = async (project, args) => {
  const fetchedDesignerData: any = await prisma.dc_users.findUnique({
    where: {
      userid: args.designerid,
    },
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

  console.log(224, args.customerid);
  const fetchedCustomerData: any = await prisma.dc_customer.findUnique({
    where: {
      customerid: args.customerid,
    },
    include: {
      addresses: true,
    },
  });
  let propertyAddress;
  if (fetchedCustomerData.addresses.length > 0) {
    const { street, city, state, zip, country } =
      fetchedCustomerData.addresses[0];
    propertyAddress = `${street} ${city} ${state} ${zip} ${country}`;
  }
  const customerName =  getCustomerName(fetchedCustomerData)

  const smartSheetPayload = {
    projectId: project.id,
    clientName: customerName,
    clientId: args.projectid,
    projectSignupValue: args.signupamount,
    designerName: `${fetchedDesignerData.firstname} ${fetchedDesignerData.lastname}`,
    designStudio: `${fetchedDesignerData.users_team[0].team.name}`,
    salesOwner: "",
    clientEmail: fetchedCustomerData.customeremail,
    clientContact: `${fetchedCustomerData.customerphone}`,
    propertyName: "",
    propertyAddress: propertyAddress ? propertyAddress : null,
    status: "Draft",
    signupDate: new Date().toISOString().split("T")[0],
  };
  console.log(336, smartSheetPayload);
  return createSmartSheet(null, smartSheetPayload, null);
};
const add5PercentPaymentRequestObject = async (
  projectmodularvalue,
  projectsiteservicesvalue,
  clientId,
  opportunityid
) => {
  try {
    const paymentRequestArr = [
      {
        requestdate: new Date().toISOString().split("T")[0],
        category: "Modular",
        requestid: `PR-${short.generate()}`,
        requestamount: projectmodularvalue
          ? (5 / 100) * projectmodularvalue
          : 0,
        description: "5% of Modular",
        clientid: clientId,
        status: "Pending",
        appname: "DD",
      },
    ];

    const paymentRequestArrForSF = [
      {
        category__c: "Modular",
        request_id__c: `PR-${short.generate()}`,
        request_amount__c: projectmodularvalue
          ? (5 / 100) * projectmodularvalue
          : 0,
        description__c: "5% of Modular",
        client_id__c: clientId,
        status__c: "Pending",
        opportunity__c: opportunityid,
      },
    ];

    if (projectsiteservicesvalue) {
      paymentRequestArr.push({
        requestdate: new Date().toISOString().split("T")[0],
        category: "Site Services",
        requestid: `PR-${short.generate()}`,
        requestamount: projectsiteservicesvalue
          ? (5 / 100) * projectsiteservicesvalue
          : 0,
        description: "5% of Site Service",
        clientid: clientId,
        status: "Pending",
        appname: "DD",
      });

      paymentRequestArrForSF.push({
        category__c: "Site Services",
        request_id__c: `PR-${short.generate()}`,
        request_amount__c: projectsiteservicesvalue
          ? (5 / 100) * projectsiteservicesvalue
          : 0,
        description__c: "5% of Site Service",
        client_id__c: clientId,
        status__c: "Pending",
        opportunity__c: opportunityid,
      });
    }

    const addedPaymentRequestData = await prisma.dc_paymentrequests.createMany({
      data: paymentRequestArr,
    });

    const addedPaymentRequestDataSF =
      await prisma.request_payment__c.createMany({
        data: paymentRequestArrForSF,
      });

    if (addedPaymentRequestData && addedPaymentRequestDataSF) {
      await callPaymentRequestNotification(clientId)
      return {
        code: 200,
        message: "Payment Request Successfully Added",
        data: paymentRequestArr,
      };
    } else {
      return {
        code: 400,
        message: addedPaymentRequestData
          ? "Payment Request Not Added on SF"
          : "Payment Request Not Added",
      };
    }
  } catch (e) {
    console.log(e.message);
    return { code: 400, message: e.message, data: null };
  }
};

const addMOM = async (milestones, projectId) => {
  const momLabelList = [];
  milestones["attributes"]["milestone_details"].forEach((item) => {
    if (item["milestone_checklist"].length > 0) {
      const momMilestoneObj = item.milestone_checklist.filter((checklist) =>
        checklist.checklist_string.includes("MOM")
      );
      if (momMilestoneObj.length > 0) {
        momLabelList.push(momMilestoneObj[0].checklist_string);
      }
    }
  });

  if (momLabelList.length > 0) {
    const momPayloadArr = [];

    momLabelList.forEach((momLabel) => {
      momPayloadArr.push({
        projectid: projectId,
        meetingname: momLabel,
        meetingagenda: momLabel,
        status: "Draft",
      });
    });

    await prisma.dc_project_mom.createMany({
      data: momPayloadArr,
    });
  }
};
const AssignSurveyEmaili = async (smartsheetid, surveyexecutiveid) => {
  if (surveyexecutiveid) {
    const survey = await prisma.dc_users.findUnique({
      where: { userid: surveyexecutiveid },
    });
    if (survey) {
      const updateSurveyPayload = {
        smartSheetId: smartsheetid,
        surveyExecutiveEmail: survey.designcafeemail,
      };
      await updateSurvey(null, updateSurveyPayload, null);
    }
  }
};
const AssignDesignerEmaili = async (smartsheetid, designerid) => {
  if (designerid) {
    const designer = await prisma.dc_users.findUnique({
      where: { userid: designerid },
    });
    if (designer) {
      const updateDesignerPayload = {
        smartSheetId: smartsheetid,
        designerEmail: designer.designcafeemail,
      };
      await updateDesignerEmail(null, updateDesignerPayload, null);
    }
  }
};
const getSurveyExecutiveId = async (experiencecenterid) => {
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
            surveyExecutives.push(surveyExecutive.userid);
          }
        });
      })
    );
  }
  let surveyExecutiveId;
  if (surveyExecutives.length) {
    if (surveyExecutives.length === 1) {
      surveyExecutiveId = surveyExecutives[0];
    } else if (surveyExecutives.length > 1) {
      const roundRobinData = await prisma.dc_surveyroundrobin.findFirst({
        where: {
          experiencecenterid: experiencecenterid,
        },
      });
      surveyExecutiveId = await roundRobinLogic(
        roundRobinData,
        surveyExecutives,
        experiencecenterid
      );
    }
  }
  return surveyExecutiveId;
};
const roundRobinLogic = async (
  roundRobinData,
  surveyExecutives,
  experienceCenterId
) => {
  let surveyExecutiveToBeAssignedToProject;
  if (roundRobinData) {
    const latestSurveyExecutiveId = roundRobinData.surveyexecutiveid;
    const indexOfTheSurveyExecutiveAssignedToProject =
      surveyExecutives.findIndex(
        (surveyExecutive) => surveyExecutive === latestSurveyExecutiveId
      );
    if (
      surveyExecutives.length ===
      indexOfTheSurveyExecutiveAssignedToProject + 1
    ) {
      surveyExecutiveToBeAssignedToProject = surveyExecutives[0];
    } else {
      surveyExecutiveToBeAssignedToProject =
        surveyExecutives[indexOfTheSurveyExecutiveAssignedToProject + 1];
    }
    await prisma.dc_surveyroundrobin.update({
      where: {
        roundrobinid: roundRobinData.roundrobinid,
      },
      data: {
        surveyexecutiveid: surveyExecutiveToBeAssignedToProject,
      },
    });
  } else {
    //Experience center is new and needs to be added in the table
    await prisma.dc_surveyroundrobin.create({
      data: {
        experiencecenterid: experienceCenterId,
        surveyexecutiveid: surveyExecutives[0],
      },
    });
    surveyExecutiveToBeAssignedToProject = surveyExecutives[0];
  }
  return surveyExecutiveToBeAssignedToProject;
};
const callPaymentRequestNotification = async (clientId: string,) => {
  const fetchProject = await prisma.dc_projects.findFirst({ where: { projectid: clientId } })
  const ccList = [];
  if (fetchProject) {

    if (fetchProject.designerid) {
      const designer = await prisma.dc_users.findFirst({ where: { userid: fetchProject.designerid } });
      if (designer && designer.designcafeemail) {
        ccList.push(designer.designcafeemail)
      }

    }
    else {
      ccList.push("lorenzo@designcafe.com")
    }
    ccList.push("ddadmin@designcafe.com")


    if (fetchProject.chmid) {
      const chmExecutive = await prisma.dc_users.findFirst({ where: { userid: fetchProject.chmid } });
      if (chmExecutive && chmExecutive.designcafeemail) {
        ccList.push(chmExecutive.designcafeemail)
      }
    }
  }
    const customer = await prisma.dc_customer.findFirst({ where: { customerid: fetchProject.customerid } })

    const emailTemplateString =  EmailTemplate.paymentRequestTemplate(customer,clientId)

    const subject = `Payment Requested for your Project ${clientId}`

    await triggerEmailNotification(
      customer.customeremail,
      subject,
      emailTemplateString,
      ccList
    );
}
const getCustomerName = (fetchedCustomerData) => {
  const firstname = fetchedCustomerData.firstname ? fetchedCustomerData.firstname.trim() : "";
  const lastname = fetchedCustomerData.lastname ? fetchedCustomerData.lastname.trim() : "";
  return `${firstname ? firstname + " " : ""}${lastname}`;
}

