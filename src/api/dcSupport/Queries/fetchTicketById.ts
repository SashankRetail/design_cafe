import { prisma } from "../../../prismaConfig"
import SupportPalApi from "../../../domain/services/supportpal/SupportPalApi";
import { authenticateDdCd } from "../../../core/authControl/verifyAuthUseCase";
import { SupportPalBaseUsecase } from "../../../domain/services/baseUseCase/supportpalBaseUseCase";

export const fetchTicketById = async (root, args, context) => {
    let FetchTicketByIdResponse;

    const { ticket_id } = args;

    try {
        await authenticateDdCd(context)
        const supportPalCFInfo = SupportPalBaseUsecase().getSupportpalCustomField()

        const res = await getTicketById(ticket_id);
        const obj = {
            ticketId: "",
            caseNumber: "",
            status: "",
            priority: "",
            subject: "",
            isClosed: false,
            createdDate: "",
            projectName: "",
            designerName: "",
            customerName: "",
            chmname: "",
            dueTime: "",
            typeBucket: "",
            issueType: "",
            paymentstage: ""
        };
        obj.ticketId = res.data.id;
        obj.caseNumber = res.data.number;
        obj.status = res.data.status.name;
        obj.priority = res.data.priority.name;
        obj.subject = res.data.subject;
        if (res.data.customfields?.length) {
            await Promise.all(
            res.data.customfields.map(async (customfield) => {
                switch (customfield.field_id) {
                    case 27:
                        obj.projectName = customfield.value;
                        break;
                    case 14:
                        const customfieldvalue = supportPalCFInfo[19]
                        obj.paymentstage = customfieldvalue;
                        break;
                    case 21:
                        obj.typeBucket = customfield.value;
                        break;
                    case 13:
                        const designer = await prisma.dc_users.findFirst({ where: { designcafeemail: customfield.value } })
                        if (designer) {
                            obj.designerName = `${designer.firstname}` + " " + `${designer.lastname}`;

                        } else {
                            obj.designerName = ""
                        }
                        break;
                    case 16:
                    case 17:
                    case 18:
                    case 19:
                    case 20:
                        obj.issueType = customfield.value;
                        break;
                }
            })
            )

        }
        console.log("here")
        const customerName =  getCustomerName(res.data)
        obj.customerName = customerName;

        if (res.data.assigned[0]) {
            obj.chmname = `${res.data.assigned[0].firstname}` + " " + `${res.data.assigned[0]?.lastname}`;
        }

        else {
            obj.chmname = ""
        }
        const createdDate = new Date(0);
        createdDate.setUTCSeconds(res.data.created_at);
        obj.createdDate = createdDate.toISOString()

        const dueDate = new Date(0);
        dueDate.setUTCSeconds(res.data.due_time);
        obj.dueTime = dueDate.toISOString()


        FetchTicketByIdResponse = { code: 200, data: obj }
        return FetchTicketByIdResponse;

    } catch (error) {
        FetchTicketByIdResponse = { code: 400, message: error.message }
        return FetchTicketByIdResponse;
    }

};
const getTicketById = async (ticketId) => {
    const url = "ticket/ticket/" + ticketId
    const supportpalapi = new SupportPalApi()
    const ticket: any = await supportpalapi.getFromSupportPalApi(url);
    return ticket;
}
const getCustomerName = (data) => {
    const firstname = data.user.firstname ? data.user.firstname.trim() : "";
    const lastname = data.user.lastname ? data.user.lastname.trim() : "";
    return `${firstname ? firstname + " " : ""}${lastname}`;
  }
