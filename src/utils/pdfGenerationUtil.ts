import { gql } from "graphql-request";

export const proposalMutation = gql`
  mutation GenerateProposalPdf(
    $pdfName: String
    $leadId: String
    $parsedData: JSON
    $roomsArray: JSON
    $discount: Int
    $absoluteDiscount: Int
    $opportunityId: String
    $clientOrProjectName: String
  ) {
    generateProposalPdf(
      pdfName: $pdfName
      leadId: $leadId
      parsedData: $parsedData
      roomsArray: $roomsArray
      discount: $discount
      absoluteDiscount: $absoluteDiscount
      opportunityId: $opportunityId
      clientOrProjectName: $clientOrProjectName
    ) {
      code
      message
      data
    }
  }
`;

export const bookingFormMutation = gql`
  mutation Mutation(
    $modularAmount: Float
    $dcCode: String
    $closeDate: DateTime
    $clientName: String
    $phoneNumber: String
    $emailId: String
    $projectType: String
    $scopeOfWork: String
    $civilWorkRequired: Boolean
    $currentAddress: JSON
    $projectAddress: JSON
    $proposedValue: Float
    $signupValue: Float
    $modularDiscount: Float
    $siteServicesDiscount: Float
    $siteServicesAmount: Float
    $decorAmount: Float
    $fivePercentageProjectValue: Float
    $signupAmount: Float
    $basicFramesofExternalDoorsAndWindows: Boolean
    $reqdDoorsAndWindowsInstalled: Boolean
    $basicAllWallsCompleted: Boolean
    $reqdPuttyCoatOfPlasteringOnWalls: Boolean
    $basicFloorsLeveledOutAndPrepped: Boolean
    $reqdFlooringIsCompleted: Boolean
    $notes: String
    $pan: String
    $gst: String
    $wohooCard: String
    $remarkFromSales: String
    $salesManagerName: String
    $salesManagerMobile: String
    $salesManagerEmail: String
    $leadId: String
    $customerId: Int
  ) {
    generateBookingFormPdf(
      modularAmount: $modularAmount
      dcCode: $dcCode
      closeDate: $closeDate
      clientName: $clientName
      phoneNumber: $phoneNumber
      emailId: $emailId
      projectType: $projectType
      scopeOfWork: $scopeOfWork
      civilWorkRequired: $civilWorkRequired
      currentAddress: $currentAddress
      projectAddress: $projectAddress
      proposedValue: $proposedValue
      signupValue: $signupValue
      modularDiscount: $modularDiscount
      siteServicesDiscount: $siteServicesDiscount
      siteServicesAmount: $siteServicesAmount
      decorAmount: $decorAmount
      fivePercentageProjectValue: $fivePercentageProjectValue
      signupAmount: $signupAmount
      basicFramesofExternalDoorsAndWindows: $basicFramesofExternalDoorsAndWindows
      reqdDoorsAndWindowsInstalled: $reqdDoorsAndWindowsInstalled
      basicAllWallsCompleted: $basicAllWallsCompleted
      reqdPuttyCoatOfPlasteringOnWalls: $reqdPuttyCoatOfPlasteringOnWalls
      basicFloorsLeveledOutAndPrepped: $basicFloorsLeveledOutAndPrepped
      reqdFlooringIsCompleted: $reqdFlooringIsCompleted
      notes: $notes
      pan: $pan
      gst: $gst
      wohooCard: $wohooCard
      remarkFromSales: $remarkFromSales
      salesManagerName: $salesManagerName
      salesManagerMobile: $salesManagerMobile
      salesManagerEmail: $salesManagerEmail
      leadId: $leadId
      customerId: $customerId
    ) {
      code
      message
      data
    }
  }
`;
