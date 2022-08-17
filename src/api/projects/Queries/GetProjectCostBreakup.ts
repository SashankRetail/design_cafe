import { prisma } from "../../../prismaConfig";

export const getProjectCostBreakup = async (root, args, context) => {
  let projectCostBreakupResponseObj;
  const getProjects = await prisma.dc_projects.findFirst({
    where: { id: args.id },
  });
  const milestone: any = getProjects.milestones;
  const ProjectValue = getProjects.totalprojectvalue;
  const CollectedAmount = getProjects.achievedrevenuevalue;
  const modularCollectedAmount = getProjects.modular_collected_amount;
  const modularbaseamount = getProjects.modularbaseamount;
  const modulardiscount = getProjects.modulardiscount;
  const projectmodularvalue = getProjects.projectmodularvalue;
  const modularinclusivegst = getProjects.projectmodularvalue;
  const siteserviceinclusivegst = getProjects.projectsiteservicesvalue;
  const modularinvoicedamount = getProjects.modularinvoicedamount;
  const siteserviceinvoicedamount = getProjects.siteserviceinvoicedamount;
  const siteServicesCollectedAmount =
    getProjects.site_services_collected_amount;
  let projectsiteservicevalue = getProjects.projectsiteservicesvalue;
  const siteservicebaseamount = getProjects.siteservicebaseamount;
  const siteservicediscount = getProjects.siteservicediscount;
  const pendingamountvalue = getProjects.pendingamountvalue;
  const template = milestone.attributes.Template_Name;
  if (template === "Project Template 1") {
    const modularnamefor5Percentage =
      milestone.attributes.milestone_details[0].label;
    const modularAmountfor5Percentage = (modularinclusivegst * 5) / 100;
    const modularnamefor15Percentage =
      milestone.attributes.milestone_details[4].label;
    const modularAmountfor15Percentage = (modularinclusivegst * 20) / 100;
    const modularnamefor35Percentage =
      milestone.attributes.milestone_details[9].label;
    const modularAmountfor35Percentage = (modularinclusivegst * 55) / 100;
    const modularAmountfor45Percentage = modularinclusivegst;
    const modularpdf = milestone.attributes.files_checklist[3].fileurl;
    const modularnamefor45Percentage =
      milestone.attributes.milestone_details[12].label;
    const siteservicenamefor5Percentage = "Site Service for 5%";
    const siteserviceAmountfor5Percentage = (siteserviceinclusivegst * 5) / 100;
    const siteservicenamefor45Percentage = "Site Service for 45%";
    const siteserviceAmountfor45Percentage =
      (siteserviceinclusivegst * 50) / 100;
    const siteservicenamefor50Percentage = "Site Service for 50%";
    const siteserviceAmountfor50Percentage = siteserviceinclusivegst;
    const siteservicespdf = milestone.attributes.files_checklist[4].fileurl;
    const modularMilestone = {
      modularnamefor5_percentage: modularnamefor5Percentage,
      modularAmountfor5_percentage: modularAmountfor5Percentage,
      modularnamefor15_percentage: modularnamefor15Percentage,
      modularAmountfor15_percentage: modularAmountfor15Percentage,
      modularnamefor35_percentage: modularnamefor35Percentage,
      modularAmountfor35_percentage: modularAmountfor35Percentage,
      modularnamefor45Percentage: modularnamefor45Percentage,
      modularAmountfor45_percentage: modularAmountfor45Percentage,
    };
    const siteServiceMilestone = {
      siteservicenamefor5_percentage: siteservicenamefor5Percentage,
      siteserviceAmountfor5_percentage: siteserviceAmountfor5Percentage,
      siteservicenamefor45_percentage: siteservicenamefor45Percentage,
      siteserviceAmountfor45_percentage: siteserviceAmountfor45Percentage,
      siteservicenamefor50_percentage: siteservicenamefor50Percentage,
      siteserviceAmountfor50_percentage: siteserviceAmountfor50Percentage,
    };
    const Projectstatus = getProjects.projectstatus;
    projectCostBreakupResponseObj = {
      code: 200,
      message: "success",
      ProjectValue: ProjectValue,
      CollectedAmount: CollectedAmount,
      modularCollectedAmount: modularCollectedAmount,
      siteServicesCollectedAmount: siteServicesCollectedAmount,
      modularbaseamount: modularbaseamount,
      modulardiscount: modulardiscount,
      siteservicebaseamount: siteservicebaseamount,
      siteservicediscount: siteservicediscount,
      projectmodularvalue: projectmodularvalue,
      projectsiteservicevalue: projectsiteservicevalue,
      modularMilestone: modularMilestone,
      siteServiceMilestone: siteServiceMilestone,
      modularinclusivegst: modularinclusivegst,
      siteserviceinclusivegst: siteserviceinclusivegst,
      modularpdf: modularpdf,
      siteservicespdf: siteservicespdf,
      pendingamountvalue: pendingamountvalue,
      Projectstatus: Projectstatus,
      modularinvoicedamount: modularinvoicedamount,
      siteserviceinvoicedamount: siteserviceinvoicedamount
    };
  }
  return projectCostBreakupResponseObj;
};
