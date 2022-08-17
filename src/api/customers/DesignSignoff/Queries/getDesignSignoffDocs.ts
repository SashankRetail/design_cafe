import { prisma } from "../../../../prismaConfig"
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";

export const getDesignSignoffDocs = async (_root, args, _context) => {

    try {
        const customer = await authenticate(_context, "CD")

        const { filterValue } = args;

        let allFiles = [];
        const lead = await prisma.lead.findFirst({ where: { mobilephone: customer.customerphone } })

        const leadFiles = await prisma.dc_attachments.findMany({ where: { leadid: lead.sfid, ispreorpost: null } });
        if (leadFiles.length) {

            await Promise.all(
                leadFiles.map(async (file) => {

                    const leadFileStatus = await getLeadFilesStatus(file, customer)
                    if(leadFileStatus){
                        allFiles.push({
                            fileKey: file.filekey,
                            fileUrl: file.location,
                            displayName: file.displayname,
                            contentType: file.contenttype,
                            status: leadFileStatus
                        })
                    }
                })
            )

        }

        const project = await prisma.dc_projects.findFirst({ where: { customerid: customer.customerid } })
        const projectFiles = project.milestones["attributes"].files_checklist

        if (projectFiles.length) {

            projectFiles.forEach(async (file) => {
                const projectFilesRes = await getProjectFiles(file, allFiles)

                allFiles = projectFilesRes.allFiles
            })
        }


        if (filterValue) {

            const filteredFiles = await getFilesBasedOnFilter(filterValue, allFiles)

            allFiles = filteredFiles
        }

        return { code: 200, message: "success", data: allFiles }
    }
    catch (error) {
        return { code: 200, message: error.message }
    }
};
const getLeadFilesStatus = async (file, customer) => {
    let quote, status = null;
    let whereConditionForModular: any = {};
    let whereConditionForSite: any = {};

    const statusQuery = [
        { status: "Accepted" },
        { status: "accepted" },
    ];
    if (file.displayname === "Modular Quotation") {
        whereConditionForModular = {
            OR: statusQuery,
            quote_link__c: file.location,
        };
        quote = await prisma.quote.findFirst({ where: whereConditionForModular})
        status = quote?.status ? "Approved" : null

    }
    if (file.displayname === "Site Service Quotation") {
        whereConditionForSite = {
            OR: statusQuery,
            site_services_pdf__c: file.location,
        };
        quote = await prisma.quote.findFirst({ where: whereConditionForSite })
        status = quote?.status ? "Approved" : null

    }
    if (file.displayname === "Booking Form") {

        status = customer?.bookingformaccepted ? "Approved" : null

    }
    return status

}
const getProjectFiles = async (file, allFiles) => {
    let displayname;
    if (file.share_with_customer && file.fileurl) {
        if (file.checklist_string === "Modular Quotation") {
            displayname = "Final Modular Quotation"
        } else if (file.checklist_string === "Site Services Quotation") {
            displayname = "Final Service Quotation"
        } else {
            displayname = file.checklist_string
        }
        allFiles.push({
            fileKey: file.filekey,
            fileUrl: file.fileurl,
            displayName: displayname,
            contentType: file.contentType,
            status: file.approvalstatus,
            approval_from_customer: file.approval_from_customer

        })
    }

    return allFiles

}
const getFilesBasedOnFilter = async (filterValue, allFiles) => {
    if (filterValue === 1) {
        const approvedFiles = [];
        allFiles.forEach((file) => {
            if (file.status.toLowerCase() === "approved") {
                approvedFiles.push(file)
            }
        })
        allFiles = approvedFiles

    } else if (filterValue === 2) {
        const approvalRequiredFiles = [];
        allFiles.forEach((file) => {
            if (file.status.toLowerCase() === "pending approval" && file.approval_from_customer) {
                approvalRequiredFiles.push(file)
            }
        })
        allFiles = approvalRequiredFiles

    } else if (filterValue === 3) {
        const changeRequestedFiles = [];
        allFiles.forEach((file) => {
            if (file.status.toLowerCase() === "change_requested") {
                changeRequestedFiles.push(file)
            }
        })

        allFiles = changeRequestedFiles
    }
    return allFiles;

}
