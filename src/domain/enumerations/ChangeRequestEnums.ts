enum requestStage {
  BOOKINGFORM = "booking form",
  PROJECTPROPOSAL = "project proposal",
  DESIGNSIGNOFF = "design signoff",
}

enum BookingFormStatusEnumNames {
  NULL = "null",
  GENERATED = "generated",
  CHANGE_REQUESTED = "change_requested",
  UPDATED = "updated",
  ACCEPTED = "accepted",
}

enum ProjectProposalEnums {
  CREATED = "created",
  PENDING = "pending",
  ACCEPTED = "accepted",
  CHANGE_REQUESTED = "change_requested",
}

enum ProjectStatusEnum {
  DRAFT = "Draft", //"DRAFT"
  ACTIVE = "Active", //"ACTIVE"
  HOLD = "Hold", //"HOLD"
  WITHDRAWN = "Withdrawn", //"WITHDRAWN"
  COMPLETED = "Completed", //"COMPLETED"
}
export {
  requestStage,
  BookingFormStatusEnumNames,
  ProjectProposalEnums,
  ProjectStatusEnum,
};
