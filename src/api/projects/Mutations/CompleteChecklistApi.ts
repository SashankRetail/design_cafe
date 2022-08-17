import { prisma } from "../../../prismaConfig";
import HttpError from "standard-http-error";

export const completeChecklistApi = async (_root, _args, _context) => {
  try {
    const projectData: any = await prisma.dc_projects.findFirst({
      where: { id: _args.projectId },
    });
    if (!projectData) {
      throw new HttpError(400, "Project not found");
    }
    const modularbaseamount = projectData.modularbaseamount;
    const modulardiscount = projectData.modulardiscount;
    const modulardiscountcost = (modularbaseamount * modulardiscount) / 100;
    const modulargst = (modularbaseamount * 18) / 100;
    const modularBaseAmount =
      modularbaseamount + modulargst - modulardiscountcost;
    console.log(modularBaseAmount);
    const modularAmountfor5Percentage = Math.round(modularBaseAmount * 5) / 100;
    const modularAmountfor15Percentage =
      Math.round(modularBaseAmount * 20) / 100;
    const modularAmountfor35Percentage =
      Math.round(modularBaseAmount * 55) / 100;
    const modularAmountfor45Percentage = Math.round(modularBaseAmount);

    const ModualarMilestones = [
      modularAmountfor5Percentage,
      modularAmountfor15Percentage,
      modularAmountfor35Percentage,
      modularAmountfor45Percentage,
    ];
    const labelName = await GetLabelName(projectData, ModualarMilestones);
    console.log(labelName);
    const milestoneData =
      projectData?.milestones?.attributes?.milestone_details;
    milestoneData.forEach((element) => {
      if (
        element.milestone_checklist &&
        element.milestone_checklist.length !== 0 &&
        element?.label === labelName
      ) {
        const milestoneChecklist = element?.milestone_checklist;
        milestoneChecklist.forEach((val) => {
          if (
            val.length !== 0 &&
            val.is_payment_milestone_checklist === true &&
            val.required === true
          ) {
            val.is_checked = true;
          }
        });
      }
    });
    projectData.milestones.attributes.milestone_details = milestoneData;
    await prisma.dc_projects.update({
      where: { id: _args.projectId },
      data: { milestones: projectData.milestones },
    });
    return {
      code: 200,
      message: "Checklist marked complete successfully.",
      milestonename: labelName,
    };
  } catch (error) {
    console.log(error);
    throw new HttpError(500, error.message);
  }
};

const GetLabelName = async (projectData, ModualarMilestones) => {
  const milestone = projectData.milestones;
  const modularnamefor5Percentage =
    milestone.attributes.milestone_details[0].label;
  const modularnamefor15Percentage =
    milestone.attributes.milestone_details[4].label;
  const modularnamefor35Percentage =
    milestone.attributes.milestone_details[9].label;
  const modularnamefor45Percentage =
    milestone.attributes.milestone_details[12].label;
  console.log(ModualarMilestones);
  const modularCollectedAmount = projectData.modular_collected_amount;
  const differenceAmount = 100;
  const milestoneEqualAmount = modularCollectedAmount + differenceAmount;
  console.log(milestoneEqualAmount);
  const modularAmount = ModualarMilestones.indexOf(modularCollectedAmount);
  let labelName;
  console.log(modularAmount);
  if (modularAmount >= 0) {
    console.log("1");
    if (modularAmount === 0) {
      labelName = modularnamefor5Percentage;
    } else if (modularAmount === 1) {
      labelName = modularnamefor15Percentage;
    } else if (modularAmount === 2) {
      labelName = modularnamefor35Percentage;
    } else if (modularAmount === 3) {
      labelName = modularnamefor45Percentage;
    }
  } else {
    const compareMilstone = ModualarMilestones.indexOf(milestoneEqualAmount);
    console.log(compareMilstone);
    console.log("2");
    if (compareMilstone === 0) {
      labelName = modularnamefor5Percentage;
    } else if (compareMilstone === 1) {
      labelName = modularnamefor15Percentage;
    } else if (compareMilstone === 2) {
      labelName = modularnamefor35Percentage;
    } else if (compareMilstone === 3) {
      labelName = modularnamefor45Percentage;
    }
  }
  return labelName;
};
