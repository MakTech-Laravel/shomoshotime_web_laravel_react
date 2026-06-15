export type OptionState =
  | "default"
  | "selected"
  | "correct"
  | "incorrect"
  | "correctReveal"
  | "disabled";

export function getOptionState(
  index: number,
  picked: number | null,
  correctIndex: number,
  submitted: boolean,
): OptionState {
  if (!submitted) {
    return picked === index ? "selected" : "default";
  }

  if (picked === index && picked === correctIndex) {
    return "correct";
  }

  if (picked === index && picked !== correctIndex) {
    return "incorrect";
  }

  if (index === correctIndex && picked !== correctIndex) {
    return "correctReveal";
  }

  return "disabled";
}

export const optionCardClasses: Record<OptionState, string> = {
  default: "border-[#e0e0e0] bg-white",
  selected: "border-[#b8860b] bg-[#fafafa]",
  correct: "border-[#2E7D32] bg-[#E8F5E9]",
  correctReveal: "border-[#2E7D32] bg-[#E8F5E9]",
  incorrect: "border-[#F06292] bg-[#FFEBEE]",
  disabled: "border-[#e0e0e0] bg-white",
};

export const optionRadioClasses: Record<OptionState, string> = {
  default: "border-[#bdbdbd] bg-white",
  selected: "border-[#e53935] bg-[#e53935]",
  correct: "border-[#2E7D32] bg-[#2E7D32]",
  correctReveal: "border-[#2E7D32] bg-white",
  incorrect: "border-[#F06292] bg-[#F06292]",
  disabled: "border-[#bdbdbd] bg-white",
};
