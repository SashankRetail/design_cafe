import { makeExecutableSchema } from "@graphql-tools/schema";
import { citiesResolver } from "./cities/resolver";
import { citiesTypedef } from "./cities/typedef";
import { teamsResolver } from "./teams/resolvers";
import { teamsTypedef } from "./teams/typedefs";
import { usersResolver } from "./users/resolver";
import { usersTypedef } from "./users/typedef";
import { GlobalTypedef } from "../api/typedefs";
import { departmentResolver } from "./departments/resolvers";
import { departmentTypedef } from "../api/departments/typedefs";
import { customerResolver } from "./customers/resolvers";
import { customerTypedefs } from "./customers/typedefs";
import { experienceCenterResolver } from "./experienceCenter/resolver";
import { experienceCenterTypedef } from "./experienceCenter/typedef";
import { profilesTypedef } from "./profiles/typedef";
import { profilesResolver } from "./profiles/resolver";
import { projectsTypedef } from "./projects/typedef";
import { projectsResolver } from "./projects/resolver";
import { projectMomTypedef } from "./projectMom/typedef";
import { projectMomResolver } from "./projectMom/resolver";
import { momCommentsTypedef } from "./projectMom/Comments/typedef";
import { momCommentResolver } from "./projectMom/Comments/resolver";
import { paymentRequestReslover } from "./paymentMicroservice/paymentRequest/resolver";
import { paymentRequestTypedef } from "./paymentMicroservice/paymentRequest/typedef";
import { authenticationTokenReslover } from "./paymentMicroservice/authentication/resolver";
import { authenticationTokenTypedef } from "./paymentMicroservice/authentication/typedef";
import { paymentReceiptReslover } from "./paymentMicroservice/paymentReceipt/resolver";
import { paymentReceiptTypedef } from "./paymentMicroservice/paymentReceipt/typedef";
import { customerPaymentReslovers } from "./paymentMicroservice/customer/resolver";
import { customerPaymentTypedef } from "./paymentMicroservice/customer/typedefs";
import { ProjectPaymentReslovers } from "./paymentMicroservice/project/resolver";
import { ProjectaymentTypedef } from "./paymentMicroservice/project/typedef";
import { RazorpayReslovers } from "./paymentMicroservice/razorpay/resolvers";
import { RazorpayTypedef } from "./paymentMicroservice/razorpay/typedefs";
import { InvoiceResolver } from "./paymentMicroservice/invoice/resolvers";
import { InvoiceTypedef } from "./paymentMicroservice/invoice/typedefs";
import { changeRequestTypedefs } from "./changeRequest/typedefs";
import { changeRequestResolver } from "./changeRequest/resolvers";
import { leadsTypedef } from "./leads/typedef";
import { leadsResolver } from "./leads/resolver";
import { opportunityTypedef } from "./opportunities/typedef";
import { opportunityResolver } from "./opportunities/resolver";
import { requirementFormTypedef } from "./customers/requirementForm/typedefs";
import { requirementFormResolver } from "./customers/requirementForm/resolvers";
import { widgetsTypedef } from "./widgets/typedef";
import { widgetsResolver } from "./widgets/resolver";
import { dcSupportResolver } from "./dcSupport/resolvers";
import { dcSupportTypedef } from "./dcSupport/typedefs";
import { quotationTypedef } from "./quotes/typedefs";
import { quotationResolver } from "./quotes/resolver";
import { bookingFormTypedef } from "./customers/BookingForm/typedefs";
import { bookingFormResolver } from "./customers/BookingForm/resolver";
import { designSignoffTypedef } from "./customers/DesignSignoff/typedefs";
import { designSignoffResolver } from "./customers/DesignSignoff/resolver";
import { smartSheetResolver } from "./projects/Smartsheet/resolver";
import { smartSheetTypedef } from "./projects/Smartsheet/typedef";
import{ homescreenWgidgetResolver } from "./homescreenWidgets/resolver";
import { homescreenWidgetTypedef } from "./homescreenWidgets/typedefs";
import{ trigerEmailResolver } from "./emailNotification/resolver";
import { triggerEmailTypedef } from "./emailNotification/typedef";

export const schema = makeExecutableSchema({
  typeDefs: [
    citiesTypedef,
    teamsTypedef,
    usersTypedef,
    GlobalTypedef,
    departmentTypedef,
    customerTypedefs,
    experienceCenterTypedef,
    profilesTypedef,
    dcSupportTypedef,
    projectsTypedef,
    projectMomTypedef,
    momCommentsTypedef,
    paymentRequestTypedef,
    authenticationTokenTypedef,
    paymentReceiptTypedef,
    customerPaymentTypedef,
    ProjectaymentTypedef,
    RazorpayTypedef,
    requirementFormTypedef,
    InvoiceTypedef,
    changeRequestTypedefs,
    leadsTypedef,
    opportunityTypedef,
    requirementFormTypedef,
    widgetsTypedef,
    quotationTypedef,
    bookingFormTypedef,
    designSignoffTypedef,
    departmentTypedef,
    smartSheetTypedef,
    homescreenWidgetTypedef,
    triggerEmailTypedef
  ],
  resolvers: [
    citiesResolver,
    teamsResolver,
    usersResolver,
    customerResolver,
    experienceCenterResolver,
    profilesResolver,
    dcSupportResolver,
    projectsResolver,
    projectMomResolver,
    momCommentResolver,
    paymentRequestReslover,
    authenticationTokenReslover,
    paymentReceiptReslover,
    customerPaymentReslovers,
    ProjectPaymentReslovers,
    RazorpayReslovers,
    requirementFormResolver,
    InvoiceResolver,
    changeRequestResolver,
    leadsResolver,
    opportunityResolver,
    requirementFormResolver,
    widgetsResolver,
    quotationResolver,
    bookingFormResolver,
    designSignoffResolver,
    departmentResolver,
    smartSheetResolver,
    homescreenWgidgetResolver,
    trigerEmailResolver
  ],
});
