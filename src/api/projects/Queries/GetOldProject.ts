import { prisma } from "../../../prismaConfig";

export const getOldProject = async (root, args, context) => {
    const getOldProjects = await prisma.dc_projects.findFirst({
        where: { id: args.id, isnewpaymentproject: false },
    });
    const modularamount = getOldProjects.projectmodularvalue;
    const sitesserviceamount = getOldProjects.projectsiteservicesvalue;
    const modularcollectedamount = getOldProjects.modular_collected_amount;
    const siteservicescollectedamount = getOldProjects.site_services_collected_amount;
    const collectedamount = getOldProjects.achievedrevenuevalue;
    let oldprojectResponseObj = null;
    oldprojectResponseObj = {
        code: 200,
        message: "success",
        modularamount: modularamount,
        sitesserviceamount: sitesserviceamount,
        modular_collected_amount: modularcollectedamount,
        site_services_collected_amount: siteservicescollectedamount,
        collectedamount: collectedamount
    };
    return oldprojectResponseObj;


}
