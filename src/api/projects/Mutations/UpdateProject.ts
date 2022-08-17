import { prisma } from "../../../prismaConfig";
import dayjs from "dayjs";
import { updateProjectStatus } from "../Smartsheet/Mutations/UpdateProjectStatus";
import { updateProjectValue } from "../Smartsheet/Mutations/UpdateProjectValue";
import { updateDesignerEmail } from "../Smartsheet/Mutations/UpdateDesigner";
import { updateSurvey } from "../Smartsheet/Mutations/UpdateSurvey";
import { updateProjectAddress } from "../Smartsheet/Mutations/UpdateProjectAddress";

export const updateProjectApi = async (root, args, context) => {
  let projectsResponseObj;
  const {
    id,
    projectid,
    projectname,
    projectstatus,
    projectvalue,
    signupdate,
    customerid,
    designerid,
    salesmanagerid,
    chmid,
    surveyexecutiveid,
    projectmanagerid,
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
  } = args;
  const sDate = dayjs(signupdate).format("YYYY-MM-DD");
  try {
    const project = await prisma.dc_projects.update({
      data: {
        projectid,
        projectname,
        projectstatus,
        projectvalue,
        updatedate: new Date(),
        signupdate: new Date(sDate),
        customerid,
        designerid,
        salesmanagerid,
        chmid,
        surveyexecutiveid,
        projectmanagerid,
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
      },
      where: { id: id },
    });
    /******************** SmartSheet APis Integration Start *******************/
    await updateProjectStatusOnSmartSheet(
      project.smartsheetid,
      projectstatus,
      signupdate
    );
    await updateProjectValueOnSmartSheet(project.smartsheetid, projectvalue);
    await updateDesignerOnSmartSheet(project.smartsheetid, designerid);
    await updateSurveyOnSmartSheet(project.smartsheetid, surveyexecutiveid);
    await updateAddressOnSmartSheet(project.smartsheetid, customerid);
    /******************** SmartSheet APis Integration End *******************/
    projectsResponseObj = { code: 200, message: "success", data: project };
    return projectsResponseObj;
  } catch (error) {
    projectsResponseObj = { code: 400, message: error.message };
    return projectsResponseObj;
  }
};
const updateAddressOnSmartSheet = async (smartsheetid, customerid) => {
  if (customerid) {
    const address = await prisma.dc_addresses.findFirst({
      where: { customerid: customerid, addresstype: 1 },
    });
    if (address) {
      const addressValue = `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`;
      const updateAddressPayload = {
        smartSheetId: smartsheetid,
        projectAddress: addressValue,
      };
      await updateProjectAddress(null, updateAddressPayload, null);
    }
  }
};
const updateSurveyOnSmartSheet = async (smartsheetid, surveyexecutiveid) => {
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
const updateDesignerOnSmartSheet = async (smartsheetid, designerid) => {
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
const updateProjectValueOnSmartSheet = async (smartsheetid, projectvalue) => {
  if (projectvalue) {
    const projectValuePayload = {
      smartSheetId: smartsheetid,
      projectValue: projectvalue,
    };
    await updateProjectValue(null, projectValuePayload, null);
  }
};
const updateProjectStatusOnSmartSheet = async (
  smartsheetid,
  projectstatus,
  signupdate
) => {
  if (projectstatus) {
    const projectStatusPayload = {
      smartSheetId: smartsheetid,
      projectStatus: projectstatus,
      signupDate: signupdate,
    };
    await updateProjectStatus(null, projectStatusPayload, null);
  }
};
