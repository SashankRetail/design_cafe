import { prisma } from "../../../../prismaConfig";
import { addProject } from "../../../projects/Mutations/AddProject";
import superagent from "superagent";
import {
  experiencecenters,
  OdooStateID,
  getOdooGroupID,
  getOdooStudioID,
} from "../../../../utils/commonUtils";
const contentType = "application/json";
const contentTypeString = "Content-Type";

export const acceptProposal = async (_root, args, _context) => {
  const acceptProposalResponse = { code: 200, message: null };
  const { quoteId, proposalStatus } = args;
  try {
    if (proposalStatus === "Accept") {
      const quoteData = await prisma.quote.findFirst({
        where: { sfid: quoteId },
      });
      if (quoteData) {
        //Create Draft Project
        const addProjectResponse = await createDraftProjectForCustomer(
          quoteData
        );
        if (addProjectResponse.code !== 200) {
          acceptProposalResponse.code = 400;
          acceptProposalResponse.message = addProjectResponse.message;
          return acceptProposalResponse;
        }

        await prisma.quote.update({
          where: { sfid: quoteId },
          data: {
            status: "accepted",
            latest_quote__c: true,
          },
        });
        acceptProposalResponse.code = 200;
        acceptProposalResponse.message =
          "Quote Accepted Successfully,Project Created Successfully";
      } else {
        acceptProposalResponse.code = 400;
        acceptProposalResponse.message = "Something went wrong";
      }
    }
  } catch (error) {
    acceptProposalResponse.code = 400;
    acceptProposalResponse.message = error.message;
  }
  return acceptProposalResponse;
};

const createDraftProjectForCustomer = async (quoteData) => {
  const createProjectDraftStatus = { code: 200, message: null };

  const opportunityData = await prisma.opportunity.findFirst({
    where: {
      sfid: quoteData.opportunityid,
    },
  });

  if (!opportunityData) {
    createProjectDraftStatus.code = 400;
    createProjectDraftStatus.message =
      "Opportunity not found,Project not Created";
    return createProjectDraftStatus;
  }

  const customerData = await prisma.dc_customer.findFirst({
    where: {
      OR: [{ customerphone: opportunityData.mobile__c }],
    },
    include: {
      addresses: true,
    },
  });

  console.log(80, customerData);

  if (!customerData) {
    createProjectDraftStatus.code = 400;
    createProjectDraftStatus.message = "Customer Not Found,Project not Created";
    return createProjectDraftStatus;
  }

  const createCustomerResponse = await createCutomerOnOdoo(customerData);

  if (createCustomerResponse.code !== 200) {
    if (createCustomerResponse.message.includes("contact_id")) {
      console.log(createCustomerResponse.message);
      const odooContactId =
        createCustomerResponse.message.split("contact_id")[1];
      console.log(92, odooContactId);
      await updateContactIdForOdooForCustomer(
        customerData.customerid,
        odooContactId
      );
    } else {
      createProjectDraftStatus.code = 400;
      createProjectDraftStatus.message = `Customer Not Created On Odoo : ${createCustomerResponse.message}`;
      return createProjectDraftStatus;
    }
  }

  const userData = await prisma.dc_users.findFirst({
    where: {
      salesforceuserid: opportunityData.design_user__c,
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

  if (!userData) {
    createProjectDraftStatus.code = 400;
    createProjectDraftStatus.message = "Designer Not Found,Project not Created";
    return createProjectDraftStatus;
  }
  const customerName =  getCustomerName(customerData)

  const addProjectPayload: any = {
    projectid: opportunityData.customer_id__c,
    projectname: `DC-${customerName} ${opportunityData.customer_id__c}`,
    totalprojectvalue:
      quoteData.modular_amount_dis_incl_gst__c +
      quoteData.site_services_amount_dis_incl_gst__c,
    projectstatus: "Draft",
    customerid: customerData.customerid,
    designerid: userData.userid,
    signupamount: 0,
    opportunityid: opportunityData.sfid,
    isimosproject: quoteData.is_imos_project__c,
    modularbaseamount: quoteData.modular_amount__c,
    projectmodularvalue: quoteData.modular_amount_dis_incl_gst__c,
    modulardiscount: quoteData.modular_discount__c,
    siteservicebaseamount: quoteData.site_services_amount__c,
    projectsiteservicesvalue: quoteData.site_services_amount_dis_incl_gst__c,
    siteservicediscount: quoteData.site_services_discount__c,
    cityid: userData.users_city[0].cityid,
    designstudioid: userData.users_team[0].teamid,
    experiencecenterid: userData.users_experiencecenters[0].centerid,
    currentmilestone: "Project Signup",
    hometype: opportunityData.home_type__c,
    isnewpaymentproject: true,
    modularamountgst: quoteData.modular_amount_gst__c,
    siteserviceamountgst: quoteData.site_services_amount_incl_gst__c,
    modularabsolutediscount: quoteData.modular_fixed_discount__c,
    modularpmfee: quoteData.modular_pm_design_fee__c,
    siteservicegst: quoteData.site_services_amount_gst__c,
    siteservicepdflink: quoteData.site_services_pdf__c,
    modularamountgstvalue: quoteData.modular_amount_incl_gst__c,
    sitepmfee: quoteData.site_services_pm_design_fee__c,
    siteservicediscountvalue: quoteData.site_services_amount_discounted__c,
    quotelink: quoteData.quote_link__c,
    proposalpdflink: quoteData.proposal_pdf__c,
    includepmfee: opportunityData.is_pm_site__c,
    salesmanagername:quoteData.opportunity_owner__c
  };
  console.log(146, addProjectPayload);

  const odooAddProjectResponse: any = await addProjectToOdoo(
    addProjectPayload,
    customerData,
    userData
  );

  if (odooAddProjectResponse.code !== 200) {
    console.log(173, odooAddProjectResponse.message);
    if (odooAddProjectResponse.message.includes("analytic account id")) {
      let analyticOdooId = odooAddProjectResponse.message.split(
        "analytic account id"
      )[1];
      analyticOdooId = analyticOdooId.split("and")[0].trim();
      odooAddProjectResponse.odooId = analyticOdooId;
    }
    if (odooAddProjectResponse.message.includes("Delivery id is")) {
      const odooDeliveryId = odooAddProjectResponse.message
        .split("Delivery id is")[1]
        .trim();
      odooAddProjectResponse.odooDeliveryId = odooDeliveryId;
    } else {
      console.log(181);
      createProjectDraftStatus.code = 400;
      createProjectDraftStatus.message = odooAddProjectResponse.message;
      return createProjectDraftStatus;
    }
  } else {
    addProjectPayload.odooid = odooAddProjectResponse.odooId;
    addProjectPayload.odoo_delivery_address_id =
      odooAddProjectResponse.odooDeliveryId;
  }

  console.log("odooAddProjectResponse", odooAddProjectResponse);
  console.log("addProjectPayload", addProjectPayload);

  const addProjectResponse = await addProject(null, addProjectPayload, null);
  if (addProjectResponse.code !== 200) {
    createProjectDraftStatus.code = 400;
    createProjectDraftStatus.message = addProjectResponse.message;
    return createProjectDraftStatus;
  }
  console.log("opportunityData", opportunityData);

  return createProjectDraftStatus;
};

const createCutomerOnOdoo = async (customerData) => {
  const { deliveryStreet1, deliveryStreet2 } = await seperateAddressIntoStreets(
    customerData
  );
  try {
    let gstno = null;
    let gstTreatment = "";

    if (customerData?.l10n_in_gst_treatment !== null) {
      gstTreatment = customerData.l10n_in_gst_treatment;
    } else {
      gstTreatment = "regular";
    }

    if (customerData?.customertype === null) {
      console.log(191);
      return { code: 400, message: "Customer type cannot be null" };
    } else if (customerData?.customertype === "B2C") {
      gstTreatment = "unregistered";
    } else if (customerData?.customertype === "B2B") {
      gstTreatment = "regular";
      if (!customerData.gstno) {
        return {
          code: 400,
          message: "GST Number is required for B2B customer",
        };
      }
      gstno = customerData.gstno;
    }

    if (
      customerData?.customerphone?.length !== 10 ||
      !customerData?.customerphone
    ) {
      return { code: 400, message: "Phone number is not valid." };
    }
    if (
      customerData?.addresses[0].zip?.length !== 6 ||
      !customerData?.addresses[0].zip
    ) {
      return { code: 400, message: "Zip is not valid." };
    }
    if (customerData?.pancardno?.length !== 10 && !customerData?.pancardno) {
      return { code: 400, message: "Pan number is not valid." };
    }
    const customername =  getCustomerName(customerData)
    const odooCookie = await createOdooSession();
    console.log(182, odooCookie);
    const odooContacts = {
      ref: customerData.salesforceid,
      name: customername,
      email: customerData.customeremail,
      city: `${customerData.addresses[0].city}`,
      company_type: "company",
      is_company: true,
      l10n_in_gst_treatment: gstTreatment,
      country_id: 104,
      mobile: customerData.customerphone,
      phone: customerData.customerphone,
      street: deliveryStreet1,
      street2: deliveryStreet2,
      state_id:
        OdooStateID[customerData.addresses[0].state.toLowerCase().trim()],
      type: "contact",
      vat: gstno,
      supply_type: customerData.customertype,
      customer: true,
      zip: customerData.addresses[0].zip,
      sales_force_id: customerData.salesforceid,
      pan_no: customerData.pancardno,
    };
    console.log("odooContacts", odooContacts);
    const url = process.env.odooUrl + "/contact";
    const res = await superagent
      .post(url)
      .set(contentTypeString, contentType)
      .set("Cookie", odooCookie)
      .send({ params: odooContacts });
    console.log(181, res.body);

    if (
      res.body?.result?.response
        ? Object.keys(res.body?.result.response).length > 0
        : null
    ) {
      await updateContactIdForOdooForCustomer(
        customerData.customerid,
        res.body?.result?.response.odoo_contact_id.toString()
      );
      return { code: 200, message: null };
    } else {
      return { code: 400, message: res.body?.result?.message };
    }
  } catch (e) {
    console.log(252, e);
    return { code: 400, message: e.message };
  }
};

const updateContactIdForOdooForCustomer = async (customerId, contactId) => {
  await prisma.dc_customer.update({
    where: {
      customerid: customerId,
    },
    data: {
      odoocontactid: contactId,
    },
  });
};

const addZeroes = (num) => {
  let dis = num.toString();
  const ress = dis.split(".");
  if (!ress[1]) {
    dis = num + 0.001;
  }
  return parseFloat(dis);
};

const addProjectToOdoo = async (project, customer, designer) => {
  const { deliveryStreet1, deliveryStreet2 } = await seperateAddressIntoStreets(
    customer
  );
  try {
    console.log("customer.addresses", customer.addresses);
    const odooCookie = await prisma.dc_odoocookie.findFirst();
    const customerNameInAddress = getCustomerName(customer)

    const projectReqObj = {
      name: project.projectname,
      sales_force_id: customer.salesforceid,
      analytic_location: 35,
      code: project.projectid,
      group_id: getOdooGroupID(customer.addresses[0].city),
      project_refferal: false,
      project_refferal_type: null,
      referral_id: null,
      modular_discount: project.modulardiscount
        ? addZeroes(project.modulardiscount)
        : 0,
      signup_amount_per: 0,
      modular_project_value: project.projectmodularvalue
        ? addZeroes(project.projectmodularvalue)
        : 0,
      site_service_value: project.projectsiteservicesvalue
        ? addZeroes(project.projectsiteservicesvalue)
        : 0,
      civil_discount: project.siteservicediscount
        ? addZeroes(project.siteservicediscount)
        : 0,
      total_project_amount: project.totalprojectvalue
        ? addZeroes(project.totalprojectvalue)
        : 0,
      delivery_address: {
        name: customerNameInAddress,
        type: "delivery",
        street: deliveryStreet1,
        street2: deliveryStreet2,
        city: customer.addresses[0].city,
        state_id: OdooStateID[customer.addresses[0].state.toLowerCase().trim()],
        country_id: 104,
        sales_force_id: customer.salesforceid,
      },
      default_rules: {
        analytic_exp_center_id: experiencecenters(
          designer.users_experiencecenters[0].center.name
        ),
        analytic_studio_id: getOdooStudioID(designer.users_team[0].team?.name),
      },
    };
    console.log("projectReqObj", projectReqObj);
    console.log(3030, odooCookie);
    const url = process.env.odooUrl + "/analytic/account/delivery/address";
    console.log(302, url);
    const res = await superagent
      .post(url)
      .set(contentTypeString, contentType)
      .set("Cookie", odooCookie.cookie)
      .send({ params: projectReqObj });
    console.log(292, res.body);

    if (
      res.body?.result?.response
        ? Object.keys(res.body?.result.response).length > 0
        : null
    ) {
      return {
        code: 200,
        message: null,
        odooId: res.body?.result?.response["Analytic Account"]
          ? res.body?.result?.response["Analytic Account"].toString()
          : null,
        odooDeliveryId: res.body?.result?.response["Delivery Address"]
          ? res.body?.result?.response["Delivery Address"].toString()
          : null,
      };
    } else {
      return {
        code: 400,
        message: `Error in creating oddo project: ${
          res.body?.error?.message
            ? res.body?.error?.message
            : res.body?.result?.message
        }`,
      };
    }
  } catch (e) {
    return { code: 400, message: e.message };
  }
};

const seperateAddressIntoStreets = async (customerData) => {
  try {
    const street1 = [],
      street2 = [];

    const streetAddress = customerData.addresses[0].street.split(" ");
    if (streetAddress.length === 2) {
      street1.push(streetAddress[0]);
      street2.push(streetAddress[1]);
    }

    if (streetAddress.length > 2) {
      for (let i = 0; i < streetAddress.length; i++) {
        const toInt = (streetAddress.length - 1) / 2;
        if (i <= parseInt(toInt.toString())) {
          street1.push(streetAddress[i]);
        } else {
          street2.push(streetAddress[i]);
        }
      }
    }

    console.log("street1 =>", street1.join(" "));
    console.log("street2 => ", street2.join(" "));

    const deliveryStreet1 = street1.join(" ");
    let deliveryStreet2 = street2.join(" ");
    if (deliveryStreet2.length <= 1) {
      deliveryStreet2 = deliveryStreet2.concat(",,");
    } else if (deliveryStreet2.length <= 2) {
      deliveryStreet2 = deliveryStreet2.concat(",");
    }
    return { deliveryStreet1, deliveryStreet2 };
  } catch (e) {
    return e.message;
  }
};

const createOdooSession = async () => {
  try {
    console.log(403403);
    const url = process.env.odooAdminUrl + "/web/session/authenticate";
    console.log(302, url);
    const res = await superagent
      .post(url)
      .set(contentTypeString, contentType)
      .send({
        params: {
          db: process.env.odooDB,
          login: process.env.odooAdminEmail,
          password: process.env.odooAdminEmailPwd,
        },
      });

    console.log(414, res?.header);
    if (res?.header) {
      const sessionCookie = res.header["set-cookie"][0].split(";")[0];
      console.log("sessionCookie", sessionCookie);
      await prisma.dc_odoocookie.update({
        where: {
          id: 1,
        },
        data: {
          cookie: sessionCookie,
        },
      });
      return sessionCookie;
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};
const getCustomerName = (customerData) => {
  const firstname = customerData.firstname ? customerData.firstname.trim() : "";
  const lastname = customerData.lastname ? customerData.lastname.trim() : "";
  return `${firstname ? firstname + " " : ""}${lastname}`;
}
