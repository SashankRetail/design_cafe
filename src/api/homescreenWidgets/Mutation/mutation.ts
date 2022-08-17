import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import { getSmartSheetClient } from "../../projects/Smartsheet/SmartSheetServices";
import { getMileStoneData } from "../../projects/Smartsheet/Queries/GetMileStonesDetails";

export const cardStatus = async (root, args, context) => {
  let cardStatusResponseObj;
  let input,
    flags = {},
    userDetails = {},
    chmname,
    chmdata,
    salesmanagerdetails,
    proposalaccept,
    projectdetails,
    paymentrequest,
    paymentrequeststatus,
    dccode,
    SmartsheetId,
    CurrentStatus,
    LastUpdated,
    ProjectValue,
    ProjectStartDate,
    ProjectLastDate,
    milestones,
    ProjectSignupDate,
    paymentrequestdata;
  try {
    const fetchedUser = await authenticate(context, "CD");
    const cardDetails = await prisma.opportunity.findFirst({
      where: { sfid: fetchedUser.opportunityid },
    });
    const leadData = await prisma.lead.findFirst({
      where: { mobilephone: fetchedUser.customerphone },
    });
    if (cardDetails !== null) {
      salesmanagerdetails = await prisma.user.findFirst({
        where: { sfid: cardDetails.ownerid },
      });
      dccode = cardDetails.customer_id__c;
    }
    proposalaccept = await prisma.quote.findFirst({
      where: { opportunityid: fetchedUser.opportunityid },
      orderBy: { id: "desc" },
    });
    let paymentcount;
    projectdetails = await prisma.dc_projects.findFirst({
      where: { customerid: fetchedUser.customerid },
    });
    if (projectdetails !== undefined && projectdetails !== null) {
      paymentrequest = await prisma.dc_paymentrequests.findMany({
        where: { clientid: projectdetails.projectid, status: "Pending" },
      });
      paymentrequeststatus = await prisma.dc_paymentrequests.findFirst({
        where: { clientid: projectdetails.projectid },
      });
      paymentcount = paymentrequest.length;
      console.log("requestsum", paymentcount);
      SmartsheetId = projectdetails.smartsheetid;
      CurrentStatus = projectdetails.currentmilestone;
      LastUpdated = projectdetails.updatedate;
      ProjectSignupDate = projectdetails.signupdate;
      ProjectValue = projectdetails.totalprojectvalue;
      ProjectStartDate = projectdetails.createdate;
      ProjectLastDate = projectdetails.expectedhandoverdate;
      milestones = projectdetails.milestones;
      if (projectdetails.chmid !== null) {
        chmdata = await prisma.dc_users.findFirst({
          where: { userid: projectdetails.chmid },
        });
        const mName = chmdata.middlename ? chmdata.middlename : "";
        const fName = chmdata.firstname ? chmdata.firstname : "";
        const lName = chmdata.lastname ? chmdata.lastname : "";
        chmname = `${fName} ${mName} ${lName} is your project account manager, please raise your concern and we will get it resolved.`;
      } else {
        chmname = "Please raise your concern here and we will get it resolved.";
      }
    }
    if (paymentrequeststatus !== null && paymentrequeststatus !== undefined) {
      paymentrequestdata = paymentrequeststatus.status;
    }
    const bookingformstatus = fetchedUser.bookingformstatus;
    userDetails = {
      User_Details: {
        userName: `${fetchedUser.firstname} ${fetchedUser.lastname}`,
        dccode: dccode,
        Smartsheet_Id: SmartsheetId,
        CurrentStatus: CurrentStatus,
        Last_Updated: LastUpdated,
        Project_Value: ProjectValue,
        Project_Start_Date: ProjectStartDate,
        Project_Last_Date: ProjectLastDate,
        Payment_Status: paymentrequestdata,
        Project_Signup_Date : ProjectSignupDate,
      },
    };
    flags = {
      Meeting_Scheduled: "Meeting_Scheduled",
      Proposal_Sent: "Proposal_Sent",
      After_Proposal_has_been_accepted: "After_Proposal_has_been_accepted",
      Project_Signup_Till_Handover_Completion:
        "Project_Signup_Till_Handover_Completion",
    };
    if (leadData !== null && leadData.status === "Meeting Scheduled") {
      const ecAddress = await prisma.dc_experiencecenters.findFirst({
        where: { name: leadData.meeting_venue__c },
      });
      const managerPhoto = await prisma.user.findFirst({
        where: { sfid: leadData.ownerid },
      });
      input = {
        Meeting_Scheduled: {
          meeting_schedule_card: {
            title: leadData.status,
            meeting_type__c: leadData.meeting_type__c,
            createddate: leadData.createddate,
            meeting_venue__c: leadData.meeting_venue__c,
            EC_Address: ecAddress.address,
          },
          reuirement_schedule_card: {
            title: "Next step! Help us know you better",
            description:
              "You’re all signed up . Time to get stuff done. What’s Next? Help us understand your likes/dislikes by filling out this form.",
            CTA: "Fill the form",
            URL: "/requirement-form",
          },
          sales_manager_card: {
            name: leadData.lead_owner_name__c,
            number: managerPhoto.mobilephone,
            email: leadData.lead_owner_email__c,
            avatar: managerPhoto.fullphotourl,
          },
        },
      };
    } else if (
      cardDetails !== null &&
      cardDetails !== undefined &&
      cardDetails.stagename === "Proposal Sent" &&
      proposalaccept !== null &&
      proposalaccept.status.toLowerCase() !== "accepted"
    ) {
      input = {
        Proposal_Details: {
          proposal_card: {
            title: "Proposal Received",
            proposal_sent_date__c: cardDetails.proposal_sent_date__c,
            status: proposalaccept.status.toLowerCase(),
            description:
              "Take A Look ! You shared your home story: we made the design! View the design proposal to accept/reject. Tell us what you think?",
            CTA: "View Proposal",
            URL: "/proposal",
          },
          sales_manager_card: {
            name: salesmanagerdetails.name,
            number: salesmanagerdetails.mobilephone,
            email: salesmanagerdetails.email,
            avatar: salesmanagerdetails.fullphotourl,
          },
        },
      };
    } else if (
      bookingformstatus !== null &&
      bookingformstatus.toLowerCase() === "accepted" &&
      paymentrequestdata !== null &&
      paymentrequestdata.toLowerCase() === "paid"
    ) {
      input = {
        Project_Signup_Till_Handover_Completion: {
          Project_Card: {
            Project_Value: projectdetails.totalprojectvalue,
            Signup_Date: projectdetails.signupdate,
            Handover_Date: projectdetails.expectedhandoverdate,
            Which_milestone_is_active: projectdetails.currentmilestone,
          },
          /*Payment_Card:
                    {
                        title: "Payment Card"
                    },*/
          Customer_Support_Card: {
            title: `Need Help? ${fetchedUser.firstname} ${fetchedUser.lastname}`,
            description: chmname,
            CTA: "Raise ticket",
            URL: "/support",
          },
          /*Referral_Card:
                     {
                        title: "Referral Card",
                        description:"Did you know you can now pay a part of your home through our referral program? REFER & WIN an additional discount of Rs 25,000!",
                        CTA: "Refer Now",
                        URL: "/referral"
                     }*/
        },
      };
    } else if (
      proposalaccept !== null &&
      proposalaccept.status.toLowerCase() === "accepted"
    ) {
      if (paymentrequest !== null && paymentrequest !== undefined) {
        input = {
          After_Proposal_has_been_accepted: {
            five_percent_payment_card: {},
            Booking_Form_Card: {},
          },
        };
        let payment = {};
        let bookingForm = {};
        if (paymentcount > 0 && paymentcount < 2) {
          payment = {
            title: "5% payment card",
            date_an_time_of_request: paymentrequest[0].invoicedate,
            description: `We request you to make your  5% payment 
            for us to get started on your design process!`,
            status: paymentrequest[0].status.toLowerCase(),
            CTA: "Pay Rs." + paymentrequest[0].requestamount,
            URL: "/payment",
          };
        }
        if (paymentcount > 0 && paymentcount <= 2) {
          let sumAmount = 0.0;
          paymentrequest.forEach((item) => {
            sumAmount += item.requestamount;
          });
          payment = {
            title: "5% payment card",
            date_an_time_of_request: paymentrequest[0].invoicedate,
            description:
              "We request you to make your  5% payment for us to get started on your design process!",
            status: "pending",
            CTA: "Pay ₹" + sumAmount,
            URL: "/payment",
          };
        }
        if (
          fetchedUser.bookingformstatus !== null &&
          fetchedUser.bookingformstatus.toLowerCase() !== "accepted"
        ) {
          bookingForm = {
            title: "Booking Form Card",
            status: fetchedUser.bookingformstatus.toLowerCase(),
            description: "Are you all set to start the project with us?",
            CTA: "Review & Sign the Booking Form",
            URL: "/booking-form",
          };
        }
        input.After_Proposal_has_been_accepted.five_percent_payment_card =
          payment;
        input.After_Proposal_has_been_accepted.Booking_Form_Card = bookingForm;
      } else {
        input = {
          Presales_No_Card: {
            information: {
              title: "Information",
              description: `Your side of the actions/activities are done. Next up, ${salesmanagerdetails.name} will reach out to you with the 5% Payment request following the Booking Form. In case there is a delay, use the call button below to speak to ${salesmanagerdetails.name}`,
            },
            sales_manager_card: {
              name: salesmanagerdetails.name,
              number: salesmanagerdetails.mobilephone,
              email: salesmanagerdetails.email,
              avatar: salesmanagerdetails.fullphotourl,
            },
          },
        };
      }
    } else {
      input = {
        Information: {
          description:
            "The dashboard is currently being updated by the team, Please login after sometime.",
        },
      };
    }
    if (input !== {}) {
      cardStatusResponseObj = await prisma.dc_customer.update({
        data: {
          cardstage: input,
        },
        where: {
          customerid: fetchedUser.customerid,
        },
      });
    }
    var milestonedata;
    const type = "home";
    if (SmartsheetId !== undefined && SmartsheetId !== null) {
      const smartClient = await getSmartSheetClient();
      const sheetData = await smartClient.sheets.getSheet({ id: SmartsheetId });

      milestonedata = getMileStoneData(sheetData, milestones, type);
    }
    cardStatusResponseObj = {
      code: 200,
      message: "Successfully fetched card details",
      userDetails: userDetails,
      flags: flags,
      data: input,
      dynamic_Card: milestonedata,
    };
    return cardStatusResponseObj;
  } catch (error) {
    cardStatusResponseObj = { code: 400, message: error.message };
    return cardStatusResponseObj;
  }
};
