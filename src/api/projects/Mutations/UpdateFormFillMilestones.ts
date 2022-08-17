import { prisma } from "../../../prismaConfig";
import {
  checkAndMarkMilestonesOnSmartsheet,
  defaultResponseObj,
  callExternalAPIWithPost,
  queryForFetchingRemindersTemplate,
} from "../../../utils/commonUtils";
import { triggerEmailNotification } from "../../../domain/services/baseUseCase/baseUseCase";
import { getUser } from "../../../api/users/Mutations/GetUser";

export const updateFormFillMilestones = async (_root, args, _context) => {
  const { projectId, formFillName, formFillData } = args;

  try {
    const fetchedProject = await prisma.dc_projects.findUnique({
      where: {
        id: projectId,
      },
    });

    let selectedMilestone;
    for (
      let i = 0;
      i < fetchedProject.milestones["attributes"].milestone_details.length;
      i++
    ) {
      console.log(26);
      for (
        let j = 0;
        j <
        fetchedProject.milestones["attributes"].milestone_details[i]
          .milestone_checklist.length;
        j++
      ) {
        if (
          fetchedProject.milestones["attributes"].milestone_details[i]
            .milestone_checklist[j].checklist_string === formFillName
        ) {
          if (formFillName === "Send Project to Production") {
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].approvalstatus = "Pending";
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].is_checked = true;
            const data = {
              projectmanagername: formFillData.pmName,
              expectedhandoverdate: formFillData.projectHandOverDate,
              siteaddress: formFillData.siteAddress,
              isimosproject: formFillData.isProjectIMOS,
              valuebeforediscount: formFillData.valueBeforeDiscount,
              floorarea: formFillData.floorArea,
              imosrooms: formFillData.imosRooms
                ? [...formFillData.imosRooms]
                : undefined,
            };
            selectedMilestone =
              fetchedProject.milestones["attributes"].milestone_details[i];
            const response = await callEmailNotification(
              formFillName,
              fetchedProject,
              formFillData
            );
            if (response.message === "success") {
              await completMilestoneForProductionRequestOrKickoff(
                projectId,
                data
              );
            }
          } else if (formFillName === "Request Site Validation") {
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].is_checked = true;
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].data = {
              dateTimeOfVisit: formFillData.dateTimeOfVisit,
            };
            const data = {
              haslift: formFillData.hasLift,
              hasfalseceiling: formFillData.hasFalseCeiling,
              scopeforelectricalwork: formFillData.scopeForElectricalWork,
              projecttype: formFillData.projectType,
              isimosproject: formFillData.isProjectIMOS,
              tentativeprojectdurationaftersignoff:
                formFillData.tentativeProjectDurationAfterSignOff,
              scopeofwork: formFillData.scopeOfWork,
              specialfinishes: formFillData.specialFinishes,
            };
            selectedMilestone =
              fetchedProject.milestones["attributes"].milestone_details[i];
            const response = await callEmailNotification(
              formFillName,
              fetchedProject,
              formFillData
            );
            if (response.message === "success") {
              await completMilestoneForProductionRequestOrKickoff(
                projectId,
                data
              );
            }
          } else if (formFillName === "Request QC Check") {
            console.log(6868);
            selectedMilestone =
              fetchedProject.milestones["attributes"].milestone_details[i];
            console.log(69, selectedMilestone);
            const response = await callEmailNotification(
              formFillName,
              fetchedProject,
              formFillData
            );
            console.log(74, response);
            if (response.message === "success") {
              console.log(76);
              fetchedProject.milestones["attributes"].milestone_details[
                i
              ].milestone_checklist[j].is_checked = true;
            } else {
              console.log(80);
            }
          } else if (formFillName === "Request Customer Signoff") {
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].is_checked = true;
            fetchedProject.milestones["attributes"].milestone_details[
              i
            ].milestone_checklist[j].data = {
              isRequested: true,
            };
            selectedMilestone =
              fetchedProject.milestones["attributes"].milestone_details[i];
          }
        }
      }
    }
    await checkAndMarkMilestonesOnSmartsheet(projectId, selectedMilestone);

    await prisma.dc_projects.update({
      where: {
        id: projectId,
      },
      data: {
        milestones: fetchedProject.milestones,
      },
    });
    defaultResponseObj.code = 200;
    defaultResponseObj.message = "Milestone Updated";
  } catch (e) {
    console.log(e);
    defaultResponseObj.code = 400;
    defaultResponseObj.message = e.message;
  }
  return defaultResponseObj;
};
const callEmailNotification = async (
  formFillName,
  fetchedProject,
  formFillData
) => {
  try {
    let response;
    const designer = await prisma.dc_users.findUnique({
      where: { userid: fetchedProject.designerid },
    });
    const fetchedDesigner = await getUser(designer.userid);
    const customer = await prisma.dc_customer.findUnique({
      where: { customerid: fetchedProject.customerid },
    });
    const fileschecklist =
      fetchedProject.milestones["attributes"].files_checklist;
    let designPresentationURL,
      modularQuotationURL,
      siteServicesQuotationURL,
      modularDrawingsURL,
      siteDrawingsURL,
      signOffPPTURL;
    fileschecklist.forEach(async (file) => {
      switch (file["checklist_string"]) {
        case "Design Presentation":
          designPresentationURL = file.fileurl;
          break;
        case "Modular Quotation":
          modularQuotationURL = file.fileurl;
          break;
        case "Site Services Quotation":
          siteServicesQuotationURL = file.fileurl;
          break;
        case "Modular Drawings":
          modularDrawingsURL = file.fileurl;
          break;
        case "Site Service Drawings":
          siteDrawingsURL = file.fileurl;
          break;
        case "Sign-off PPT":
          signOffPPTURL = file.fileurl;
          break;
      }
    });
    const templateResponse = await getNotificationTemaplate(formFillName);
    const to = await fetchPlanningCoordinatorBasedOnCity(fetchedProject.cityid);

    const cc = ["ddadmin@designcafe.com"];
    let reportingManager;
    if (designer.reportingmanager) {
      reportingManager = await prisma.dc_users.findUnique({
        where: { userid: designer.reportingmanager },
      });
    }
    cc.push(designer?.designcafeemail, reportingManager?.designcafeemail);
    const designerName = "$Designername";
    const user = await getName(designer, customer);
    if (templateResponse.notificationTemplateForKickOff) {
      const data =
        templateResponse.notificationTemplateForKickOff?.data?.reminders.data[0]
          .attributes;
      if (data.emailActivate) {
        const parameterArrayForKickoff: any[] = [
          designerName,
          "$Designer Email",
          "$DesignerPhone",
          "$Designercity",
          "$Designer.experiencecenter",
          "$DesignerTeam",
          "$Customername",
          "$Project",
          "$customerPhone",
          "$customerEmail",
          "$ProjectName",
          "$ProjectType",
          "$TotalProjectValue",
          "$TentativeProjectDuration",
          "$CustomershippingAddress",
          "$ProjectScope",
          "$Yes/No",
          "$Yes/No",
          "$Yes/No",
          "$Yes/No",
          "$Yes/No",
          "$KickoffDate",
          "KickoffTime",
          "$ModulardrawingURL",
          "$SiteserviceDrawingURL",
          "$DesignPresentationURL",
          "true/False",
        ];
        const inputArrayForKickoff: any[] = [
          designer ? user.designername : "",
          designer?.designcafeemail,
          designer?.phonenumber,
          fetchedDesigner[0].cities[0].name,
          fetchedDesigner[0].experiencecenters[0].name,
          fetchedDesigner[0].teams[0].name,
          customer ? user.customername : "",
          fetchedProject?.projectid,
          customer?.customerphone,
          customer?.customeremail,
          fetchedProject.projectname ? fetchedProject.projectname : "",
          fetchedProject.projecttype ? fetchedProject.projecttype : "",
          fetchedProject.totalprojectvalue
            ? fetchedProject.totalprojectvalue
            : "",
          formFillData.tentativeProjectDurationAfterSignOff
            ? formFillData.tentativeProjectDurationAfterSignOff
            : "",
          formFillData.siteAddress ? formFillData.siteAddress : "",
          formFillData.scopeOfWork ? formFillData.scopeOfWork : "",
          formFillData.hasLift ? "Yes" : "No",
          formFillData.scopeForElectricalWork ? "Yes" : "No",
          formFillData.hasFalseCeiling ? "Yes" : "No",
          formFillData.specialFinishes ? formFillData.specialFinishes : "",
          "",
          formFillData.dateTimeOfVisit
            ? formFillData.dateTimeOfVisit.toLocaleDateString("en-US")
            : "",
          formFillData.dateTimeOfVisit
            ? formFillData.dateTimeOfVisit.toLocaleTimeString("en-US")
            : "",
          modularDrawingsURL ? modularDrawingsURL : "",
          siteDrawingsURL ? siteDrawingsURL : "",
          designPresentationURL ? designPresentationURL : "",
          formFillData.isProjectIMOS ? "Yes" : "No",
        ];

        const subject = data.emailSubject.replace(
          "$Project Name",
          fetchedProject.projectname
        );

        const content = data.email_template;
        const emailContent = await replacetext(
          parameterArrayForKickoff,
          inputArrayForKickoff,
          content
        );
        response = await triggerEmailNotification(
          to,
          subject,
          emailContent,
          cc
        );
      }
    }
    if (templateResponse.notificationTemplateForProductionRequest) {
      const data =
        templateResponse.notificationTemplateForProductionRequest?.data
          ?.reminders.data[0].attributes;

      if (data.emailActivate) {
        const imos = getImosOrderNumber(formFillData);
        let finalImosData;
        if (imos) {
          const str = [];
          imos.forEach((imosdata) => {
            str.push(imosdata.imosOrdeNo, imosdata.roomUrl.concat("\n"));
          });

          const newStr = str.join(",");
          finalImosData = newStr.replace(/,/g, " ");
        }

        const parameterArrayForProductionRequest: any[] = [
          designerName,
          "$ProjectName",
          "$Designer Email",
          "$DesignerPhone",
          "$Designercity",
          "$Designer.experiencecenter",
          "$DesignerTeam",
          "$Customername",
          "$Clientid",
          "$customerPhone",
          "$PMName",
          "$FloorArea",
          "$CommitedhandoverDate",
          "$ProjectValuebeforediscount",
          "$ProjectValue",
          "$Specialfinish",
          "$ProjectShippingAddress",
          "$IMOSordernumber[Hyper Link of screenshot for that order number]",
          "$SignoffPPTURL",
          "$ModularQuotationURL",
          "$siteserviceQuotationURL",
        ];

        const inputArrayForProductionRequest: any[] = [
          designer ? user.designername : "",
          fetchedProject.projectname,
          designer?.designcafeemail,
          designer?.phonenumber,
          fetchedDesigner[0].cities[0].name,
          fetchedDesigner[0].experiencecenters[0].name,
          fetchedDesigner[0].teams[0].name,
          customer ? user.customername : "",
          fetchedProject?.projectid,
          customer?.customerphone,
          formFillData.pmName ? formFillData.pmName : "",
          formFillData.floorArea ? formFillData.floorArea : "",
          formFillData.projectHandOverDate
            ? formFillData.projectHandOverDate
            : "",
          formFillData.valueBeforeDiscount
            ? formFillData.valueBeforeDiscount
            : "",
          fetchedProject.totalprojectvalue
            ? fetchedProject.totalprojectvalue
            : "",
          formFillData.specialFinishes ? formFillData.specialFinishes : "",
          formFillData.siteAddress ? formFillData.siteAddress : "",
          finalImosData ? finalImosData : "",
          signOffPPTURL ? signOffPPTURL : "",
          modularQuotationURL ? modularQuotationURL : "",
          siteServicesQuotationURL ? siteServicesQuotationURL : "",
        ];

        const subject = data.emailSubject
          .replace("$Projectname", fetchedProject.projectname)
          .replace("$cityname", fetchedDesigner[0].cities[0].name);

        const content = data.email_template;
        const emailContent = await replacetext(
          parameterArrayForProductionRequest,
          inputArrayForProductionRequest,
          content
        );
        response = await triggerEmailNotification(
          to,
          subject,
          emailContent,
          cc
        );
      }
    }
    if (templateResponse.notificationTemplateForQCCheckRequest) {
      const data =
        templateResponse.notificationTemplateForQCCheckRequest?.data?.reminders
          .data[0].attributes;
      if (data.emailActivate) {
        const parameterArrayForQCCheck: any[] = [
          designerName,
          "$modulardrawingsURL",
          "$siteservicedrawingsURL",
          "$modularquotationURL",
          "$siteservicequotationURL",
          "$project.name",
        ];
        const inputArrayForQCCheck: any[] = [
          designer ? user.designername : "",
          modularDrawingsURL ? modularDrawingsURL : "",
          siteDrawingsURL ? siteDrawingsURL : "",
          modularQuotationURL ? modularQuotationURL : "",
          siteServicesQuotationURL ? siteServicesQuotationURL : "",
          fetchedProject.projectname,
        ];
        const subject = data.emailSubject.replace(
          "$Projectname",
          fetchedProject.projectname
        );

        const content = data.email_template;
        const emailContent = await replacetext(
          parameterArrayForQCCheck,
          inputArrayForQCCheck,
          content
        );

        const toQCTeam = "gfcchecking@designcafe.com";
        const ccList = ["ddadmin@designcafe.com"];
        ccList.push(designer?.designcafeemail)

        response = await triggerEmailNotification(
          toQCTeam,
          subject,
          emailContent,
          ccList
        );
      }
    }
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const completMilestoneForProductionRequestOrKickoff = async (
  projectid,
  formFillData
) => {
  await prisma.dc_projects.update({
    where: {
      id: projectid,
    },
    data: formFillData,
  });
};
const replacetext = (
  parameterArrayForKickoff,
  inputArrayForKickoff,
  content
) => {
  for (let i = 0; i < parameterArrayForKickoff.length; i++) {
    content = content.replace(
      parameterArrayForKickoff[i],
      inputArrayForKickoff[i]
    );
  }
  return content;
};
const fetchPlanningCoordinatorBasedOnCity = async (cityid) => {
  const to = [];
  if (cityid) {
    const city = await prisma.dc_cities.findUnique({ where: { id: cityid } });
    if (city) {
      to.push(city.planningcoordinatoremail?.split(","));
    }
  }
  return to;
};
const getNotificationTemaplate = async (formFillName) => {
  let slugname;
  let notificationTemplateForKickOff,
    notificationTemplateForProductionRequest,
    notificationTemplateForQCCheckRequest;

  const graphqlCMSUrl = "https://cms.designcafe.com/graphqlm";
  if (formFillName === "Request Site Validation") {
    slugname = "notify_kickoff_request";
    notificationTemplateForKickOff = await callExternalAPIWithPost(
      graphqlCMSUrl,
      queryForFetchingRemindersTemplate(slugname)
    );
  } else if (formFillName === "Send Project to Production") {
    slugname = "notify_production_requested";
    notificationTemplateForProductionRequest = await callExternalAPIWithPost(
      graphqlCMSUrl,
      queryForFetchingRemindersTemplate(slugname)
    );
  } else if (formFillName === "Request QC Check") {
    slugname = "notify_gfc_requested";
    notificationTemplateForQCCheckRequest = await callExternalAPIWithPost(
      graphqlCMSUrl,
      queryForFetchingRemindersTemplate(slugname)
    );
  }
  return {
    notificationTemplateForKickOff,
    notificationTemplateForProductionRequest,
    notificationTemplateForQCCheckRequest,
  };
};
const getName = async (designer, customer) => {
  const designerMiddlename = designer.middlename
    ? designer.middlename.trim()
    : "";
  const designerLastName = designer.lastname ? designer.lastname.trim() : "";
  const designername = `${designer.firstname?.trim()}${
    designerMiddlename ? " " + designerMiddlename + " " : " "
  }${designerLastName}`;

  const firstname = customer.firstname ? customer.firstname.trim() : "";
  const lastName = customer.lastname ? customer.lastname.trim() : "";
  const customername = `${firstname}${lastName}`;
  return { designername, customername };
};
const getImosOrderNumber = (formFillData) => {
  let imosrooms;
  if (formFillData.imosRooms && formFillData.imosRooms.length > 0) {
    imosrooms = [...formFillData.imosRooms];
  }
  return imosrooms;
};
