import { prisma } from "../../../prismaConfig";
import { authenticate } from "../../../core/authControl/verifyAuthUseCase";
import {
    FileCheckListName,
} from "../../../domain/enumerations/FileCheckListEnums";
import HttpError from "standard-http-error";

export const shareFileWithCustomer = async (root, args, context) => {
    const {
        projectid,
        filename,
        sharewithcustomer,
    } = args;
    let shareFileWithCustomerRes;
    try {
        await authenticate(context, "DD");

        const project = await prisma.dc_projects.findFirst({
            where: { id: projectid },
        });
        if (!project) {
            throw new HttpError(400, "Project not found");
        }
        let fileschecklist = [];
        const milestones = project.milestones;
        fileschecklist = milestones["attributes"].files_checklist;

        fileschecklist.forEach(async (file) => {
            if (file.length !== 0 && file["checklist_string"] === filename) {
                console.log(456, FileCheckListName)
                if (filename === FileCheckListName.SURVEY_DRAWINGS || filename === FileCheckListName.SITE_IMAGES) {
                    file.share_with_customer = sharewithcustomer
                    if (file.share_with_customer) {
                        shareFileWithCustomerRes = { code: 200, message: "File successfully shared with customer" };
                    } else {
                        shareFileWithCustomerRes = { code: 200, message: "File shared with customer have been revoked" };
                    }
                } else {
                    if(file.share_with_customer){
                        shareFileWithCustomerRes = { code: 400, message: "Sorry cannot unshare this file" }
                    } else{
                        file.share_with_customer = sharewithcustomer
                        shareFileWithCustomerRes = { code: 200, message: "File successfully shared with customer" };
                    }
                }
            }
        })

        await prisma.dc_projects.update({
            data: { milestones: milestones },
            where: { id: projectid },
        });
        return shareFileWithCustomerRes;

    }
    catch (error) {
        shareFileWithCustomerRes = { code: 400, message: "Sorry cannot unshare this file" };
        return shareFileWithCustomerRes;
    }
}
