"use client";

import QuestionnaireForm, {
  type QuestionnaireFormProps,
} from "../QuestionnaireForm";
import { GET_STRONGER_PREVIEW_INPUT } from "./inactiveProductGoalContracts";

export type InactiveProductGoalPreviewProps = Pick<
  QuestionnaireFormProps,
  | "onInactiveGoalPreviewSelectionChange"
  | "onInactiveGoalPreviewResult"
>;

export default function InactiveProductGoalPreview(
  props: InactiveProductGoalPreviewProps
) {
  return <QuestionnaireForm {...props} inactiveGoalPreview={GET_STRONGER_PREVIEW_INPUT} />;
}
