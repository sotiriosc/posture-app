import type { GymConfig } from "@/lib/gymSaas/gymConfig";
import type { OperatorSignal } from "@/lib/gymSaas/operatorSignals";

export type TrainerHandoff = {
  title: string;
  priorityLabel: string;
  trainerAction: string;
  memberFacingMessage: string;
  ownerNote: string;
  ctaLabel: string;
};

const priorityLabelByPriority: Record<OperatorSignal["priority"], string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export function buildTrainerHandoff(
  signal: OperatorSignal,
  gymConfig: GymConfig
): TrainerHandoff {
  const consultLabel = gymConfig.ptConsultLabel.toLowerCase();

  switch (signal.category) {
    case "discomfort_review":
      return {
        title: "Trainer check-in recommended",
        priorityLabel: priorityLabelByPriority[signal.priority],
        trainerAction:
          "Review the member feedback and offer a trainer check-in before the next session.",
        memberFacingMessage:
          "Thanks for sharing your session feedback. You reported increased discomfort, so a trainer can check in before your next session and help you choose a comfortable next step.",
        ownerNote:
          "Member reported increased discomfort. Keep the follow-up calm and service-oriented; this is a trainer support workflow.",
        ctaLabel: "Prepare trainer check-in",
      };
    case "technique_confidence":
      return {
        title: "Form review opportunity",
        priorityLabel: priorityLabelByPriority[signal.priority],
        trainerAction:
          "Offer a form review or exercise walkthrough before the member adds difficulty.",
        memberFacingMessage:
          "Would you like a trainer to review the exercise setup or walk through the movement with you before your next session?",
        ownerNote:
          `This can be routed as a ${consultLabel} or a quick floor-support touchpoint.`,
        ctaLabel: "Prepare form review",
      };
    case "completion_support":
      return {
        title: "Supportive restart recommended",
        priorityLabel: priorityLabelByPriority[signal.priority],
        trainerAction:
          "Send a supportive restart message and keep the next session simple if needed.",
        memberFacingMessage:
          "No problem if the session did not go as planned. We can help you restart with a manageable next step.",
        ownerNote:
          "This is a retention support moment. Keep the tone encouraging and practical.",
        ctaLabel: "Prepare restart note",
      };
    case "recovery_support":
      return {
        title: "Recovery support review",
        priorityLabel: priorityLabelByPriority[signal.priority],
        trainerAction:
          "Hold intensity steady and check how the member is recovering before progressing.",
        memberFacingMessage:
          "Your feedback suggests it may be useful to keep the next session steady and check how recovery feels before progressing.",
        ownerNote:
          "This is a pacing signal for the next trainer touchpoint, not a live alert.",
        ctaLabel: "Prepare recovery check-in",
      };
    case "progress_opportunity":
      return {
        title: "Positive reinforcement opportunity",
        priorityLabel: priorityLabelByPriority[signal.priority],
        trainerAction:
          "Celebrate the completed session and invite the member to continue the next planned session.",
        memberFacingMessage:
          "Nice work completing the session. Keep going with the next planned session when you are ready.",
        ownerNote:
          "This is a light-touch encouragement moment that can support consistency.",
        ctaLabel: "Prepare encouragement note",
      };
  }
}
