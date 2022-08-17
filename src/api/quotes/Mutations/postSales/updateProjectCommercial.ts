import { prisma } from "../../../../prismaConfig";
import HttpError from "standard-http-error";
import { authenticate } from "../../../../core/authControl/verifyAuthUseCase";
import { addPdfToMilestone } from "../commonFunctions";
import { Prisma } from "@prisma/client";
import { PaymentMilestoneData } from "../utilities";
export const updateProjectCommercial = async (_root, args, _context) => {
  try {
    const user = await authenticate(_context, "DD");
    const id = args.projectId;
    const adminErrorMessage =
      "Payment milestones not found. Please contact administrator";
    const project = await prisma.dc_projects.findFirst({
      where: { id: id },
    });
    if (!project) {
      throw new HttpError(201, "Invalid Project ID");
    }

    const projectUpdateModel: any = {};
    const newProjectModularValue: number = Math.floor(args.projectModularValue);
    const newSiteServiceValue: number = Math.floor(
      Number(args.projectSiteServicesValue)
    );
    const isProjectModularValueChanged: boolean =
      Number(newProjectModularValue) !==
      Math.floor(Number(project.projectmodularvalue));
    const isSiteServiceValueChanged: boolean =
      newSiteServiceValue !==
      Math.floor(Number(project.projectsiteservicesvalue));

    if (!project.isnewpaymentproject) {
      const paymentMilestones = await prisma.dc_paymentmilestone.findMany({
        where: {
          projectid: project.id,
        },
      });
      if (!paymentMilestones || paymentMilestones.length === 0) {
        throw new HttpError(201, adminErrorMessage);
      }
      console.log(paymentMilestones);
      let acheived = 0;
      paymentMilestones.forEach((element) => {
        acheived += element.amountpaid ? element.amountpaid : 0;
      });
      projectUpdateModel.pendingamountvalue =
        newProjectModularValue + newSiteServiceValue - acheived;
      projectUpdateModel.achievedrevenuevalue = acheived;
      let milestone5Percent: PaymentMilestoneData = null;
      let milestone15Percent: PaymentMilestoneData = null;
      let milestone35Percent: PaymentMilestoneData = null;
      let milestone45Percent: PaymentMilestoneData = null;

      if (
        (isSiteServiceValueChanged || isProjectModularValueChanged) &&
        !project.isnewpaymentproject
      ) {
        if (!paymentMilestones || paymentMilestones.length === 0) {
          throw new HttpError(201, adminErrorMessage);
        }
        paymentMilestones.forEach((element) => {
          const Obj: any = element;
          Obj.addonamount = element.siteserviceamount;
          if (element.sequence === 0) {
            milestone5Percent = Obj;
          }
          if (element.sequence === 1) {
            milestone15Percent = Obj;
          }
          if (element.sequence === 2) {
            milestone35Percent = Obj;
          }
          if (element.sequence === 3) {
            milestone45Percent = Obj;
          }
        });

        const updateMilestone5Percent: PaymentMilestoneData = JSON.parse(
          JSON.stringify(milestone5Percent)
        );
        const updateMilestone15Percent: PaymentMilestoneData = JSON.parse(
          JSON.stringify(milestone15Percent)
        );
        const updateMilestone35Percent: PaymentMilestoneData = JSON.parse(
          JSON.stringify(milestone35Percent)
        );
        const updateMilestone45Percent: PaymentMilestoneData = JSON.parse(
          JSON.stringify(milestone45Percent)
        );
        if (
          !updateMilestone5Percent ||
          !updateMilestone15Percent ||
          !updateMilestone35Percent ||
          !updateMilestone45Percent
        ) {
          throw new HttpError(201, adminErrorMessage);
        }
        if (isProjectModularValueChanged || args.isImosProject) {
          const default5PercentAmount: number = newProjectModularValue * 0.05;
          const default15PercentAmount = newProjectModularValue * 0.15;
          const default35PercentAmount = newProjectModularValue * 0.35;
          const default45PercentAmount = newProjectModularValue * 0.45;
          // When none of Milestone is freezed
          if (
            !milestone5Percent?.isfreezed &&
            !milestone15Percent?.isfreezed &&
            !milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            updateMilestone5Percent.modularamount = default5PercentAmount;
            updateMilestone15Percent.modularamount = default15PercentAmount;
            updateMilestone35Percent.modularamount = default35PercentAmount;
            updateMilestone45Percent.modularamount = default45PercentAmount;
          }
          // when 5% is freezed
          if (
            milestone5Percent?.isfreezed &&
            !milestone15Percent?.isfreezed &&
            !milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            const new15PercentMilestoneAmount =
              default15PercentAmount +
              (default5PercentAmount -
                (milestone5Percent.freezedmodular +
                  milestone5Percent.freezedsiteservice));
            updateMilestone15Percent.modularamount =
              new15PercentMilestoneAmount;
            updateMilestone35Percent.modularamount = default35PercentAmount;
            updateMilestone45Percent.modularamount = default45PercentAmount;
          }
          // when 5%  and 15% is freezed
          if (
            milestone5Percent?.isfreezed &&
            milestone15Percent?.isfreezed &&
            !milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            const new35PercentMilestoneAmount =
              default35PercentAmount +
              (default5PercentAmount -
                (milestone5Percent.freezedmodular +
                  milestone5Percent.freezedsiteservice)) +
              (default15PercentAmount -
                (milestone15Percent.freezedmodular +
                  milestone15Percent.freezedsiteservice));

            updateMilestone35Percent.modularamount =
              new35PercentMilestoneAmount;
            updateMilestone45Percent.modularamount = default45PercentAmount;
          }
          // when 5%, 15%  and 35% is freezed
          if (
            milestone5Percent?.isfreezed &&
            milestone15Percent?.isfreezed &&
            milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            const new45PercentMilestoneAmount =
              default45PercentAmount +
              (default5PercentAmount -
                (milestone5Percent.freezedmodular +
                  milestone5Percent.freezedsiteservice) +
                (default15PercentAmount -
                  (milestone15Percent.freezedmodular +
                    milestone15Percent.freezedsiteservice)) +
                (default35PercentAmount -
                  (milestone35Percent.freezedmodular +
                    milestone35Percent.freezedsiteservice)));

            updateMilestone45Percent.modularamount =
              new45PercentMilestoneAmount;
          }
        }

        // if AddOnIs Changed
        if (isSiteServiceValueChanged || args.isImosProject) {
          const defaultNew15PercentAddOnAmount = newSiteServiceValue * 0.5;
          const defaultNew45PercentAddOnAmount = newSiteServiceValue * 0.5;
          if (
            milestone5Percent?.isfreezed &&
            !milestone15Percent?.isfreezed &&
            !milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            updateMilestone15Percent.addonamount =
              defaultNew15PercentAddOnAmount;
            updateMilestone35Percent.addonamount = 0;
            updateMilestone45Percent.addonamount =
              defaultNew45PercentAddOnAmount;
          }

          if (
            milestone5Percent?.isfreezed &&
            milestone15Percent?.isfreezed &&
            !milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            const new35PercentAddOnAmount =
              defaultNew15PercentAddOnAmount - milestone15Percent.addonamount;
            updateMilestone35Percent.addonamount = new35PercentAddOnAmount;
            updateMilestone45Percent.addonamount =
              defaultNew45PercentAddOnAmount;
          }

          if (
            milestone5Percent?.isfreezed &&
            milestone15Percent?.isfreezed &&
            milestone35Percent?.isfreezed &&
            !milestone45Percent?.isfreezed
          ) {
            const new45PercentAddOnAmount =
              newSiteServiceValue -
              milestone15Percent.addonamount -
              milestone35Percent.addonamount;
            updateMilestone45Percent.addonamount = new45PercentAddOnAmount;
          }
        }

        // Update Total
        if (!updateMilestone5Percent?.isfreezed) {
          updateMilestone5Percent.totalpayableamount = Math.floor(
            Number(updateMilestone5Percent.modularamount) +
              Number(updateMilestone5Percent.addonamount)
          );
          updateMilestone5Percent.amountdue = Math.floor(
            Number(updateMilestone5Percent.totalpayableamount) -
              Number(updateMilestone5Percent.amountpaid) -
              Number(updateMilestone5Percent.advanceamount)
          );
        }
        if (!updateMilestone15Percent?.isfreezed) {
          updateMilestone15Percent.totalpayableamount = Math.floor(
            Number(updateMilestone15Percent.modularamount) +
              Number(updateMilestone15Percent.addonamount)
          );
          updateMilestone15Percent.amountdue = Math.floor(
            Number(updateMilestone15Percent.totalpayableamount) -
              Number(updateMilestone15Percent.amountpaid) -
              Number(updateMilestone15Percent.advanceamount)
          );
        }
        if (!updateMilestone35Percent?.isfreezed) {
          updateMilestone35Percent.totalpayableamount = Math.floor(
            Number(updateMilestone35Percent.modularamount) +
              Number(updateMilestone35Percent.addonamount)
          );
          updateMilestone35Percent.amountdue = Math.floor(
            Number(updateMilestone35Percent.totalpayableamount) -
              Number(updateMilestone35Percent.amountpaid) -
              Number(updateMilestone35Percent.advanceamount)
          );
        }
        if (!updateMilestone45Percent?.isfreezed) {
          updateMilestone45Percent.totalpayableamount = Math.floor(
            Number(updateMilestone45Percent.modularamount) +
              Number(updateMilestone45Percent.addonamount)
          );
          updateMilestone45Percent.amountdue = Math.floor(
            Number(updateMilestone45Percent.totalpayableamount) -
              Number(updateMilestone45Percent.amountpaid) -
              Number(updateMilestone45Percent.advanceamount)
          );
        }

        // Save New Values
        const id5Percent = updateMilestone5Percent.id;
        delete updateMilestone5Percent.id;
        await prisma.dc_paymentmilestone.update({
          where: { id: id5Percent },
          data: updateMilestone5Percent,
        });

        const id15Percent = updateMilestone15Percent.id;
        delete updateMilestone15Percent.id;
        await prisma.dc_paymentmilestone.update({
          where: { id: id15Percent },
          data: updateMilestone15Percent,
        });

        const id35Percent = updateMilestone35Percent.id;
        delete updateMilestone35Percent.id;
        await prisma.dc_paymentmilestone.update({
          where: { id: id35Percent },
          data: updateMilestone35Percent,
        });

        const id45Percent = updateMilestone45Percent.id;
        delete updateMilestone45Percent.id;
        await prisma.dc_paymentmilestone.update({
          where: { id: id45Percent },
          data: updateMilestone45Percent,
        });
      }

      /// Update Project Value
      projectUpdateModel.projectmodularvalue = newProjectModularValue;
      if (args.projectSiteServicesValue) {
        projectUpdateModel.projectsiteservicesvalue =
          args.projectSiteServicesValue;
      }
    }

    if (
      isSiteServiceValueChanged ||
      isProjectModularValueChanged ||
      args.isImosProject
    ) {
      projectUpdateModel.projectmodularvalue = newProjectModularValue;
      if (args.projectSiteServicesValue) {
        projectUpdateModel.projectsiteservicesvalue =
          args.projectSiteServicesValue;
      }
    }
    if (project.isnewpaymentproject) {
      projectUpdateModel.pendingamountvalue =
        newProjectModularValue +
        newSiteServiceValue -
        (project.modular_collected_amount +
          project.site_services_collected_amount);
      projectUpdateModel.achievedrevenuevalue =
        project.modular_collected_amount +
        project.site_services_collected_amount;
    }

    projectUpdateModel.modulardiscount = args.modularDiscount || 0;
    projectUpdateModel.siteservicediscount = args.civilDiscount || 0;
    projectUpdateModel.totalprojectvalue =
      newProjectModularValue + newSiteServiceValue;
    projectUpdateModel.updatedate = new Date();

    if (!args.isImosProject) {
      if (!args.modularPdfJson) {
        throw new HttpError(400, "Modular pdf if required.");
      }
      if (args.modularPdfJson) {
        if (!args.modularPdfJson.fileKey || !args.modularPdfJson.location) {
          throw new HttpError(400, "Please upload modular quotation pdf file.");
        }
        const attachment = {
          key: args.modularPdfJson.fileKey,
          contentType: "application/pdf",
          location: args.modularPdfJson.location
        };
        projectUpdateModel.quotelink = args.modularPdfJson.location;

        addPdfToMilestone(project, "Modular Quotation", attachment);
      }
      if (args.siteServicePdfJson) {
        if (
          !args.siteServicePdfJson.fileKey ||
          !args.siteServicePdfJson.location
        ) {
          throw new HttpError(400, "Please upload site quotation pdf file.");
        }
        const attachment = {
          key: args.siteServicePdfJson.fileKey,
          contentType: "application/pdf",
          location: args.siteServicePdfJson.location
        };
        projectUpdateModel.siteservicepdflink = args.siteServicePdfJson.location;
        addPdfToMilestone(project, "Site Services Quotation", attachment);
      }
    }
    const updatedProject = await prisma.dc_projects.update({
      where: { id: id },
      data: projectUpdateModel,
    });

    return {
      code: 200,
      data: updatedProject,
      message: "success",
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
